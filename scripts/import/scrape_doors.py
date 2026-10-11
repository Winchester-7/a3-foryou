"""Collect entrance + interior doors from dverrr.ru (models, specs, photos)."""
import io
import json
import re
import time
from concurrent.futures import ThreadPoolExecutor
from pathlib import Path

import requests
from bs4 import BeautifulSoup
from PIL import Image

SP = Path(__file__).parent
SITE = Path(r"C:\Users\user\code\a3-foryou")
IMG_DIR = SITE / "public" / "doors2"
OUT = SP / "doors_raw.json"
UA = {"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/124 Safari/537.36"}
S = requests.Session()
S.headers.update(UA)
BASE = "https://dverrr.ru"
LABELS = {
    "Покрытие": "coating", "Цвет": "color", "Стиль": "style", "Коллекции": "collection", "Ширина, мм": "width",
    "Высота, мм": "height", "Толщина, мм": "thickness", "Внутренний состав": "core", "Остекление": "glazing",
    "Тип стекла": "glass", "Тип": "type", "Материал": "material", "Страна": "country", "Производитель": "maker",
    "Утепление": "insulation", "Количество замков": "locks", "Цвет снаружи": "color_out", "Цвет внутри": "color_in",
    "Отделка": "finish", "Толщина полотна, мм": "thickness", "Толщина металла, мм": "metal", "Размер коробки": "frame",
}


CACHE = SP / "door_cache"
CACHE.mkdir(exist_ok=True)


def get(url, tries=3):
    key = CACHE / (re.sub(r"[^A-Za-z0-9]+", "_", url)[-120:] + ".html")
    if key.exists() and key.stat().st_size > 0:
        return key.read_text(encoding="utf-8")
    html = _fetch(url, tries)
    if html:
        key.write_text(html, encoding="utf-8")
    time.sleep(0.6)
    return html


def _fetch(url, tries=3):
    for i in range(tries):
        try:
            r = S.get(url, timeout=60)
            r.encoding = "utf-8"
            if r.status_code == 200:
                return r.text
            if r.status_code in (404, 410):
                return None
        except requests.RequestException:
            pass
        time.sleep(1.5 * (i + 1))
    return None


def sitemap_urls():
    idx = get(f"{BASE}/sitemap.xml") or ""
    urls = []
    for m in re.findall(r"<loc>(.*?)</loc>", idx):
        if re.search(r"iblock-(5|7)\.xml", m):
            x = get(m) or ""
            urls += re.findall(r"<loc>(.*?)</loc>", x)
    return [u for u in urls if re.match(rf"^{BASE}/(doors|interior-doors)/[^/]+/$", u)]


def parse(url, html):
    s = BeautifulSoup(html, "lxml")
    h1 = s.find("h1")
    if not h1:
        return None
    title = h1.get_text(" ", strip=True)
    lines = [l for l in s.get_text("\n", strip=True).split("\n") if l.strip()]
    if not any("Купить в 1 клик" in l for l in lines):
        return None
    # start at the second occurrence of the title (first is the breadcrumb)
    idxs = [i for i, l in enumerate(lines) if l == title]
    start = idxs[1] if len(idxs) > 1 else (idxs[0] if idxs else 0)
    props = {}
    i = start
    end = next((j for j in range(start, len(lines)) if lines[j].startswith("Дополнительная информация") or lines[j].startswith("Показать все")), start + 80)
    while i < end:
        l = lines[i].rstrip()
        if l.endswith(":") and l[:-1] in LABELS and i + 1 < end:
            props[LABELS[l[:-1]]] = lines[i + 1].strip()
            i += 2
            continue
        i += 1
    ratings = {}
    for lab, key in (("Шумоизоляция", "noise"), ("Износостойкость", "wear"), ("Влагостойкость:", "moist")):
        for j, l in enumerate(lines[start:end]):
            if l == lab and j + 1 < len(lines[start:end]):
                ratings[key] = lines[start:end][j + 1]
    # images: original (not the 197x435 thumbnail)
    imgs = []
    for m in re.findall(r"/upload/(?:resize_cache/)?iblock/[^\"' )<>]+\.(?:jpg|jpeg|png|webp)", html):
        mm = re.match(r"/upload/resize_cache/(iblock/[0-9a-f]+/(?:[0-9a-z]+/)?)\d+_\d+_\d+/(.+)$", m)
        full = f"{BASE}/upload/{mm.group(1)}{mm.group(2)}" if mm else f"{BASE}{m}"
        if full not in imgs and "30_70" not in m:
            imgs.append(full)
    kind = "entrance" if "/doors/" in url else "interior"
    return {"url": url, "slug": url.rstrip("/").split("/")[-1], "kind": kind, "title": title, "props": props, "ratings": ratings, "images": imgs[:3]}


def save(url, dest, max_side=1100):
    if dest.exists() and dest.stat().st_size > 0:
        return True
    try:
        r = S.get(url, timeout=40)
        if r.status_code != 200:
            return False
        im = Image.open(io.BytesIO(r.content)).convert("RGB")
    except Exception:
        return False
    if max(im.size) > max_side:
        k = max_side / max(im.size)
        im = im.resize((round(im.width * k), round(im.height * k)), Image.LANCZOS)
    dest.parent.mkdir(parents=True, exist_ok=True)
    im.save(dest, "JPEG", quality=80, optimize=True, progressive=True)
    return True


def work(u):
    html = get(u)
    if not html:
        return None
    d = parse(u, html)
    if not d:
        return None
    saved = []
    for k, iu in enumerate(d["images"][:2], 1):
        rel = f"doors2/{d['slug']}-{k}.jpg"
        if save(iu, SITE / "public" / rel):
            saved.append("/" + rel)
    d["files"] = saved
    return d


if __name__ == "__main__":
    urls = sitemap_urls()
    print("candidate pages:", len(urls), flush=True)
    out = []
    with ThreadPoolExecutor(max_workers=3) as ex:
        for n, d in enumerate(ex.map(work, urls), 1):
            if d:
                out.append(d)
            if n % 40 == 0:
                print(f"  {n}/{len(urls)} kept={len(out)}", flush=True)
    OUT.write_text(json.dumps(out, ensure_ascii=False, indent=1), encoding="utf-8")
    print("doors:", len(out), "entrance:", sum(1 for d in out if d["kind"] == "entrance"), flush=True)
