// Tests unitarios de los cálculos del carrito (funciones-carrito.js)

import { test } from "node:test";
import assert from "node:assert/strict";
import { calcularSubtotal, calcularEnvio, contarProductos } from "../assets/js/funciones-carrito.js";

const productos = [
  { id: 1, nombre: "Galletitas de avena", precio: 3200 },
  { id: 2, nombre: "Harina de almendras", precio: 6800 },
];

test("calcularSubtotal multiplica precio por cantidad y suma todo", () => {
  const carrito = [
    { id: 1, cantidad: 2 }, // 2 x 3200 = 6400
    { id: 2, cantidad: 1 }, // 1 x 6800 = 6800
  ];
  assert.equal(calcularSubtotal(carrito, productos), 13200);
});

test("calcularSubtotal de un carrito vacío es 0", () => {
  assert.equal(calcularSubtotal([], productos), 0);
});

test("calcularEnvio cobra el precio del envío elegido", () => {
  assert.equal(calcularEnvio(10000, "moto"), 1900);
  assert.equal(calcularEnvio(10000, "correo"), 3400);
  assert.equal(calcularEnvio(10000, "retiro"), 0);
});

test("calcularEnvio es gratis desde $40.000", () => {
  assert.equal(calcularEnvio(40000, "correo"), 0);
  assert.equal(calcularEnvio(39999, "correo"), 3400);
});

test("contarProductos suma las cantidades, no las filas", () => {
  assert.equal(contarProductos([{ id: 1, cantidad: 2 }, { id: 2, cantidad: 3 }]), 5);
});