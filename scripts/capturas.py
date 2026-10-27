"""Toma capturas del sitio (escritorio 1440 px y móvil 390 px).
Uso: python3 -m http.server 8765   (desde la raíz del proyecto, en otra terminal)
     python3 scripts/capturas.py
Genera en capturas/:
  desktop.png / movil.png               página completa
  desktop-hero.png / movil-hero.png     primera pantalla (header sticky + CTA del hero)
  movil-cta-fija.png                    móvil a mitad de página (barra fija "Solicitar cotización")
  movil-formulario.png                  móvil tras tocar un CTA (barra oculta, foco en el primer campo)
Además comprueba errores de JS y scroll horizontal (también a 1024 y 360 px).
"""
import os
from playwright.sync_api import sync_playwright

URL = os.environ.get("URL", "http://localhost:8765/")
OUT = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "capturas")
CHROME = os.environ.get("CHROME", "/usr/bin/google-chrome")
SHOW_ALL = "document.querySelectorAll('.reveal').forEach(e=>e.classList.add('is-visible'))"

def shot(pg, name, **kw):
    pg.screenshot(path=os.path.join(OUT, name), **kw)

with sync_playwright() as p:
    b = p.chromium.launch(executable_path=CHROME, args=["--no-sandbox"])
    for name, w, h, mobile in [("desktop", 1440, 900, False), ("movil", 390, 844, True),
                               ("tablet", 1024, 768, False), ("movil360", 360, 740, True)]:
        ctx = b.new_context(viewport={"width": w, "height": h}, device_scale_factor=2 if mobile else 1,
                            is_mobile=mobile, has_touch=mobile, locale="es-DO")
        pg = ctx.new_page()
        errs = []
        pg.on("console", lambda m: errs.append(m.text) if m.type == "error" else None)
        pg.on("pageerror", lambda e: errs.append(str(e)))
        pg.goto(URL, wait_until="networkidle")
        pg.evaluate("document.fonts.ready")
        pg.wait_for_timeout(900)
        if name in ("desktop", "movil"):
            shot(pg, f"{name}-hero.png")
            pg.evaluate(SHOW_ALL)
            pg.wait_for_timeout(900)
            shot(pg, f"{name}.png", full_page=True)
        if name == "movil":
            pg.evaluate("document.getElementById('transparencia').scrollIntoView({behavior:'instant'})")
            pg.wait_for_timeout(700)
            shot(pg, "movil-cta-fija.png")
            print("  barra visible a mitad:", not pg.evaluate("document.getElementById('mobile-cta').classList.contains('is-hidden')"))
            pg.click("#mobile-cta a")
            pg.wait_for_timeout(1500)
            shot(pg, "movil-formulario.png")
            print("  foco tras CTA:", pg.evaluate("document.activeElement.id"),
                  "| barra oculta en formulario:", pg.evaluate("document.getElementById('mobile-cta').classList.contains('is-hidden')"))
        if name == "desktop":
            pg.evaluate("window.scrollTo(0,0)")
            pg.click(".header-cta")
            pg.wait_for_timeout(1500)
            print("  foco tras CTA header:", pg.evaluate("document.activeElement.id"))
        sw = pg.evaluate("document.documentElement.scrollWidth")
        print(name, w, "scrollWidth", sw, "OK" if sw <= w else "SCROLL HORIZONTAL", "errores:", errs)
        ctx.close()
    b.close()
