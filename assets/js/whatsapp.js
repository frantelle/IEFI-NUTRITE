// Módulo de WhatsApp: arma el texto del pedido y el link de ws

import { formatearPrecio } from "./funciones-carrito.js";

// Devuelve el link que abre WhatsApp con el mensaje ya escrito.
export function crearLinkWhatsApp(numero, texto) {
  return `https://wa.me/${numero}?text=${encodeURIComponent(texto)}`;
}

export function armarMensajePedido(pedido) {
  const lineasProductos = pedido.items.map(
    (item) => `- ${item.cantidad} x ${item.nombre}: ${formatearPrecio(item.subtotal)}`
  );

  const lineas = [
    `¡Hola Nutrite! Quiero confirmar mi pedido *${pedido.numero}*`,
    "",
    `Nombre: ${pedido.cliente.nombre}`,
    `Teléfono: ${pedido.cliente.telefono}`,
    `Email: ${pedido.cliente.email}`,
    "",
    "Productos:",
    ...lineasProductos,
    "",
    `Entrega: ${pedido.entrega}`,
    `Dirección: ${pedido.direccion}`,
  ];

  if (pedido.notas) {
    lineas.push(`Aclaraciones: ${pedido.notas}`);
  }

  lineas.push(`Pago: ${pedido.pago}`);
  lineas.push(`*Total: ${formatearPrecio(pedido.total)}*`);

  return lineas.join("\n");
}