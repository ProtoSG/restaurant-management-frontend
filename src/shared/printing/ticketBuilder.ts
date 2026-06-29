// Construcción de tickets (cuenta y comanda de cocina), agnóstica del transporte.
//
// Las funciones reciben un objeto `TicketPrinter` que expone el subconjunto de la
// API del Epson ePOS-Device SDK que usamos. Tanto el `printer` real del SDK
// (impresión por IP) como nuestro `EscPosBuilder` (impresión por USB) lo
// satisfacen estructuralmente, de modo que el formato se define una sola vez.

import type { Order } from "@/shared/types/Order";

/** Subconjunto de la API ePOS que necesitan los tickets. */
export interface TicketPrinter {
  ALIGN_LEFT: number;
  ALIGN_CENTER: number;
  ALIGN_RIGHT: number;
  COLOR_1: number;
  CUT_FEED: number;
  addTextAlign(align: number): void;
  addTextStyle(reverse: boolean, underline: boolean, bold: boolean, color: number): void;
  addTextSize(width: number, height: number): void;
  addText(data: string): void;
  addFeedLine(lines: number): void;
  addCut(type: number): void;
}

const WIDTH = 48; // 80mm, Font A (TM-T20III/IV = 48 columnas por línea)

// Anchos de columna (suman WIDTH): Producto · P.Unit · Cant · Total
const COL_NAME = 22;
const COL_UNIT = 8;
const COL_QTY = 5;
const COL_TOTAL = WIDTH - COL_NAME - COL_UNIT - COL_QTY; // 13

/** Línea con texto a la izquierda y a la derecha, rellenando con espacios. */
function lr(left: string, right: string): string {
  const gap = Math.max(1, WIDTH - left.length - right.length);
  return left + " ".repeat(gap) + right;
}

/** Fila de 4 columnas de ancho fijo (el nombre se trunca, el resto se alinea a la derecha). */
function itemRow(name: string, unit: string, qty: string, total: string): string {
  const n = name.length > COL_NAME ? name.slice(0, COL_NAME - 1) + "." : name;
  return (
    n.padEnd(COL_NAME) +
    unit.padStart(COL_UNIT) +
    qty.padStart(COL_QTY) +
    total.padStart(COL_TOTAL)
  );
}

/** Agrupa los ítems del pedido por nombre de categoría, preservando el orden. */
function groupByCategory(order: Order): Map<string, Order["items"]> {
  const byCategory = new Map<string, Order["items"]>();
  for (const item of order.items ?? []) {
    const cat = item.product.category?.name ?? "General";
    if (!byCategory.has(cat)) byCategory.set(cat, []);
    byCategory.get(cat)!.push(item);
  }
  return byCategory;
}

/** Ticket de cuenta (cliente): productos, precios y total. */
export function buildTicket(p: TicketPrinter, order: Order): void {
  const now = new Date();
  const fecha = now.toLocaleDateString("es-PE", { day: "2-digit", month: "2-digit", year: "numeric" });
  const hora = now.toLocaleTimeString("es-PE", { hour: "2-digit", minute: "2-digit", hour12: false });

  // Encabezado
  p.addTextAlign(p.ALIGN_CENTER);
  p.addTextStyle(false, false, true, p.COLOR_1);
  p.addTextSize(2, 1);
  p.addText("PRECUENTA\n");
  p.addTextSize(1, 1);
  p.addTextStyle(false, false, false, p.COLOR_1);

  // Cabecera de la orden
  p.addTextAlign(p.ALIGN_LEFT);
  p.addText(lr(`Mesa: ${order.tableNumber ?? "-"}`, `Orden: ${order.orderCode}`) + "\n");
  p.addText(`Fecha: ${fecha} ${hora}\n`);
  p.addText("-".repeat(WIDTH) + "\n");

  // Cabecera de columnas
  p.addTextStyle(false, false, true, p.COLOR_1);
  p.addText(itemRow("Producto", "P.Unit", "Cant", "Total") + "\n");
  p.addTextStyle(false, false, false, p.COLOR_1);
  p.addText("-".repeat(WIDTH) + "\n");

  // Ítems agrupados por categoría (encabezado de grupo solo si hay >1 categoría)
  const byCategory = groupByCategory(order);
  const showHeaders = byCategory.size > 1;

  let subtotalBase = 0;
  let totalLlevar = 0;

  for (const [cat, items] of byCategory) {
    if (showHeaders) {
      p.addTextStyle(false, false, true, p.COLOR_1);
      p.addText(cat.toUpperCase().slice(0, WIDTH) + "\n");
      p.addTextStyle(false, false, false, p.COLOR_1);
    }
    for (const item of items) {
      // Recargo de llevar viene incluido en subTotal; lo separamos (exacto pese a
      // cambios de precio: usa el subTotal real, no product.price actual).
      const lineSurcharge = item.isTakeaway ? (Number(item.takeawaySurcharge) || 0) * item.quantity : 0;
      const lineBase = Number(item.subTotal) - lineSurcharge;
      subtotalBase += lineBase;
      totalLlevar += lineSurcharge;

      p.addText(
        itemRow(
          item.product.name,
          `S/${Number(item.product.price).toFixed(2)}`,
          String(item.quantity),
          `S/${lineBase.toFixed(2)}`
        ) + "\n"
      );
    }
  }

  // Totales
  p.addText("-".repeat(WIDTH) + "\n");
  p.addText(lr("Subtotal:", `S/ ${subtotalBase.toFixed(2)}`) + "\n");
  if (totalLlevar > 0) {
    p.addText(lr("Para llevar:", `S/ ${totalLlevar.toFixed(2)}`) + "\n");
  }
  p.addTextStyle(false, false, true, p.COLOR_1);
  p.addText(lr("TOTAL:", `S/ ${Number(order.total).toFixed(2)}`) + "\n");
  p.addTextStyle(false, false, false, p.COLOR_1);

  // Pie
  p.addFeedLine(1);
  p.addTextAlign(p.ALIGN_CENTER);
  p.addText("Gracias por su visita\n");

  // Corte
  p.addFeedLine(2);
  p.addCut(p.CUT_FEED);
}

/** Comanda de cocina: solo nombre, cantidad y notas, agrupado por categoría.
 *  Sin precios ni total. Texto grande para lectura rápida en cocina. */
export function buildKitchenTicket(p: TicketPrinter, order: Order): void {
  const now = new Date();
  const hora = now.toLocaleTimeString("es-PE", { hour: "2-digit", minute: "2-digit", hour12: false });

  // Encabezado
  p.addTextAlign(p.ALIGN_CENTER);
  p.addTextStyle(false, false, true, p.COLOR_1);
  p.addTextSize(2, 2);
  p.addText("COCINA\n");
  p.addTextSize(1, 1);
  p.addTextStyle(false, false, false, p.COLOR_1);

  // Cabecera de la orden
  p.addTextAlign(p.ALIGN_LEFT);
  p.addText(lr(`Mesa: ${order.tableNumber ?? "-"}`, hora) + "\n");
  p.addText(`Orden: ${order.orderCode}\n`);
  p.addText("-".repeat(WIDTH) + "\n");

  const byCategory = groupByCategory(order);
  const showHeaders = byCategory.size > 1;

  for (const [cat, items] of byCategory) {
    if (showHeaders) {
      p.addTextStyle(false, false, true, p.COLOR_1);
      p.addText(cat.toUpperCase().slice(0, WIDTH) + "\n");
      p.addTextStyle(false, false, false, p.COLOR_1);
    }
    for (const item of items) {
      // Cantidad + nombre en doble alto para legibilidad
      p.addTextSize(1, 2);
      p.addText(`${item.quantity}x ${item.product.name} S/${Number(item.product.price).toFixed(2)}\n`);
      p.addTextSize(1, 1);
      // Notas indentadas, si hay
      const notes = item.notes?.trim();
      if (notes) p.addText(`   >> ${notes}\n`);
    }
    if (showHeaders) p.addFeedLine(1);
  }

  p.addText("-".repeat(WIDTH) + "\n");
  p.addFeedLine(2);
  p.addCut(p.CUT_FEED);
}
