// Tests unitarios del armado del mensaje de WhatsApp (whatsapp.js)

import { test } from "node:test";
import assert from "node:assert/strict";
import { crearLinkWhatsApp, armarMensajePedido } from "../assets/js/whatsapp.js";

const pedido = {
  numero: "NUT-123456",
  cliente: { nombre: "Franco Tellechea", telefono: "3511234567", email: "franco@test.com" },
  items: [{ nombre: "Semillas de chía 500 g", cantidad: 2, subtotal: 6200 }],
  entrega: "Moto",
  direccion: "Av. Colón 1234, Córdoba (CP 5000)",
  notas: "",
  pago: "Transferencia (10% de descuento)",
  total: 7290,
};

test("crearLinkWhatsApp arma el link de wa.me con el texto codificado", () => {
  const link = crearLinkWhatsApp("5493510000000", "Hola Nutrite");
  assert.equal(link, "https://wa.me/5493510000000?text=Hola%20Nutrite");
});

test("armarMensajePedido incluye el número de pedido, los productos y el total", () => {
  const mensaje = armarMensajePedido(pedido);
  assert.ok(mensaje.includes("NUT-123456"));
  assert.ok(mensaje.includes("- 2 x Semillas de chía 500 g"));
  assert.ok(mensaje.includes("Total: $7.290"));
});

test("armarMensajePedido solo agrega las aclaraciones si existen", () => {
  assert.ok(!armarMensajePedido(pedido).includes("Aclaraciones"));
  assert.ok(armarMensajePedido({ ...pedido, notas: "Timbre 2B" }).includes("Aclaraciones: Timbre 2B"));
});