"""doors_raw.json -> src/data/doors.json (DoorModel[]) and drop unused old door images."""
import json
import re
from pathlib import Path

SP = Path(__file__).parent
SITE = Path(r"C:\Users\user\code\a3-foryou")
raw = json.loads((SP / "doors_raw.json").read_text(encoding="utf-8"))

COLOR_HEX = [
    (r"бел|айс|арктик|ваниль|слонов|молоч", "#f2f0ec"),
    (r"черн|чёрн|антрацит|графит", "#2b2b2b"),
    (r"сер|бетон|стальн|асфальт", "#9a9a98"),
    (r"венге|шоколад|тёмн|темн", "#3b2f2a"),
    (r"орех", "#6b4a2f"),
    (r"ясень", "#cbb89d"),
    (r"беленый|беленый дуб|белёный|выбеленн", "#e6dfd2"),
    (r"дуб|дубовый", "#b08a62"),
    (r"каштан|махагон|вишн|бук|груш|кофе|капучино", "#8a5a3c"),
    (r"золот|мед|медь", "#c8a45c"),
    (r"красн|бордо|вишнев", "#8c2a2a"),
    (r"син|голуб", "#3f4a63"),
    (r"зелен|зелён|олив|хаки", "#6f6b49"),
    (r"беж|песо|крем|латте|кремов", "#d8ccb9"),
]


def hexof(name: str) -> str:
    n = name.lower()
    for pat, h in COLOR_HEX:
        if re.search(pat, n):
            return h
    return "#b9a38a"


def clean_name(title: str) -> str:
    t = re.sub(r"^(Межкомнатная|Входная|Раздвижная)\s+дверь\s+", "", title, flags=re.I)
    t = re.sub(r"^Дверь\s+", "", t, flags=re.I)
    return re.sub(r"\s+", " ", t).strip()


def sizes_of(props: dict, kind: str) -> list:
    ws = re.findall(r"\d{3,4}", props.get("width", ""))
    h = re.findall(r"\d{3,4}", props.get("height", ""))
    hh = h[0] if h else ("2050" if kind == "entrance" else "2000")
    return [f"{w} × {hh}" for w in ws] or [f"800 × {hh}"]


out, seen = [], set()
for d in raw:
    p = d["props"]
    name = clean_name(d["title"])
    slug = d["slug"]
    if slug in seen:
        slug = f"{d['kind']}-{slug}"
    seen.add(slug)
    files = d.get("files") or []
    glazed = bool(re.search(r"остекл|со стекл|стекл", (p.get("glazing", "") + " " + d["title"]).lower())) and not re.search(r"глух", p.get("glazing", "").lower())
    color = p.get("color") or ""
    if not color:
        m = re.search(r"\(([^)]+)\)", d["title"])
        color = m.group(1) if m else ""
    specs = []
    labels = [("coating", "Покрытие"), ("color", "Цвет"), ("style", "Стиль"), ("collection", "Серия"), ("material", "Материал"),
              ("thickness", "Толщина, мм"), ("core", "Внутренний состав"), ("glazing", "Остекление"), ("glass", "Тип стекла"),
              ("insulation", "Утепление"), ("locks", "Количество замков"), ("finish", "Отделка")]
    for k, label in labels:
        if p.get(k):
            specs.append([label, p[k]])
    kind_word = "Входная" if d["kind"] == "entrance" else "Межкомнатная"
    descr_bits = [f"{kind_word} дверь {name}."]
    if p.get("coating"):
        descr_bits.append(f"Покрытие: {p['coating'].lower()}.")
    if color:
        descr_bits.append(f"Цвет: {color.lower()}.")
    if p.get("style"):
        descr_bits.append(f"Стиль: {p['style'].lower()}.")
    descr_bits.append("Размеры и комплектацию уточняйте у менеджера.")
    out.append(
        {
            "slug": slug,
            "name": name,
            "brand": p.get("collection", ""),
            "style": p.get("style", ""),
            "types": ["ДО" if glazed else "ДГ"],
            "description": " ".join(descr_bits),
            "colors": [{"name": color or "Базовый", "hex": hexof(color or name), **({"image": files[0]} if files else {})}],
            "sizes": sizes_of(p, d["kind"]),
            "specs": specs,
            "hero": files[0] if files else "",
            "image": files[0] if files else "",
            "gallery": files,
            "kind": d["kind"],
            "source": d["url"],
        }
    )

out = [x for x in out if x["image"]]  # a door without a photo is no use in a catalogue
out.sort(key=lambda x: (x["kind"], x["brand"], x["name"]))
(SITE / "src" / "data").mkdir(parents=True, exist_ok=True)
(SITE / "src" / "data" / "doors.json").write_text(json.dumps(out, ensure_ascii=False, indent=1) + "\n", encoding="utf-8")
print("doors:", len(out), "entrance:", sum(1 for x in out if x["kind"] == "entrance"))
