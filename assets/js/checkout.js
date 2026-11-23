import { obtenerProductos } from './datos.js'
import { URL_PRODUCTOS, NUMERO_WHATSAPP } from './config.js'
import {
    envios,
    envioGratisDesde,
    planesCuotas,
    formatearPrecio,
    leerCarrito,
    guardarCarrito,
    leerEnvio,
    guardarEnvio,
    buscarProducto,
    calcularSubtotal,
    calcularEnvio,
    contarProductos,
    renderizadoCuotas
} from './funciones-carrito.js'
import {validarCampo, REGEX_EMAIL} from './validaciones.js' 
import { armarMensajePedido, crearLinkWhatsApp } from './whatsapp.js'

const carrito = leerCarrito()
let productos = []
let subtotal = 0
let medioPago = 'credito'
let cuotasElegidas = 3
let pasoActual = 0
let datosCliente = {}
let datosEntrega = {}

const paneles = [
    document.getElementById('panel-datos'),
    document.getElementById('panel-entrega'),
    document.getElementById('panel-pago'),
    document.getElementById('panel-confirmacion')
]
const tablaCuotas = document.getElementById('tabla-cuotas')
const cuerpoCuotas = document.getElementById('cuerpo-cuotas')
const resumenPedido = document.getElementById('resumen-pedido')
const contadorProductos = document.getElementById('contador')
const botonConfirmar = document.getElementById('btn-continuar')
const mediosPago = document.querySelectorAll('input[name="pago"]')
const pasos = document.querySelectorAll('.stepper__paso')
const formDatos = document.getElementById('form-datos')
const formEntrega = document.getElementById('form-entrega')
const opcionesEntrega = document.getElementById('opciones-entrega')
const camposDireccion = document.getElementById('campos-direccion')
const botonesVolver = document.querySelectorAll('[data-ir-paso]')

function calcularEnvioActual() {
    return calcularEnvio(subtotal, leerEnvio())
}

function calcularTotalFinal() {
    const totalCompra = subtotal + calcularEnvioActual()
    if (medioPago == 'transferencia') {
        return totalCompra * 0.9
    }
    if (medioPago == 'credito') {
        const plan = planesCuotas.find((plan) => {
            return plan.cuotas == cuotasElegidas
        })
        return totalCompra * (1 + plan.interes)
    }
    return totalCompra
}

function mostrarResumen() {
    const envio = calcularEnvioActual()
    const totalCompra = subtotal + envio

    let resumenHTML = '<h2 class="resumen__titulo">Tu pedido</h2>'

    carrito.forEach((item) => {
        const producto = buscarProducto(productos, item.id)
        resumenHTML += `
        <div class="resumen__linea">
            <span>${producto.nombre} ×${item.cantidad}</span>
            <span>${formatearPrecio(producto.precio * item.cantidad)}</span>
        </div>
        `
    })

    let textoEnvio = formatearPrecio(envio)
    if (envio == 0) {
        textoEnvio = 'Gratis'
    }
    resumenHTML += `
    <div class="resumen__linea">
        <span>Envío (${envios[leerEnvio()].nombre})</span>
        <span>${textoEnvio}</span>
    </div>
    `

    if (medioPago == 'transferencia') {
        resumenHTML += `
        <div class="resumen__linea resumen__linea--descuento">
            <span>Descuento transferencia (10%)</span>
            <span>−${formatearPrecio(totalCompra * 0.1)}</span>
        </div>
        `
    }

    resumenHTML += `
    <div class="resumen__linea resumen__linea--total">
        <span>Total</span>
        <span>${formatearPrecio(calcularTotalFinal())}</span>
    </div>
    `

    resumenPedido.innerHTML = resumenHTML
}

function mostrarCuotas() {
    if (medioPago == 'credito') {
        tablaCuotas.style.display = ''
    } else {
        tablaCuotas.style.display = 'none'
    }

    renderizadoCuotas(cuerpoCuotas, subtotal + calcularEnvioActual(), cuotasElegidas)

    const filasCuotas = cuerpoCuotas.querySelectorAll('.cuotas__fila')
    filasCuotas.forEach((fila) => {
        fila.addEventListener('click', (evento) => {
            cuotasElegidas = parseInt(fila.dataset.cuotas)
            mostrarCuotas()
            mostrarResumen()
        })
    })
}

// Navegación entre pasos: muestra un solo panel y actualiza el stepper
function irAPaso(numero) {
    pasoActual = numero

    paneles.forEach((panel, indice) => {
        panel.hidden = indice != numero
    })

    pasos.forEach((paso, indice) => {
        paso.classList.remove('stepper__paso--activo', 'stepper__paso--completo')
        paso.removeAttribute('aria-current')
        if (indice < numero) {
            paso.classList.add('stepper__paso--completo')
        }
        if (indice == numero) {
            paso.classList.add('stepper__paso--activo')
            paso.setAttribute('aria-current', 'step')
        }
    })

    if (numero == 1) {
        mostrarOpcionesEntrega()
    }
    if (numero == 2) {
        mostrarCuotas()
        mostrarResumen()
    }

    window.scrollTo({ top: 0, behavior: 'smooth' })
}

// Validaciones de cada paso: usan validarCampo() de validaciones.js
function validarDatos() {
    const f = formDatos.elements
    const resultados = [
        validarCampo(f.nombre, 'Ingresá tu nombre y apellido', (valor) => valor.length >= 3),
        validarCampo(f.email, 'Ingresá un email válido', (valor) => REGEX_EMAIL.test(valor)),
        validarCampo(f.telefono, 'Ingresá entre 8 y 12 números'),
        validarCampo(f.dni, 'Ingresá un DNI de 7 u 8 números')
    ]
    return !resultados.includes(false)
}

function validarEntrega() {
    if (leerEnvio() == 'retiro') {
        return true
    }
    const f = formEntrega.elements
    const resultados = [
        validarCampo(f.calle, 'Ingresá tu calle y número', (valor) => valor.length >= 3),
        validarCampo(f.ciudad, 'Ingresá tu ciudad', (valor) => valor.length >= 2),
        validarCampo(f.cp, 'Ingresá un código postal de 4 números')
    ]
    return !resultados.includes(false)
}

function mostrarOpcionesEntrega() {
    let opcionesHTML = ''

    Object.keys(envios).forEach((clave) => {
        const envio = envios[clave]
        let textoPrecio = formatearPrecio(envio.precio)
        if (envio.precio == 0 || subtotal >= envioGratisDesde) {
            textoPrecio = 'Gratis'
        }
        let marcado = ''
        if (clave == leerEnvio()) {
            marcado = 'checked'
        }
        opcionesHTML += `
        <label class="medio-pago">
            <input type="radio" name="envio" value="${clave}" ${marcado}>
            <span><span class="medio-pago__nombre">${envio.nombre}</span><span class="medio-pago__detalle">${textoPrecio}</span></span>
        </label>
        `
    })

    opcionesEntrega.innerHTML = opcionesHTML
    actualizarCamposDireccion()
    mostrarResumen()
}

function actualizarCamposDireccion() {
    camposDireccion.hidden = leerEnvio() == 'retiro'
}

// Los datos del cliente se insertan con innerHTML: se escapan para evitar inyección de HTML
function escaparHtml(texto) {
    const div = document.createElement('div')
    div.textContent = texto
    return div.innerHTML
}

// Arma un objeto con todos los datos del pedido (cliente, productos, entrega y pago)
function armarPedido() {
    const nombresMedios = {
        credito: 'Tarjeta de crédito en ' + cuotasElegidas + ' cuota(s)',
        debito: 'Tarjeta de débito',
        transferencia: 'Transferencia (10% de descuento)',
        billetera: 'Billetera virtual'
    }

    let direccion = 'Retiro en punto Nutrite (Córdoba Capital)'
    if (leerEnvio() != 'retiro') {
        direccion = datosEntrega.calle + ', ' + datosEntrega.ciudad + ' (CP ' + datosEntrega.cp + ')'
    }

    const items = carrito.map((item) => {
        const producto = buscarProducto(productos, item.id)
        return {
            nombre: producto.nombre,
            cantidad: item.cantidad,
            subtotal: producto.precio * item.cantidad
        }
    })

    return {
        numero: 'NUT-' + Math.floor(100000 + Math.random() * 900000),
        cliente: datosCliente,
        items: items,
        entrega: envios[leerEnvio()].nombre,
        direccion: direccion,
        notas: datosEntrega.notas,
        pago: nombresMedios[medioPago],
        total: calcularTotalFinal()
    }
}

function mostrarConfirmacion() {
    const pedido = armarPedido()
    const linkWhatsApp = crearLinkWhatsApp(NUMERO_WHATSAPP, armarMensajePedido(pedido))

    // Envío del pedido: abre WhatsApp en otra pestaña con el mensaje ya escrito
    window.open(linkWhatsApp, '_blank')

    paneles[3].innerHTML = `
    <h1 class="checkout__titulo">¡Gracias por tu compra, ${escaparHtml(pedido.cliente.nombre.split(' ')[0])}!</h1>
    <div class="aviso aviso--exito" role="status">
        <p class="aviso__titulo">Tu pedido <strong>${pedido.numero}</strong> está listo para enviar</p>
        <p class="aviso__texto">Abrimos WhatsApp con el detalle de tu compra. Tocá <strong>Enviar</strong> en el chat para confirmarlo.</p>
        <a class="btn btn--whatsapp btn--chico" href="${linkWhatsApp}" target="_blank" rel="noopener">¿No se abrió? Enviar por WhatsApp</a>
    </div>
    <div class="resumen u-mt-4">
        <div class="resumen__linea"><span>Entrega</span><span>${pedido.entrega}</span></div>
        <div class="resumen__linea"><span>Dirección</span><span>${escaparHtml(pedido.direccion)}</span></div>
        <div class="resumen__linea"><span>Pago</span><span>${pedido.pago}</span></div>
        <div class="resumen__linea resumen__linea--total"><span>Total</span><span>${formatearPrecio(pedido.total)}</span></div>
    </div>
    <div class="checkout__navegacion">
        <a class="btn btn--secundario" href="index.html">Ir al inicio</a>
        <a class="btn btn--primario" href="catalogo.html">Seguir comprando</a>
    </div>
    `

    resumenPedido.style.display = 'none'
    guardarCarrito([])
    contadorProductos.textContent = 0
    irAPaso(3)
}
// Eventos
function inicializarEventos() {
    formDatos.addEventListener('submit', (evento) => {
        evento.preventDefault()
        if (!validarDatos()) {
            return
        }
        const f = formDatos.elements
        datosCliente = {
            nombre: f.nombre.value.trim(),
            email: f.email.value.trim(),
            telefono: f.telefono.value.trim(),
            dni: f.dni.value.trim()
        }
        irAPaso(1)
    })

    opcionesEntrega.addEventListener('change', (evento) => {
        guardarEnvio(evento.target.value)
        actualizarCamposDireccion()
        mostrarResumen()
    })

    formEntrega.addEventListener('submit', (evento) => {
        evento.preventDefault()
        if (!validarEntrega()) {
            return
        }
        const f = formEntrega.elements
        datosEntrega = {
            calle: f.calle.value.trim(),
            ciudad: f.ciudad.value.trim(),
            cp: f.cp.value.trim(),
            notas: f.notas.value.trim()
        }
        irAPaso(2)
    })

    botonesVolver.forEach((boton) => {
        boton.addEventListener('click', (evento) => {
            irAPaso(parseInt(boton.dataset.irPaso))
        })
    })

    mediosPago.forEach((medio) => {
        medio.addEventListener('change', (evento) => {
            medioPago = medio.value
            mostrarCuotas()
            mostrarResumen()
        })
    })

    botonConfirmar.addEventListener('click', (evento) => {
        mostrarConfirmacion()
    })
}

function mostrarCarritoVacio() {
    paneles.forEach((panel) => {
        panel.hidden = true
    })
    paneles[3].hidden = false
    paneles[3].innerHTML = `
    <h1 class="checkout__titulo">Tu carrito está vacío</h1>
    <a class="btn btn--primario" href="catalogo.html">Ver productos</a>
    `
    resumenPedido.style.display = 'none'
}

async function iniciar() {
    try {
    productos = await obtenerProductos(URL_PRODUCTOS)
    subtotal = calcularSubtotal(carrito, productos)
    contadorProductos.textContent = contarProductos(carrito)
    inicializarEventos()

    if (carrito.length == 0) {
        mostrarCarritoVacio()
    } else {
        mostrarResumen()
    }
}   catch (error) {
    paneles.forEach((panel) => {
        panel.hidden = true
    })
    paneles[3].hidden = false
    paneles[3].innerHTML = '<p class="catalogo__error">No se pudo cargar tu pedido. Por favor, intentá de nuevo más tarde.</p>'
    resumenPedido.style.display = 'none'
    console.error(error)
    }
}
iniciar()
