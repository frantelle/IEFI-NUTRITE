//Módulo de validaciones: lo usan los formularios de checkout y contacto.
//Las reglas básicas se declaran en el HTML (required, minlenght, pattern, type="email")
//y acá Javascript las consulta con checkValidity(), suma reglas extra y muestra mensajes de erorr en la interfaz.

export const REGEX_EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

//Marca o desmarca un campo con error y muestra el mensaje debajo.
// Devuelve true si el campo quedó valido y false si tiene error.
export function marcarCampo(input,mensajeError) {
    const campo = input.closest(".campo");
    const ayuda = campo.querySelector(".campo__ayuda");

    if (ayuda.dataset.textoOriginal === undefined) {
        ayuda.dataset.textoOriginal = ayuda.textContent;
    }
    
    if(mensajeError) {
        campo.classList.add("campo--error");
        ayuda.textContent = mensajeError;
        return false;
    }

   campo.classList.remove ("campo--error");
   ayuda.textContent = ayuda.dataset.textoOriginal;
   return true;
}   

export function validarCampo(input, mensajeError, reglaExtra) {
    const valor = input.value.trim();
    let esValido = input.checkValidity();

    if(esValido && valor === "") {
        esValido = false;
    }
    
    if (esValido && reglaExtra) {
        esValido = reglaExtra(valor);
        return marcarCampo(input, esValido ? "" : mensajeError);
    }
}

