# Импорт каталога

Скрипты, которыми собран каталог. Запускать по порядку из этой папки
(нужен Python 3 и пакеты `requests beautifulsoup4 lxml pillow openpyxl numpy`):

| Шаг | Скрипт | Что делает |
|---|---|---|
| 1 | `parse_stock.py` | читает Excel с остатками (`SRC` в начале файла) → `stock.json` |
| 2 | `scrape_tiles.py` | собирает модели и фото с uralgres.com, kerranova.ru, grasaro.ru → `tiles_raw.json` |
| 3 | `match_stock.py` | сопоставляет строки остатков с моделями на сайтах заводов → `matched.json` |
| 4 | `build_catalog.py` | группирует в коллекции, скачивает и сжимает фото, пишет `src/data/tiles.json` |
| 5 | `scrape_doors.py` | двери с dverrr.ru (фото в `public/doors2`) → `doors_raw.json` |
| 6 | `convert_doors.py` | `doors_raw.json` → `src/data/doors.json` |

Промежуточные файлы (`*.json`, `img_cache/`, `door_cache/`) создаются рядом со скриптами
и в репозиторий не входят.
После импорта выполните `npm run data` в папке `planner/`, чтобы обновить планировщик.