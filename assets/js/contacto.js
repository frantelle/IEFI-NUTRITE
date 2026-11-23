// Contacto — validación del formulario y confirmación de envío.
// No hay backend: el mensaje se valida y se muestra una confirmación.

import { actualizarContadorHeader } from "./agregar.js";
import {marcarCampo, validarCampo, REGEX_EMAIL} from "./validaciones.js";

const form = document.getElementById("form-contacto");
const mensajeEstado = document.getElementById("contacto-estado");

function validar() {
  const f = form.elements;
  const resultados = [
    validarCampo(f.nombre, "Ingresá tu nombre", (valor) => valor.length >= 3),
    validarCampo(f.email, "Ingresá un email válido", (valor) => REGEX_EMAIL.test(valor)),
    validarCampo(f.mensaje, "Contanos un poco más (mínimo 10 caracteres)", (valor) => valor.length >= 10),
  ];
  return !resultados.includes(false);
}

function inicializarEventos(){

  // Evento: enviar el formulario
  form.addEventListener("submit", (evento) => {
    evento.preventDefault();
    mensajeEstado.textContent = "";

    if (!validar()) {
      mensajeEstado.textContent = "Revisá los campos marcados.";
      mensajeEstado.classList.add("is-error");
      return;
    }

    const nombre = form.elements.nombre.value.trim().split(" ")[0];
    mensajeEstado.textContent = `¡Gracias, ${nombre}! Recibimos tu mensaje y te respondemos a la brevedad.`;
    mensajeEstado.classList.remove("is-error");
    form.reset();
  });

  // Evento: limpiar el error de un campo apenas el usuario lo corrige
  form.addEventListener("input", (evento) => {
    const campo = evento.target.closest(".campo");
    if (campo && campo.classList.contains("campo--error")) {
      marcarCampo(evento.target, "");
    }
  });
}

function iniciar() {
  actualizarContadorHeader();
  inicializarEventos();
}

iniciar();
