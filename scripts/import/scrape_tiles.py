"""Collect product models + photo URLs from the three manufacturer sites.

Output: scratchpad/tiles_raw.json  (list of dicts)
Only metadata + image URLs are stored here; photo files are downloaded in a
later step, and only for models that match the stock list.
"""
import json
import re
import sys
import time
from pathlib import Path
from urllib.parse import urljoin

import requests
from bs4 import BeautifulSoup

OUT = Path(__file__).parent / "tiles_raw.json"
UA = {"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/124 Safari/537.36"}
S = requests.Session()
S.headers.update(UA)


def get(url, tries=3):
    for i in range(tries):
        try:
            r = S.get(url, timeout=30)
            r.encoding = "utf-8"
            if r.status_code == 200:
                return r.text
            if r.status_code in (404, 410):
                return None
        except requests.RequestException:
            pass
        time.sleep(1.5 * (i + 1))
    return None


def soup(html):
    return BeautifulSoup(html, "lxml")


def original_url(u):
    """/upload/resize_cache/iblock/74c/600_600_1/x.jpg -> /upload/iblock/74c/x.jpg"""
    m = re.match(r"(.*)/upload/resize_cache/(iblock/[0-9a-f]+)/\d+_\d+_\d+/(.+)$", u)
    return f"{m.group(1)}/upload/{m.group(2)}/{m.group(3)}" if m else u


# --------------------------------------------------------------------------
#  Bitrix sites: kerranova.ru / grasaro.ru
# --------------------------------------------------------------------------

def scrape_bitrix(base, brand):
    items = []
    html = get(base + "/collections/")
    if not html:
        print("cannot open", base, file=sys.stderr)
        return items
    s = soup(html)
    colls = []
    for a in s.find_all("a", href=True):
        h = a["href"].split("?")[0].split("#")[0]
        m = re.match(r"^(?:https?://[^/]+)?/collections/([a-z0-9_\-]+)/?$", h)
        if m and m.group(1) not in [c[0] for c in colls]:
            colls.append((m.group(1), urljoin(base + "/", h)))
    print(brand, "collections:", len(colls))
    for slug, url in colls:
        page = get(url)
        if not page:
            continue
        ps = soup(page)
        title = ps.find("title").get_text(strip=True) if ps.find("title") else slug
        n_before = len(items)
        for t in ps.select(".catalog-article-teaser"):
            ttl = t.select_one(".catalog-article-teaser-title a") or t.select_one(".catalog-article-teaser-title")
            sub = t.select_one(".sub-title")
            a = t.find("a", href=True)
            main = t.select_one(".catalog-article-teaser-img img")
            thumbs = [im.get("src") for im in t.select(".catalog-face-item img") if im.get("src")]
            if not ttl or not main:
                continue
            items.append(
                {
                    "source": brand,
                    "collection": slug,
                    "collectionTitle": title,
                    "title": ttl.get_text(" ", strip=True),
                    "color": sub.get_text(" ", strip=True) if sub else "",
                    "url": urljoin(base + "/", a["href"]) if a else url,
                    "image": urljoin(base + "/", main.get("src")),
                    "thumbs": [urljoin(base + "/", x) for x in thumbs],
                }
            )
        print(f"  {brand}/{slug}: {len(items) - n_before}")
        time.sleep(0.4)
    return items


# --------------------------------------------------------------------------
#  uralgres.com (WordPress): IDALGO / GRANITEA / Уральский гранит
# --------------------------------------------------------------------------

def scrape_uralgres():
    sm = get("https://www.uralgres.com/product-sitemap.xml") or ""
    urls = re.findall(r"<loc>(.*?)</loc>", sm)
    urls = [u for u in urls if re.search(r"/catalog/[^/]+/[^/]+/[^/]+/$", u)]
    urls = [u for u in urls if not re.search(r"(plintus|stupen|-step|-plinth)", u)]
    print("uralgres product pages:", len(urls))
    items = []
    for i, u in enumerate(urls, 1):
        page = get(u)
        if not page:
            continue
        ps = soup(page)
        h1 = ps.find("h1")
        if not h1:
            continue
        ru = h1.get_text(" ", strip=True)
        # the English name sits in the element right after h1
        en = ""
        nxt = h1.find_next(string=True)
        sib = h1.find_next_sibling()
        for el in h1.find_all_next(limit=6):
            t = el.get_text(" ", strip=True)
            if t and t != ru and re.search(r"[A-Za-z]", t) and len(t) < 80:
                en = t
                break
        text = ps.get_text("\n", strip=True)
        surf = re.findall(r"\(([A-Z]{2,3})\)", text.split("Поверхности:")[1][:200]) if "Поверхности:" in text else []
        look = ""
        if "Дизайн:" in text:
            look = text.split("Дизайн:")[1].split("\n")[1].strip()
        imgs = []
        for im in ps.find_all("img"):
            v = im.get("data-src") or im.get("src") or ""
            if "/wp-content/uploads/catalog/" in v:
                v = v.split("?")[0]
                if v not in imgs:
                    imgs.append(v)
        parts = u.rstrip("/").split("/")
        items.append(
            {
                "source": "uralgres",
                "brandPath": parts[-3],
                "collection": parts[-2],
                "slug": parts[-1],
                "title": ru,
                "en": en,
                "look": look,
                "surfaces": surf,
                "url": u,
                "images": imgs,
            }
        )
        if i % 25 == 0:
            print(f"  uralgres {i}/{len(urls)}")
        time.sleep(0.25)
    return items


if __name__ == "__main__":
    result = {
        "kerranova": scrape_bitrix("https://kerranova.ru", "kerranova"),
        "grasaro": scrape_bitrix("https://grasaro.ru", "grasaro"),
        "uralgres": scrape_uralgres(),
    }
    OUT.write_text(json.dumps(result, ensure_ascii=False, indent=1), encoding="utf-8")
    for k, v in result.items():
        print(k, len(v))
