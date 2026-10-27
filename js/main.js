/* Adconsa – interacciones de la página (JS vanilla, sin dependencias) */
(function () {
  "use strict";
  var C = window.ADCONSA_CONFIG || {};

  function waUrl(text) {
    return "https://wa.me/" + (C.whatsappNumero || "") + "?text=" + encodeURIComponent(text || "");
  }

  /* ---------- Datos de contacto desde config.js ---------- */
  function applyContact() {
    var map = {
      telefonos: function (el) {
        if (!C.telefonos || !C.telefonos.length) return;
        el.textContent = "";
        C.telefonos.forEach(function (t) {
          var a = document.createElement("a");
          a.href = "tel:" + t.tel; a.textContent = t.visible; el.appendChild(a);
        });
      },
      email: function (el) { el.textContent = C.email; el.href = "mailto:" + C.email; },
      direccion: function (el) { el.textContent = C.direccion; },
      horario: function (el) { el.textContent = C.horario; },
      rnc: function (el) { el.textContent = C.rnc; }
    };
    document.querySelectorAll("[data-contact]").forEach(function (el) {
      var key = el.getAttribute("data-contact");
      var fn = map[key];
      if (fn && (key === "telefonos" || C[key])) fn(el);
    });
    document.querySelectorAll("[data-wa-link]").forEach(function (el) {
      el.href = waUrl(C.whatsappMensajeInicial);
    });
    var y = document.getElementById("year");
    if (y) y.textContent = new Date().getFullYear();
  }

  /* ---------- Menú móvil ---------- */
  function initNav() {
    var toggle = document.querySelector(".nav-toggle");
    var nav = document.querySelector(".site-nav");
    if (!toggle || !nav) return;
    function setOpen(open) {
      toggle.setAttribute("aria-expanded", String(open));
      nav.classList.toggle("is-open", open);
      toggle.querySelector(".sr-only").textContent = open ? "Cerrar menú" : "Abrir menú";
    }
    toggle.addEventListener("click", function () {
      setOpen(toggle.getAttribute("aria-expanded") !== "true");
    });
    nav.addEventListener("click", function (e) {
      if (e.target.closest("a")) setOpen(false);
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && nav.classList.contains("is-open")) { setOpen(false); toggle.focus(); }
    });
  }

  /* ---------- Formulario de cotización ---------- */
  function initForm() {
    var form = document.getElementById("form-cotizacion");
    if (!form) return;
    var status = document.getElementById("form-status");
    var sendBox = document.getElementById("send-options");

    var rules = {
      nombre: function (v) { return v.trim().length >= 3 || "Escriba su nombre."; },
      telefono: function (v) {
        var d = v.replace(/\D/g, "");
        return (d.length >= 10 && d.length <= 15) || "Escriba un teléfono válido (ej.: 809-555-1234).";
      },
      email: function (v) { return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim()) || "Escriba un correo válido."; },
      condominio: function (v) { return v.trim().length >= 2 || "Indique el nombre del condominio."; },
      sector: function (v) { return v.trim().length >= 2 || "Indique el sector del condominio."; }
    };

    function setError(name, msg) {
      var err = document.getElementById("e-" + name);
      var input = form.elements[name];
      if (err) err.textContent = msg || "";
      if (input && input.setAttribute && !(input instanceof RadioNodeList)) {
        if (msg) { input.setAttribute("aria-invalid", "true"); input.setAttribute("aria-describedby", "e-" + name); }
        else input.removeAttribute("aria-invalid");
      }
    }

    function validateField(name) {
      var res = rules[name](form.elements[name].value);
      setError(name, res === true ? "" : res);
      return res === true;
    }

    Object.keys(rules).forEach(function (name) {
      var el = form.elements[name];
      el.addEventListener("blur", function () { if (el.value) validateField(name); });
      el.addEventListener("input", function () { if (el.getAttribute("aria-invalid")) validateField(name); });
    });

    function collect() {
      return {
        nombre: form.elements.nombre.value.trim(),
        telefono: form.elements.telefono.value.trim(),
        email: form.elements.email.value.trim(),
        condominio: form.elements.condominio.value.trim(),
        sector: form.elements.sector.value.trim(),
        mensaje: form.elements.mensaje.value.trim()
      };
    }

    function buildMessage(d) {
      return [
        "Hola ADCONSA, quisiera solicitar una cotización.",
        "",
        "Nombre: " + d.nombre,
        "Teléfono: " + d.telefono,
        "Correo: " + d.email,
        "Condominio: " + d.condominio,
        "Sector: " + d.sector,
        d.mensaje ? "Mensaje: " + d.mensaje : ""
      ].filter(function (l, i) { return l !== "" || i === 1; }).join("\n");
    }

    // Envío opcional a un servicio externo (Formspree o similar)
    function postToEndpoint(d) {
      if (!C.FORM_ENDPOINT) return Promise.resolve(false);
      return fetch(C.FORM_ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json", "Accept": "application/json" },
        body: JSON.stringify(Object.assign({}, d, { _subject: "Solicitud de cotización – " + d.condominio }))
      }).then(function (r) { return r.ok; }).catch(function () { return false; });
    }

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      if (form.elements._gotcha.value) return; // spam

      var ok = true, firstInvalid = null;
      Object.keys(rules).forEach(function (name) {
        if (!validateField(name)) { ok = false; firstInvalid = firstInvalid || form.elements[name]; }
      });
      if (!ok) {
        status.textContent = "Revise los campos marcados.";
        status.className = "form-status is-error";
        sendBox.hidden = true;
        firstInvalid.focus();
        return;
      }

      var data = collect();
      var msg = buildMessage(data);
      document.getElementById("send-whatsapp").href = waUrl(msg);
      document.getElementById("send-email").href =
        "mailto:" + C.email + "?subject=" + encodeURIComponent("Solicitud de cotización – " + data.condominio) +
        "&body=" + encodeURIComponent(msg);

      status.className = "form-status";
      status.textContent = C.FORM_ENDPOINT ? "Enviando…" : "";
      postToEndpoint(data).then(function (sent) {
        if (sent) {
          status.textContent = "¡Gracias! Recibimos su solicitud y le contactaremos pronto.";
          status.className = "form-status is-ok";
        } else {
          status.textContent = "";
        }
        sendBox.hidden = false;
        sendBox.querySelector("a").focus();
      });
    });
  }


  var reduceMotion = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- CTA "Solicite su cotización" / "Solicite una visita": scroll suave + foco en el primer campo ---------- */
  function initCtas() {
    var target = document.getElementById("cotizacion");
    var first = document.getElementById("f-nombre");
    if (!target || !first) return;
    document.querySelectorAll('a[data-cta]').forEach(function (a) {
      a.addEventListener("click", function (e) {
        e.preventDefault();
        target.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth", block: "start" });
        if (history.replaceState) history.replaceState(null, "", "#cotizacion");
        first.focus({ preventScroll: true });
      });
    });
  }

  /* ---------- Header con sombra al hacer scroll ---------- */
  function initHeader() {
    var h = document.querySelector(".site-header");
    if (!h) return;
    function on() { h.classList.toggle("is-scrolled", window.scrollY > 8); }
    on(); window.addEventListener("scroll", on, { passive: true });
  }

  /* ---------- Barra fija móvil: se oculta cuando el formulario (o el hero) está a la vista ---------- */
  function initMobileCta() {
    var bar = document.getElementById("mobile-cta");
    var form = document.getElementById("cotizacion");
    var hero = document.querySelector(".hero-actions");
    if (!bar || !form || !("IntersectionObserver" in window)) return;
    var formVisible = false, heroVisible = true;
    function update() { bar.classList.toggle("is-hidden", formVisible || heroVisible); }
    new IntersectionObserver(function (es) { formVisible = es[0].isIntersecting; update(); },
      { rootMargin: "0px 0px -15% 0px" }).observe(form);
    if (hero) new IntersectionObserver(function (es) { heroVisible = es[0].isIntersecting; update(); }).observe(hero);
    update();
  }

  /* ---------- Animaciones al aparecer (respeta prefers-reduced-motion) ---------- */
  function initReveal() {
    var els = document.querySelectorAll(".reveal");
    if (reduceMotion || !("IntersectionObserver" in window)) {
      els.forEach(function (el) { el.classList.add("is-visible"); });
      return;
    }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add("is-visible"); io.unobserve(en.target); }
      });
    }, { rootMargin: "0px 0px -8% 0px", threshold: 0.08 });
    els.forEach(function (el) { io.observe(el); });
  }

  document.addEventListener("DOMContentLoaded", function () {
    applyContact();
    initNav();
    initForm();
    initCtas();
    initHeader();
    initMobileCta();
    initReveal();
  });
})();
