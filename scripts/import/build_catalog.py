"""Build src/data/tiles.json + public/tiles/** from matched stock rows."""
import io
import json
import re
import shutil
import sys
import time
from collections import OrderedDict, defaultdict
from pathlib import Path

import requests
from PIL import Image

SP = Path(__file__).parent
SITE = Path(r"C:\Users\user\code\a3-foryou")
OUT_DIR = SITE / "public" / "tiles"
DATA = SITE / "src" / "data" / "tiles.json"
CACHE = SP / "img_cache"
CACHE.mkdir(exist_ok=True)

UA = {"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/124 Safari/537.36"}
S = requests.Session()
S.headers.update(UA)

SURF = {"MR": "Матовая", "LLR": "Лаппатированная", "LR": "Лаппатированная", "PR": "Полированная", "SR": "Структурная", "LMR": "Мягкая матовая"}
BRAND_OF_FACTORY = {
    "idalgo": "idalgo", "granitea": "granitea", "grasaro": "grasaro", "kerranova": "kerranova",
    "china": "china", "axima": "axima", "kazakhstan": "kazakhstan", "uzbekistan": "uzbekistan", "tianshan": "tianshan",
}

matched = json.loads((SP / "matched.json").read_text(encoding="utf-8"))
raw = json.loads((SP / "tiles_raw.json").read_text(encoding="utf-8"))

# ---- known collection names from the previous hand-made catalog ---------------
known = {
    "wood-classic": ("Wood Classic", "Вуд Классик"),
    "ural-facades": ("Ural Facades", "Уральские фасады"),
    "ural-palette": ("Ural Palette", "Уральская палитра"),
    "ural-standart": ("Standart", "Стандарт"),
    "standart": ("Standart", "Стандарт"),
}
old = (SITE / "src" / "lib" / "collections.ts").read_text(encoding="utf-8")
for m in re.finditer(r"slug: '([a-z0-9\-]+)', name: '([^']+)', nameRu: '([^']+)'", old):
    known[m.group(1)] = (m.group(2), m.group(3))


def slugify(s: str) -> str:
    tr = {"а": "a", "б": "b", "в": "v", "г": "g", "д": "d", "е": "e", "ё": "e", "ж": "zh", "з": "z", "и": "i", "й": "y", "к": "k",
          "л": "l", "м": "m", "н": "n", "о": "o", "п": "p", "р": "r", "с": "s", "т": "t", "у": "u", "ф": "f", "х": "h", "ц": "c",
          "ч": "ch", "ш": "sh", "щ": "sch", "ъ": "", "ы": "y", "ь": "", "э": "e", "ю": "yu", "я": "ya"}
    s = "".join(tr.get(ch, ch) for ch in s.lower())
    return re.sub(r"[^a-z0-9]+", "-", s).strip("-")


def norm_size(s: str) -> str:
    if s in ("195×120", "120×195"):
        return "1200×195"
    m = re.match(r"^(\d+(?:\.\d+)?)×(\d+(?:\.\d+)?)$", s or "")
    if not m:
        return s or ""
    a, b = float(m.group(1)), float(m.group(2))
    if a < 10:
        a, b = a * 1000, b * 1000
    elif a <= 200 and b <= 200 and b != 195:
        a, b = a * 10, b * 10
    elif b == 195 or a <= 200:
        a = a * 10 if a <= 200 else a
    a, b = int(round(a)), int(round(b))
    if a < b:
        a, b = b, a
    return f"{a}×{b}"


KER_LOOK = {}
for _l, _names in {
    "marble": "Белое Озеро,Бутик,Каньон,Айсберг,Марбл Тренд,Мгновение,Сияние снов,Скала,Пробуждение,Усадьба,Оникс,Мороз и Солнце",
    "stone": "Берег,Градиент,Кратер,Монохром,Монтана,Харизма,По Душам,Мурашки,Темперамент,Дыхание,Нью Стоун,Гранито",
    "concrete": "Централ Парк,Элеватор,Этажи,Фабрика,Молекула,Наедине,Гранелла,Бетон,Домино",
    "wood": "Аллея,Босиком,Дубрава,Мадера,Искусство,Сатин,Ветро,Квинз,Хоум Вуд,Италиан Вуд",
}.items():
    for _n in _names.split(","):
        KER_LOOK[_n.strip().lower()] = _l


def look_of(text: str, default="stone") -> str:
    t = text.lower()
    if re.search(r"мрамор|marble|оникс|onyx|calacatta|statuario|калакатт", t):
        return "marble"
    if re.search(r"дерев|wood|вуд|дуб|oak", t):
        return "wood"
    if re.search(r"бетон|beton|concrete|цемент|cement|микроцемент", t):
        return "concrete"
    if re.search(r"металл|loft|лофт|corten|кортен|rust", t):
        return "loft"
    if re.search(r"фасад", t):
        return "facade"
    if re.search(r"техническ|соль|моноколор|палитра|palette", t):
        return "technical"
    return default


def dl(url: str):
    key = re.sub(r"[^A-Za-z0-9]+", "_", url)[-150:]
    f = CACHE / (key + ".bin")
    if f.exists():
        return f.read_bytes()
    for i in range(3):
        try:
            r = S.get(url, timeout=40)
            if r.status_code == 200 and r.content:
                f.write_bytes(r.content)
                return r.content
            if r.status_code in (403, 404):
                return None
        except requests.RequestException:
            pass
        time.sleep(1.2 * (i + 1))
    return None


def save_image(url: str, dest: Path, max_side=1400):
    data = dl(url)
    if not data:
        return False
    try:
        im = Image.open(io.BytesIO(data)).convert("RGB")
    except Exception:
        return False
    if max(im.size) > max_side:
        k = max_side / max(im.size)
        im = im.resize((round(im.width * k), round(im.height * k)), Image.LANCZOS)
    dest.parent.mkdir(parents=True, exist_ok=True)
    im.save(dest, "JPEG", quality=82, optimize=True, progressive=True)
    return True


def orig_url(u: str) -> str:
    m = re.match(r"(.*)/upload/resize_cache/(iblock/[0-9a-f]+)/\d+_\d+_\d+/(.+)$", u)
    return f"{m.group(1)}/upload/{m.group(2)}/{m.group(3)}" if m else u


def pick_uralgres_images(item, limit=4):
    """First image per size folder, then the next ones of the biggest format."""
    by_size = OrderedDict()
    for u in item.get("images", []):
        m = re.search(r"/(\d+x\d+)/[^/]*_(\d+)\.(?:jpg|jpeg|png)$", u)
        if m:
            by_size.setdefault(m.group(1), []).append(u)
    picked = []
    for size, lst in by_size.items():
        picked.append(lst[0])
    big = max(by_size, key=lambda s: int(s.split("x")[0]) * int(s.split("x")[1])) if by_size else None
    if big:
        for u in by_size[big][1:]:
            if len(picked) >= limit:
                break
            picked.append(u)
    if not picked:
        picked = item.get("images", [])[:limit]
    return picked[:limit]


# ---- group stock rows into products ------------------------------------------------
products = OrderedDict()  # key -> dict
for row in matched:
    hit = row.get("_hit")
    f = row["factory"]
    brand = BRAND_OF_FACTORY.get(f, f)
    if hit and hit["source"] == "uralgres" and hit.get("brandPath") == "ural-granite":
        brand = "uralgranit"
    key = (hit["url"] if hit else f"{f}:{re.sub(r'[^a-zA-Zа-яА-Я0-9]+', '', row['raw'].lower())[:40]}")
    # same decor in several surfaces/sizes has the same key
    if not hit:
        base = re.sub(r"\(.*?\)|\b(MR|PR|LR|SR|LLR|LMR)\b|т-?\d+\w*|t-?\d+\w*", "", row["raw"], flags=re.I)
        key = f"{f}:{re.sub(r'[^a-zA-Zа-яА-Я0-9]+', '', base.lower())}"
    p = products.setdefault(key, {"brand": brand, "factory": f, "hit": hit, "rows": [], "raw": row["raw"], "code": row["code"]})
    p["rows"].append(row)

print("products:", len(products))

# ---- build product + collection structures ------------------------------------------
collections = OrderedDict()


def collection_for(p):
    hit = p["hit"]
    brand = p["brand"]
    if hit and hit["source"] == "uralgres":
        cslug = hit["collection"]
        key = f"{brand}:{cslug}"
        base = known.get(cslug)
        if base:
            name, ru = base
        else:
            name = cslug.replace("-", " ").title()
            first = re.sub(r"^(?:ГР|УП|УФ|У|G|UP|UF|U)\s?\d+\s*", "", hit["title"]).split()
            ru = first[0] if first else name
        look = {"ural-facades": "facade", "ural-palette": "technical", "standart": "technical", "reinforced": "technical"}.get(cslug) \
            or look_of((hit.get("look") or "") + " " + ru + " " + name)
        return key, cslug, name, ru, look
    if hit and hit["source"] in ("kerranova", "grasaro"):
        cslug = f"{hit['source']}-{hit['collection']}"
        ru = re.sub(r"\s*[KG]-?\s?\d+\s*$", "", hit["title"]).strip() or hit["collection"].title()
        name = hit["collection"].replace("_", " ").replace("-", " ").title()
        look = KER_LOOK.get(ru.lower()) or look_of(ru + " " + name + " " + hit["collection"])
        return f"{brand}:{cslug}", cslug, name, ru, look
    # no site match -> one collection per factory
    names = {
        "china": ("China", "Китай"), "axima": ("Axima", "Аксима"), "kazakhstan": ("Kazakhstan", "Казахстан"),
        "uzbekistan": ("Uzbekistan", "Узбекистан"), "tianshan": ("Tian Shan", "Тянь-Шань"),
        "kerranova": ("Kerranova", "Керранова"), "grasaro": ("Grasaro", "Грасаро"), "granitea": ("Granitea", "Гранитея"),
        "idalgo": ("Idalgo", "Идальго"),
    }
    n, ru = names.get(p["factory"], (p["factory"].title(), p["factory"].title()))
    cslug = f"{p['factory']}-stock"
    return f"{brand}:{cslug}", cslug, n, ru, "stone"


def pretty_unmatched_name(raw_name: str) -> str:
    s = re.sub(r"\(.*?\)", " ", raw_name)
    s = re.sub(r"\b(MR|PR|LR|SR|LLR|LMR)\b", " ", s)
    return re.sub(r"\s+", " ", s).strip(" *")


for key, p in products.items():
    hit = p["hit"]
    ckey, cslug, cname, cru, clook = collection_for(p)
    col = collections.setdefault(
        ckey,
        {
            "slug": cslug, "name": cname, "nameRu": cru, "brand": p["brand"], "look": clook,
            "sizes": [], "surfaces": [], "thickness": "10 мм", "applications": [], "tagline": "", "description": "",
            "hero": "", "gallery": [], "swatches": [], "products": [],
        },
    )
    # stock entries
    stock = []
    for r in p["rows"]:
        stock.append({"size": norm_size(r["size"]), "surface": SURF.get(r["surface"], r["surface"] or ""), "pcs": r["pcs"], "m2": r["m2"], "label": r["raw"]})
    merged = OrderedDict()
    for s in stock:
        k = (s["size"], s["surface"])
        if k in merged:
            merged[k]["pcs"] += s["pcs"]
            merged[k]["m2"] = round(merged[k]["m2"] + s["m2"], 2)
        else:
            merged[k] = dict(s)
    stock = list(merged.values())
    sizes = sorted({s["size"] for s in stock if s["size"]}, key=lambda z: -int(z.split("×")[0]))
    surfaces = sorted({s["surface"] for s in stock if s["surface"]})

    if hit and hit["source"] == "uralgres":
        title = hit["title"]
        article = None
        m = re.match(r"^((?:ГР|УП|УФ|У|АртБ)\s?\d+\w*)\s+(.*)$", title)
        if m:
            nameRu = m.group(2).strip()
            article = (hit.get("en", "").split(" ")[0] or m.group(1)).upper()
        else:
            nameRu = title
        name = re.sub(r"^[A-Za-z]{1,4}\d+\s+", "", hit.get("en", "")) or nameRu
        color = nameRu.split()[-1] if nameRu else ""
        pslug = slugify(hit["slug"])
        urls = pick_uralgres_images(hit)
    elif hit:
        title = hit["title"]
        article = re.search(r"[KG]-?\s?\d+", title).group(0).replace(" ", "").replace("-", "") if re.search(r"[KG]-?\s?\d+", title) else None
        nameRu = title
        name = re.sub(r"[А-Яа-яЁё]+", "", title).strip() or title
        color = hit.get("color", "").split("/")[0].strip()
        pslug = slugify(f"{hit['source']}-{article or title}")
        urls = [orig_url(hit["image"])]
        # more faces from the product page
        page = None
        try:
            rr = S.get(hit["url"], timeout=30)
            rr.encoding = "utf-8"
            page = rr.text
        except requests.RequestException:
            pass
        if page:
            for u in re.findall(r"(?:src|href)=\"(/upload/(?:iblock|resize_cache/iblock)/[^\"]+\.(?:jpg|jpeg|png))\"", page):
                if re.search(r"/(?:110_110|30_70|50_50|100_100)", u):
                    continue
                full = orig_url(("https://kerranova.ru" if hit["source"] == "kerranova" else "https://grasaro.ru") + u)
                if full not in urls:
                    urls.append(full)
                if len(urls) >= 4:
                    break
    else:
        nameRu = pretty_unmatched_name(p["raw"])
        name = nameRu
        article = p["code"] or None
        color = ""
        pslug = slugify(f"{p['factory']}-{nameRu}")
        urls = []

    # download photos
    saved = []
    for i, u in enumerate(urls[:4], 1):
        rel = f"tiles/{cslug}/{pslug}-{i}.jpg"
        if save_image(u, SITE / "public" / rel):
            saved.append("/" + rel)
    if not saved:
        # fall back to the old hand-made catalog photography when the slug is known
        pass

    product = {
        "slug": pslug,
        "name": name,
        "nameRu": nameRu,
        "color": color,
        "article": article,
        "sizes": sizes,
        "surfaces": surfaces,
        "image": saved[0] if saved else "",
        "images": saved,
        "stock": stock,
        "noPhoto": not saved,
        "source": hit["url"] if hit else "",
    }
    col["products"].append(product)

# ---- finish collections ---------------------------------------------------------------
APPS = {
    "marble": ["Гостиные", "Ванные комнаты", "Кухни", "Прихожие", "Коммерческие интерьеры", "Входные группы"],
    "stone": ["Гостиные", "Ванные комнаты", "Кухни", "Террасы", "Коммерческие интерьеры", "Входные группы"],
    "wood": ["Гостиные", "Спальни", "Ванные комнаты", "Кухни", "Террасы", "Тёплый пол"],
    "loft": ["Гостиные", "Ванные комнаты", "Кухни", "Коммерческие интерьеры"],
    "concrete": ["Гостиные", "Ванные комнаты", "Кухни", "Коммерческие интерьеры"],
    "facade": ["Вентилируемые фасады", "Входные группы", "Коммерческие здания", "Цоколь"],
    "technical": ["Помещения с высокой проходимостью", "Производственные помещения", "Лестницы и ступени", "Входные группы", "Террасы"],
}
BRAND_TXT = {
    "idalgo": "IDALGO", "granitea": "GRANITEA", "uralgranit": "Уральский Гранит", "grasaro": "GRASARO", "kerranova": "KERRANOVA",
    "china": "Китай", "axima": "Аксима", "kazakhstan": "Казахстан", "uzbekistan": "Узбекистан", "tianshan": "Тянь-Шань",
}
final = []
for col in collections.values():
    prods = col["products"]
    col["sizes"] = sorted({s for p in prods for s in p["sizes"]}, key=lambda z: -int(z.split("×")[0]) if "×" in z else 0)
    col["surfaces"] = sorted({s for p in prods for s in p["surfaces"]})
    col["applications"] = APPS.get(col["look"], APPS["stone"])
    if any("Структур" in s for s in col["surfaces"]) and "Террасы" not in col["applications"]:
        col["applications"] = col["applications"] + ["Террасы"]
    photos = [p for p in prods if p["image"]]
    col["hero"] = photos[0]["image"] if photos else ""
    col["gallery"] = [i for p in photos for i in p["images"][:1]][:6]
    col["swatches"] = [p["image"] for p in photos][:8]
    total = sum(s["m2"] for p in prods for s in p["stock"])
    col["tagline"] = f"{BRAND_TXT.get(col['brand'], col['brand'])} · {', '.join(col['sizes'])} мм" if col["sizes"] else BRAND_TXT.get(col["brand"], "")
    col["stockM2"] = round(total, 1)
    final.append(col)

# interior photography from the manufacturer catalogues (kept for collections that are in stock)
OLD_IMG = json.loads((SITE / "src" / "lib" / "catalog-images.json").read_text(encoding="utf-8")) if (SITE / "src" / "lib" / "catalog-images.json").exists() else {}
for col in final:
    entry = OLD_IMG.get(col["slug"])
    if not entry:
        continue
    srcs = ([entry["hero"]] if entry.get("hero") else []) + list(entry.get("gallery", []))
    copied = []
    for i, rel in enumerate(srcs):
        src = SITE / "public" / rel.lstrip("/")
        if not src.exists():
            continue
        name = "interior-hero.jpg" if i == 0 and entry.get("hero") else f"interior-{i}.jpg"
        dst = SITE / "public" / "tiles" / col["slug"] / name
        dst.parent.mkdir(parents=True, exist_ok=True)
        shutil.copyfile(src, dst)
        copied.append(f"/tiles/{col['slug']}/{name}")
    if copied:
        col["hero"] = copied[0]
        col["gallery"] = copied
final.sort(key=lambda c: (-c["stockM2"]))
DATA.parent.mkdir(parents=True, exist_ok=True)
DATA.write_text(json.dumps({"generated": time.strftime("%Y-%m-%d"), "collections": final}, ensure_ascii=False, indent=1), encoding="utf-8")
n_prod = sum(len(c["products"]) for c in final)
n_photo = sum(1 for c in final for p in c["products"] if p["image"])
print("collections:", len(final), "products:", n_prod, "with photo:", n_photo)


PORT = SITE / "src" / "data" / "portfolio.json"
if not PORT.exists() or PORT.read_text(encoding="utf-8").strip() in ("", "[]"):
    projects = []
    for col in final:
        if len(col["gallery"]) >= 1 and col["hero"].startswith("/tiles/") and "interior" in col["hero"]:
            projects.append({
                "slug": f"interer-{col['slug']}",
                "title": f"Коллекция «{col['nameRu']}» в интерьере",
                "subtitle": f"{BRAND_TXT.get(col['brand'], col['brand'])} · {', '.join(col['sizes'])} мм",
                "description": "",
                "kind": {"marble": "Мрамор", "stone": "Камень", "wood": "Дерево", "loft": "Лофт", "concrete": "Бетон"}.get(col["look"], "Интерьер"),
                "collections": [col["slug"]],
                "cover": col["hero"],
                "gallery": col["gallery"][:6],
            })
        if len(projects) >= 9:
            break
    PORT.write_text(json.dumps(projects, ensure_ascii=False, indent=1) + "\n", encoding="utf-8")
    print("portfolio projects:", len(projects))
