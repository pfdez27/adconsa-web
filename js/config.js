/* =====================================================================
   ADCONSA – CONFIGURACIÓN CENTRAL DE CONTACTO Y FORMULARIO
   Cambie aquí los datos y se actualizan en toda la página.
   (El HTML y el JSON-LD de index.html traen estos mismos datos como respaldo:
   si cambia algo aquí, actualícelo también allá.)
   ===================================================================== */
window.ADCONSA_CONFIG = {
  // Teléfonos (propuestas comerciales ADCONSA). "tel" en formato internacional.
  telefonos: [
    { visible: "809-304-9035", tel: "+18093049035" },
    { visible: "849-936-3059", tel: "+18499363059" },
    { visible: "829-304-9057", tel: "+18293049057" }
  ],

  // WhatsApp: SOLO dígitos (1 + código de área + número).
  // [PENDIENTE] Número provisional (= teléfono principal). Priamo debe confirmar
  // cuál es el WhatsApp oficial antes de publicar en el dominio definitivo.
  whatsappNumero: "18093049035",
  whatsappMensajeInicial: "Hola ADCONSA, me gustaría recibir información sobre la administración de mi condominio.",

  // Correo que recibe las solicitudes
  email: "sc@adconsasrl.com",

  direccion: "Calle Rómulo Betancourt #1254, Sector Bella Vista, Santo Domingo",
  horario: "Lunes a viernes, 8:00 a. m. – 5:00 p. m.; sábados, 9:00 a. m. – 12:00 p. m.",
  rnc: "RNC 130684979",

  // Envío del formulario a un servicio externo (Formspree, Getform, Basin...).
  // Deje "" para usar solo WhatsApp/correo. Ej.: "https://formspree.io/f/xxxxxxx"
  FORM_ENDPOINT: ""
};
