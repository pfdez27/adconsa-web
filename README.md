# ADCONSA – Sitio web (versión de prueba, según brandbook)

Página única estática para **ADCONSA**, administración de condominios en Santo Domingo desde 2010.
HTML + CSS + JS vanilla, sin build ni dependencias externas (la tipografía se sirve desde el propio sitio).

Versión de prueba publicada (oculta de buscadores: `noindex` + `robots.txt` con `Disallow: /`):
https://pfdez27.github.io/adconsa-web/

## Estructura

```
adconsa-web/
├── index.html              # Contenido, meta SEO/Open Graph y JSON-LD
├── css/styles.css          # Estilos; MARCA centralizada en :root (colores, fuente, barra tricolor)
├── js/config.js            # Datos de contacto y endpoint del formulario (un solo lugar)
├── js/main.js              # Menú, contacto, formulario, CTA, barra móvil, animaciones
├── assets/
│   ├── brand/              # Logos oficiales (copiados de la carpeta de marca, sin modificar) + palette.txt
│   ├── fonts/              # Montserrat 300/400/500/600/700 en woff2 (subconjunto latino)
│   ├── favicon-32.png      # Favicon (versión "Solo ícono"); también assets/brand/logo_icono.svg
│   ├── apple-touch-icon.png
│   └── og-image.png        # 1200×630 para redes (se genera desde scripts/og-image.html)
├── scripts/capturas.py     # Capturas + comprobaciones con Playwright y Chrome
├── scripts/og-image.html   # Plantilla de la imagen para redes
└── capturas/               # desktop.png, movil.png, desktop-hero.png, movil-hero.png,
                            # movil-cta-fija.png, movil-formulario.png
```

## Marca (brandbook)

| Variable | Valor | Uso |
|---|---|---|
| `--color-navy` | `#262262` Azul marino | Títulos y texto principal, fondos oscuros |
| `--color-medio` | `#2B3990` Azul medio | Subtítulos, acentos |
| `--color-claro` | `#1B75BC` Azul claro | Botones, antetítulos en mayúsculas |
| `--color-blanco` | `#FFFFFF` | Fondos y texto sobre azul |
| `--font-base` | Montserrat | Títulos Bold, antetítulos SemiBold con espaciado, cuerpo Light/Regular |

Logos: horizontal en el encabezado (mínimo 160 px de ancho, también en móvil), negativo en el pie
sobre azul marino, "Solo ícono" como favicon y en el hero. No se deforman, recolorean ni llevan efectos.

## Llamadas a la acción

Todos los enlaces con `data-cta` hacen scroll suave a `#cotizacion` y ponen el foco en el primer campo (`#f-nombre`).
Textos permitidos: "Solicite su cotización" o "Solicite una visita".
Ubicación: botón fijo del encabezado, hero, tarjeta de Servicios, franja a mitad de página, sección Propuesta,
Contacto y la barra fija inferior en móvil (`#mobile-cta`, junto al botón de WhatsApp; se oculta en el hero
y cuando el formulario está a la vista).

## Formulario

Campos: nombre, teléfono, correo, nombre del condominio, sector del condominio y mensaje (opcional).
Sin backend: al enviar muestra **Enviar por WhatsApp** y **Enviar por correo**. Si `FORM_ENDPOINT` tiene valor,
también hace `POST` JSON (compatible con Formspree). Incluye campo trampa anti-spam.

## Ver en local

```bash
python3 -m http.server 8765        # http://localhost:8765/
python3 scripts/capturas.py        # regenera capturas y comprueba scroll horizontal, errores JS y CTA
```

## Pendiente / supuestos

- [ ] **WhatsApp**: `18093049035` es provisional (= teléfono principal). Confirmar en `js/config.js`.
- [ ] **Dominio (SUPUESTO)**: `https://www.adconsasrl.com/` deducido del correo `sc@adconsasrl.com`
      (ni el brandbook ni las propuestas lo nombran). Usado en `canonical`, `og:url` y JSON-LD.
- [ ] `og:image`, `twitter:image` y el logo del JSON-LD apuntan a github.io; cambiarlos al dominio definitivo.
- [ ] `FORM_ENDPOINT` vacío: crear Formspree (o similar) si se quiere recibir el formulario por correo.
- [ ] Al publicar en el dominio definitivo: quitar `noindex` de `index.html` y el `Disallow` de `robots.txt`.
- [ ] El texto de la sección Propuesta es el final aprobado por el CEO; el sitio no muestra precios, rangos
      ni cómo se calcula la tarifa.
- [ ] Opcional: lista de clientes (las propuestas tienen 16 referencias; no se publicaron sin autorización),
      fotos reales, aviso de privacidad, analítica.
