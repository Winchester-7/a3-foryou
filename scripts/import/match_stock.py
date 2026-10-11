"""Match stock rows to scraped manufacturer products. Writes matched.json + prints a report."""
import json
import re
from difflib import SequenceMatcher
from pathlib import Path

SP = Path(__file__).parent
stock = json.loads((SP / "stock.json").read_text(encoding="utf-8"))
raw = json.loads((SP / "tiles_raw.json").read_text(encoding="utf-8"))


def norm_ru(s: str) -> str:
    s = s.lower().replace("ё", "е")
    s = re.sub(r"\(.*?\)", " ", s)
    s = re.sub(r"\b(llr|lmr|mr|pr|lr|sr|ллр|мр|пр|лр|ср)\b", " ", s)
    s = re.sub(r"\b(t|т|tk|тк|tc|тс|m|tn|т-к|т-n|tkk)[\-\s]?\w*\d+\w*\b", " ", s)
    s = re.sub(r"\d+[.,]?\d*\s*[*xх×]\s*\d+[.,]?\d*", " ", s)
    s = re.sub(r"[^a-zа-я0-9 ]+", " ", s)
    s = (
        s.replace("классик", "класик")
        .replace("класс ", "класик ")
        .replace("бейдж", "беж")
        .replace("бежевый", "беж")
        .replace("вуд.", "вуд ")
        .replace("сов бейдж", "беж")
    )
    for a, b in [
        ("вайт", "белый"), ("блек", "черный"), ("олив ", "оливковый "), ("лайт", "светлый"), ("грей", "серый"),
        ("дарк", "темный"), ("перл ", "жемчуг "), ("натурал", "натура"), ("браун", "коричневый"),
        ("арабеско", "арабеска"), ("верд", "зеленый"), ("каролина", "королина"), ("доломинти", "доломиты"),
        ("сасс", "сас"), ("ардженто", "серебряный"), ("стоун цемент", "цемент"),
    ]:
        s = s.replace(a, b)
    return re.sub(r"\s+", " ", s).strip()


def code_of(s: str, letter: str) -> str:
    m = re.search(rf"{letter}[\s\-]?0*(\d{{1,5}})", s, re.I)
    return f"{letter}{m.group(1)}" if m else ""


# ---- indexes -------------------------------------------------------------------
ker, seen = {}, set()
for x in raw["kerranova"]:
    if x["url"] in seen:
        continue
    seen.add(x["url"])
    c = code_of(x["title"], "K")
    if c:
        ker.setdefault(c, x)

gra, seen = {}, set()
for x in raw["grasaro"]:
    if x["url"] in seen:
        continue
    seen.add(x["url"])
    c = code_of(x["title"], "G")
    if c:
        gra.setdefault(c, x)

ural_by_code, ural_idalgo = {}, []
for x in raw["uralgres"]:
    en, ru = x.get("en", ""), x["title"]
    cm = re.match(r"^(?:ГР\s*)?G?[\s\-]?0*(\d{2,4})\b", ru) or re.match(r"^G[\s\-]?0*(\d{2,4})", en)
    if x["brandPath"] == "granitea":
        m = re.match(r"^G\s?0*(\d{2,4})", en) or re.match(r"^ГР\s?0*(\d{2,4})", ru)
        if m:
            ural_by_code.setdefault(f"G{m.group(1)}", x)
    elif x["brandPath"] == "idalgo":
        ural_idalgo.append(x)

ural_any = {}
for x in raw["uralgres"]:
    k = re.sub(r"[^A-Z0-9]", "", x.get("en", "").upper())
    if k:
        ural_any.setdefault(k, x)


def compact(s: str) -> str:
    s = s.translate(str.maketrans({"У": "U", "Р": "R", "Ф": "F", "П": "P", "Г": "G", "М": "M"}))
    m = re.match(r"^\s*(UP|UF|U|G)[\s\-]*0*(\d{2,4})", s.upper())
    return f"{m.group(1)}{int(m.group(2)):03d}" if m else ""


print("index sizes: kerranova", len(ker), "grasaro", len(gra), "granitea", len(ural_by_code), "idalgo", len(ural_idalgo))


def best_idalgo(name: str):
    n = norm_ru(name)
    best, score = None, 0.0
    for x in ural_idalgo:
        t = norm_ru(x["title"])
        r = SequenceMatcher(None, n, t).ratio()
        # bonus when all tokens of the shorter side are contained in the longer
        a, b = set(n.split()), set(t.split())
        if a and b and (a <= b or b <= a):
            r = max(r, 0.9)
        if r > score:
            best, score = x, r
    return best, score


report = {"matched": 0, "unmatched": []}
out = []
for row in stock:
    if row["pcs"] <= 0:
        continue
    f, hit, how = row["factory"], None, ""
    if f == "kerranova" and row["code"] in ker:
        hit, how = ker[row["code"]], "code"
    elif f == "grasaro" and row["code"] in gra:
        hit, how = gra[row["code"]], "code"
    elif f == "granitea":
        c2 = compact(row["raw"].translate(str.maketrans({"Г": "G", "Р": "R"}))) if False else compact(row["raw"])
        hit = ural_by_code.get(row["code"]) or ural_by_code.get(c2) or ural_any.get(c2)
        if not hit and row["raw"].upper().startswith("ГР"):
            hit = ural_by_code.get("G" + re.sub(r"\D", "", row["raw"])[:3])
        how = "code" if hit else ""
        if not hit and row["code"] in gra:
            hit, how = gra[row["code"]], "code-grasaro"
    elif f == "idalgo":
        hit, sc = best_idalgo(row["raw"])
        if hit and sc >= 0.62:
            how = f"name:{sc:.2f}"
        else:
            if hit:
                row["_nearest"] = f"{hit['title']} ({sc:.2f})"
            hit = None
    row["match"] = {"how": how, **({"source": hit["source"], "url": hit["url"], "title": hit["title"]} if hit else {})}
    out.append({**row, "_hit": hit})
    if hit:
        report["matched"] += 1
    else:
        report["unmatched"].append(row)

(SP / "matched.json").write_text(json.dumps(out, ensure_ascii=False, indent=1), encoding="utf-8")
print("in-stock rows:", len(out), "matched:", report["matched"])
by = {}
for r in report["unmatched"]:
    by.setdefault(r["factory"], []).append(r)
for k, v in by.items():
    print(f"-- unmatched {k}: {len(v)}")
    for r in v:
        print("     ", r["raw"], "|", r.get("_nearest", ""))
