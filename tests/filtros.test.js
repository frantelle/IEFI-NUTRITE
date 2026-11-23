// Tests unitarios de las funciones de filtros.js
// Se ejecutan con el test runner nativo de Node: npm test

import { test } from "node:test";
import assert from "node:assert/strict";
import { normalizarTexto, filtrarProductos, ordenarProductos } from "../assets/js/filtros.js";

// Datos de prueba: una lista chica y controlada, no el JSON real
const productos = [
  { id: 1, nombre: "Semillas de chía 500 g", precio: 3100, categoria: "Frutos secos y semillas", badges: ["Sin TACC", "Vegano"], stock: { estado: "disponible" } },
  { id: 2, nombre: "Harina de almendras 500 g", precio: 6800, categoria: "Harinas y panificados", badges: ["Sin TACC", "Vegano"], stock: { estado: "ultimas" } },
  { id: 3, nombre: "Proteína vegana 1 kg", precio: 18500, categoria: "Suplementos y vitaminas", badges: ["Vegano"], stock: { estado: "sin-stock" } },
];

// Criterios "vacíos": sin ningún filtro elegido
const sinFiltros = { atributos: [], categorias: [], soloConStock: false, busqueda: "" };

test("normalizarTexto quita acentos y pasa a minúsculas", () => {
  assert.equal(normalizarTexto("Chía"), "chia");
  assert.equal(normalizarTexto("PROTEÍNA"), "proteina");
});

test("filtrarProductos sin filtros devuelve todos los productos", () => {
  assert.equal(filtrarProductos(productos, sinFiltros).length, 3);
});

test("filtrarProductos busca sin importar los acentos", () => {
  const resultado = filtrarProductos(productos, { ...sinFiltros, busqueda: "chia" });
  assert.equal(resultado.length, 1);
  assert.equal(resultado[0].id, 1);
});

test("filtrarProductos con 'solo con stock' deja afuera los productos sin stock", () => {
  const resultado = filtrarProductos(productos, { ...sinFiltros, soloConStock: true });
  assert.deepEqual(resultado.map((p) => p.id), [1, 2]);
});

test("filtrarProductos exige que el producto tenga todos los atributos elegidos", () => {
  const resultado = filtrarProductos(productos, { ...sinFiltros, atributos: ["Sin TACC", "Vegano"] });
  assert.deepEqual(resultado.map((p) => p.id), [1, 2]);
});

test("ordenarProductos por menor precio ordena de más barato a más caro", () => {
  const resultado = ordenarProductos(productos, "Menor precio");
  assert.deepEqual(resultado.map((p) => p.precio), [3100, 6800, 18500]);
});

test("ordenarProductos no modifica la lista original", () => {
  ordenarProductos(productos, "Mayor precio");
  assert.deepEqual(productos.map((p) => p.id), [1, 2, 3]);
});