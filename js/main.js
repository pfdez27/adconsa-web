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
      telefono: function (el) { el.textContent = C.telefonoVisible; el.href = "tel:" + C.telefonoTel; },
      whatsapp: function (el) { el.textContent = C.whatsappVisible; },
      email: function (el) { el.textContent = C.emailVisible; el.href = "mailto:" + C.email; },
      direccion: function (el) { el.textContent = C.direccion; },
      horario: function (el) { el.textContent = C.horario; },
      rnc: function (el) { el.textContent = C.rnc; }
    };
    document.querySelectorAll("[data-contact]").forEach(function (el) {
      var fn = map[el.getAttribute("data-contact")];
      if (fn) fn(el);
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
      nombre: function (v) { return v.trim().length >= 3 || "Escriba su nombre completo."; },
      telefono: function (v) {
        var d = v.replace(/\D/g, "");
        return (d.length >= 10 && d.length <= 15) || "Escriba un teléfono válido (ej.: 809-555-1234).";
      },
      email: function (v) { return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim()) || "Escriba un correo válido."; },
      condominio: function (v) { return v.trim().length >= 2 || "Indique el nombre del condominio."; },
      ubicacion: function (v) { return v.trim().length >= 2 || "Indique la ubicación o sector."; },
      unidades: function (v) {
        var n = Number(v);
        return (v !== "" && Number.isInteger(n) && n >= 1 && n <= 5000) || "Indique un número de unidades válido.";
      }
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
    form.querySelectorAll('input[name="tipo"]').forEach(function (r) {
      r.addEventListener("change", function () { setError("tipo", ""); });
    });

    function collect() {
      var servicios = Array.prototype.map.call(
        form.querySelectorAll('input[name="servicios"]:checked'), function (c) { return c.value; });
      var tipo = form.querySelector('input[name="tipo"]:checked');
      return {
        nombre: form.elements.nombre.value.trim(),
        telefono: form.elements.telefono.value.trim(),
        email: form.elements.email.value.trim(),
        condominio: form.elements.condominio.value.trim(),
        ubicacion: form.elements.ubicacion.value.trim(),
        unidades: form.elements.unidades.value.trim(),
        tipo: tipo ? tipo.value : "",
        servicios: servicios,
        mensaje: form.elements.mensaje.value.trim()
      };
    }

    function buildMessage(d) {
      return [
        "Hola Adconsa, quisiera solicitar una cotización.",
        "",
        "Nombre: " + d.nombre,
        "Teléfono: " + d.telefono,
        "Correo: " + d.email,
        "Condominio: " + d.condominio,
        "Ubicación / sector: " + d.ubicacion,
        "Número de unidades: " + d.unidades,
        "Tipo: " + d.tipo,
        "Servicios de interés: " + (d.servicios.length ? d.servicios.join(", ") : "No especificado"),
        d.mensaje ? "Mensaje: " + d.mensaje : ""
      ].filter(function (l, i, a) { return !(l === "" && i === a.length - 1); }).join("\n");
    }

    // Envío opcional a un servicio externo (Formspree o similar)
    function postToEndpoint(d) {
      if (!C.FORM_ENDPOINT) return Promise.resolve(false);
      return fetch(C.FORM_ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json", "Accept": "application/json" },
        body: JSON.stringify(Object.assign({}, d, { servicios: d.servicios.join(", "), _subject: "Solicitud de cotización – " + d.condominio }))
      }).then(function (r) { return r.ok; }).catch(function () { return false; });
    }

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      if (form.elements._gotcha.value) return; // spam

      var ok = true, firstInvalid = null;
      Object.keys(rules).forEach(function (name) {
        if (!validateField(name)) { ok = false; firstInvalid = firstInvalid || form.elements[name]; }
      });
      if (!form.querySelector('input[name="tipo"]:checked')) {
        setError("tipo", "Seleccione el tipo de condominio.");
        ok = false; firstInvalid = firstInvalid || form.querySelector('input[name="tipo"]');
      }
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

  document.addEventListener("DOMContentLoaded", function () {
    applyContact();
    initNav();
    initForm();
  });
})();
