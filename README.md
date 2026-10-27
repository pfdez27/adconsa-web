# Adconsa – Sitio web (v1 provisional)

Página única estática para **Adconsa**, administración de condominios en República Dominicana.
HTML + CSS + JS vanilla, sin build, sin dependencias externas (ni webfonts ni librerías).

## Estructura

```
adconsa-web/
├── index.html          # Todo el contenido y textos (secciones, FAQ, meta SEO/Open Graph, JSON-LD)
├── css/styles.css      # Estilos; MARCA centralizada en el bloque :root (arriba del archivo)
├── js/config.js        # DATOS DE CONTACTO y endpoint del formulario (un solo lugar)
├── js/main.js          # Menú móvil, carga de contacto, validación y envío del formulario
├── assets/
│   ├── favicon.svg     # Favicon provisional
│   ├── logo.svg        # Logotipo provisional (archivo suelto; en la página va inline en el header)
│   └── og-image.png    # Imagen 1200×630 para redes sociales (provisional)
├── scripts/capturas.py # Regenera las capturas con Playwright + Chrome
└── capturas/
    ├── desktop.png     # Página completa a 1440 px
    └── movil.png       # Página completa a 390 px (escala 2x)
```

## Ver el sitio en local

```bash
cd /workspace/adconsa-web
python3 -m http.server 8765
# abrir http://localhost:8765/
python3 scripts/capturas.py   # (opcional) regenerar capturas
```

## Dónde cambiar cada cosa

| Qué | Dónde |
|---|---|
| Colores, tipografía, radios, sombras | `css/styles.css` → bloque `:root` (variables `--color-*`, `--font-*`) |
| Teléfono, WhatsApp, email, dirección, horario, RNC | `js/config.js` (se aplican solos en toda la página vía `data-contact`) |
| Mensaje inicial de WhatsApp | `js/config.js` → `whatsappMensajeInicial` |
| Conectar Formspree u otro servicio | `js/config.js` → `FORM_ENDPOINT` (ej. `https://formspree.io/f/xxxx`) |
| Textos de secciones, servicios, FAQ | `index.html` (cada sección tiene un comentario) |
| Título, descripción SEO, Open Graph, dominio | `<head>` de `index.html` |
| Logotipo | SVG inline en el header de `index.html` (`.brand-mark`) + `assets/logo.svg`; colores toman las variables CSS |
| Favicon / imagen para redes | `assets/favicon.svg`, `assets/og-image.png` |

> Nota: el HTML también trae los datos de contacto como texto de respaldo (por si el JS no carga),
> y el JSON-LD del `<head>` tiene teléfono/email; al cambiar `config.js`, actualice también esos dos sitios.

## Formulario de cotización

- Validación en el cliente (nombre, teléfono 10–15 dígitos, email, condominio, ubicación, unidades 1–5000, tipo).
  Errores accesibles (`aria-invalid`, `aria-live`) y foco en el primer campo inválido.
- Sin backend: al enviar, arma el mensaje y muestra botones **Enviar por WhatsApp** (wa.me) y **Enviar por correo** (mailto).
- Si `FORM_ENDPOINT` tiene valor, además hace `POST` JSON a ese endpoint (compatible con Formspree) y muestra confirmación.
- Incluye campo trampa anti-spam (`_gotcha`).

## Pendiente

- [ ] Identidad de marca definitiva (agente Marca y Copy): logo, paleta, tipografía → reemplazar en `:root`, logo y favicon.
- [ ] Textos definitivos (hero, servicios, beneficios, FAQ) – los actuales son provisionales.
- [ ] Datos reales en `js/config.js`: teléfono, WhatsApp, email, dirección, horario, RNC (todos marcados `[PENDIENTE]`).
- [ ] Dominio real: `canonical`, `og:url`, `og:image`, JSON-LD (ahora `https://www.adconsa.com.do/` como supuesto).
- [ ] Crear cuenta Formspree (o similar) y poner el endpoint en `FORM_ENDPOINT`.
- [ ] Regenerar `assets/og-image.png` con la marca final.
- [ ] Opcional: fotos reales, testimonios reales (no se inventaron), aviso de privacidad, analítica, `robots.txt`/`sitemap.xml`.
- [ ] Las cifras del recuadro "Reporte mensual" del hero son **de ejemplo** (marcadas así en la página).
