"""Parse the stock workbook into a flat, normalised list (stock.json)."""
import json
import re
from pathlib import Path

import openpyxl

SRC = r"C:\Users\user\Downloads\07.10.2026 -Остатки.xlsx"
OUT = Path(__file__).parent / "stock.json"

SURF = {"MR", "PR", "LR", "SR", "LLR", "LMR", "ЛЛР", "МР", "МR", "ПР", "ЛР", "СР"}
CYR2LAT = str.maketrans({"М": "M", "Р": "R", "Л": "L", "П": "P", "С": "S", "Т": "T", "К": "K", "Г": "G", "Н": "N", "О": "O", "Е": "E", "А": "A", "В": "B", "Х": "X", "У": "Y", "м": "m", "р": "r", "л": "l", "п": "p", "с": "s"})

FACTORY = {
    "Гранитея": ("granitea", "Гранитея (ЗКС)"),
    "Китай": ("china", "Китай"),
    "Грасаро": ("grasaro", "Грасаро"),
    "Керанова": ("kerranova", "Керранова"),
    "Идальго": ("idalgo", "Идальго"),
    "Аксима": ("axima", "Аксима"),
    "Казахстан": ("kazakhstan", "Казахстан"),
    "Узбекстан": ("uzbekistan", "Узбекистан"),
    "Тянь Шань": ("tianshan", "Тянь-Шань"),
}


def size_from(name, m2):
    m = re.search(r"\(?\s*(\d{2,4}(?:[.,]\d)?)\s*[*xх×]\s*(\d{2,4}(?:[.,]\d)?)\s*\)?", name)
    if m:
        a, b = (float(x.replace(",", ".")) for x in m.groups())
        if a < 10:  # 1,2*0,295 style
            a, b = a * 1000, b * 1000
        if a > 1000 and b > 100 and a % 10 == 0 and "598" not in name and "580" not in name:
            pass
        a, b = int(round(a)), int(round(b))
        if a < b:
            a, b = b, a
        return f"{a}×{b}"
    return {0.36: "600×600", 0.72: "1200×600", 0.24: "1200×200", 0.32: "800×400", 0.34: "580×580"}.get(round(m2 or 0, 3), "")


def main():
    wb = openpyxl.load_workbook(SRC, data_only=True)
    out = []
    for ws in wb.worksheets:
        key, factory_name = FACTORY.get(ws.title.strip(), (ws.title, ws.title))
        for r in ws.iter_rows(min_row=2, values_only=True):
            vals = list(r)
            if len(vals) < 5:
                continue
            _, name, per_m2, pcs, m2 = vals[:5]
            if not isinstance(name, str) or not name.strip():
                continue
            if not isinstance(pcs, (int, float)):
                continue
            notes = " ".join(str(v) for v in vals[5:] if isinstance(v, str)).strip()
            raw = re.sub(r"\s+", " ", name).strip()
            latin = raw.translate(CYR2LAT)
            code_m = re.match(r"^(?:ГР\s*)?([A-Z]{1,3})[\s\-]?(\d{2,5})\b", latin)
            code = f"{code_m.group(1)}{code_m.group(2)}" if code_m else ""
            sm = re.search(r"\b(LLR|LMR|MR|PR|LR|SR)\b", latin.upper())
            surf = sm.group(1) if sm else ""
            out.append(
                {
                    "sheet": ws.title.strip(),
                    "factory": key,
                    "factoryName": factory_name,
                    "raw": raw,
                    "code": code,
                    "surface": surf,
                    "size": size_from(raw, per_m2),
                    "m2PerPiece": round(float(per_m2), 3) if isinstance(per_m2, (int, float)) else None,
                    "pcs": int(pcs),
                    "m2": round(float(m2), 2) if isinstance(m2, (int, float)) else round(int(pcs) * float(per_m2 or 0), 2),
                    "note": notes,
                }
            )
    OUT.write_text(json.dumps(out, ensure_ascii=False, indent=1), encoding="utf-8")
    inst = [x for x in out if x["pcs"] > 0]
    print("rows:", len(out), "in stock:", len(inst))
    by = {}
    for x in inst:
        by[x["factory"]] = by.get(x["factory"], 0) + 1
    print(by)


if __name__ == "__main__":
    main()
