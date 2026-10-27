"""Toma capturas de página completa (escritorio 1440px y móvil 390px).
Uso: python3 -m http.server 8765 --directory .  (en otra terminal)
     python3 scripts/capturas.py
"""
import os
from playwright.sync_api import sync_playwright

URL = os.environ.get("URL", "http://localhost:8765/")
OUT = os.path.join(os.path.dirname(__file__), "..", "capturas")
CHROME = os.environ.get("CHROME", "/usr/bin/google-chrome")

with sync_playwright() as p:
    b = p.chromium.launch(executable_path=CHROME, args=["--no-sandbox"])
    for name, w, h, mobile in [("desktop", 1440, 900, False), ("movil", 390, 844, True)]:
        ctx = b.new_context(viewport={"width": w, "height": h}, device_scale_factor=1 if not mobile else 2,
                            is_mobile=mobile, has_touch=mobile, locale="es-DO")
        pg = ctx.new_page()
        errs = []
        pg.on("console", lambda m: errs.append(m.text) if m.type == "error" else None)
        pg.on("pageerror", lambda e: errs.append(str(e)))
        pg.goto(URL, wait_until="networkidle")
        pg.screenshot(path=os.path.join(OUT, f"{name}.png"), full_page=True)
        sw = pg.evaluate("document.documentElement.scrollWidth")
        print(name, "scrollWidth", sw, "errores:", errs)
        ctx.close()
    b.close()
