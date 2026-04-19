import jsPDF from "jspdf";
import type { Order } from "@/shared/types/Order";

interface PrecuentaTicketProps {
  order: Order;
  tableNumber: number;
}

export function generatePrecuentaPDF({ order, tableNumber }: PrecuentaTicketProps) {
  const now = new Date();
  const fecha = now.toLocaleDateString("es-PE", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
  const hora = now.toLocaleTimeString("es-PE", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });

  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: [80, 200],
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 5;
  const contentWidth = pageWidth - margin * 2;
  let y = margin;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.text("Precuenta", pageWidth / 2, y, { align: "center" });
  y += 5;

  doc.setDrawColor(0);
  doc.setLineWidth(0.3);
  doc.line(margin, y, pageWidth - margin, y);
  y += 3;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.text(`Mesa: ${tableNumber}`, margin, y);
  doc.text(`Orden: ${order.orderCode}`, pageWidth - margin, y, { align: "right" });
  y += 4;
  doc.text(`Fecha: ${fecha} ${hora}`, margin, y);
  y += 4;

  doc.setLineWidth(0.2);
  doc.line(margin, y, pageWidth - margin, y);
  y += 3;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(7);
  doc.text("Producto", margin, y);
  doc.text("P.Unit.", margin + contentWidth * 0.45, y, { align: "center" });
  doc.text("Cant.", margin + contentWidth * 0.68, y, { align: "center" });
  doc.text("Total", pageWidth - margin, y, { align: "right" });
  y += 2;

  doc.setLineWidth(0.3);
  doc.line(margin, y, pageWidth - margin, y);
  y += 4;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(7);

  const itemsByCategory = order.items.reduce((acc, item) => {
    const categoryName = item.product.category.name;
    if (!acc[categoryName]) {
      acc[categoryName] = [];
    }
    acc[categoryName].push(item);
    return acc;
  }, {} as Record<string, typeof order.items>);

  const categoryEntries = Object.entries(itemsByCategory);
  const showCategoryHeaders = categoryEntries.length > 1;

  categoryEntries.forEach(([categoryName, items], groupIndex) => {
    if (showCategoryHeaders) {
      doc.setFont("helvetica", "bold");
      doc.setFontSize(7);
      doc.text(categoryName.toUpperCase(), margin, y);
      y += 3;
    }

    doc.setFont("helvetica", "normal");
    doc.setFontSize(6);

    items.forEach((item) => {
      const productName = item.product.name;
      const quantity = item.quantity;
      const unitPrice = item.product.price.toFixed(2);
      const subTotal = item.subTotal.toFixed(2);

      const productLine = productName.length > 18 ? productName.substring(0, 18) + ".." : productName;
      doc.text(productLine, margin + 1, y);
      doc.text(`S/ ${unitPrice}`, margin + contentWidth * 0.45, y, { align: "center" });
      doc.text(String(quantity), margin + contentWidth * 0.68, y, { align: "center" });
      doc.text(`S/ ${subTotal}`, pageWidth - margin, y, { align: "right" });
      y += 4;

      if (y > pageHeight - 25) {
        doc.addPage();
        y = margin;
      }
    });

    // Space + separator between groups (skip after last group)
    if (groupIndex < categoryEntries.length - 1) {
      y += 3;
      doc.setDrawColor(180);
      doc.setLineWidth(0.1);
      doc.line(margin, y, pageWidth - margin, y);
      doc.setDrawColor(0);
      y += 4;
    } else {
      y += 3;
    }
  });

  y += 1;
  doc.setLineWidth(0.3);
  doc.line(margin, y, pageWidth - margin, y);
  y += 3;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.text("TOTAL:", margin, y);
  doc.text(`S/ ${order.total.toFixed(2)}`, pageWidth - margin, y, { align: "right" });
  y += 10;

  doc.setFont("helvetica", "italic");
  doc.setFontSize(7);
  doc.setTextColor(100);
  doc.text("Gracias por su visita", pageWidth / 2, y, { align: "center" });

  doc.save(`precuenta-mesa-${tableNumber}-${order.orderCode}.pdf`);
}

export function printThermalTicket({ order, tableNumber }: PrecuentaTicketProps) {
  const now = new Date();
  const fecha = now.toLocaleDateString("es-PE", { day: "2-digit", month: "2-digit", year: "numeric" });
  const hora = now.toLocaleTimeString("es-PE", { hour: "2-digit", minute: "2-digit", hour12: false });

  const itemsByCategory = order.items.reduce((acc, item) => {
    const cat = item.product.category?.name ?? "General";
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(item);
    return acc;
  }, {} as Record<string, typeof order.items>);

  const categoryEntries = Object.entries(itemsByCategory);
  const showHeaders = categoryEntries.length > 1;

  const itemsHtml = categoryEntries.map(([cat, items]) => `
    ${showHeaders ? `<tr><td colspan="3" class="cat">${cat.toUpperCase()}</td></tr>` : ""}
    ${items.map(item => `
      <tr>
        <td class="name">${item.product.name.length > 18 ? item.product.name.substring(0, 17) + "." : item.product.name}</td>
        <td class="qty">${item.quantity}x</td>
        <td class="price">S/${item.subTotal.toFixed(2)}</td>
      </tr>
    `).join("")}
  `).join("<tr><td colspan='3'>&nbsp;</td></tr>");

  const mesaLabel = tableNumber > 0 ? `Mesa: ${tableNumber}` : "Pedido";

  const html = `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { font-family: monospace; font-size: 11px; width: 80mm; }
  h1 { text-align: center; font-size: 14px; font-weight: bold; margin-bottom: 2px; }
  .sep { border-top: 1px dashed #000; margin: 3px 0; }
  .row { display: flex; justify-content: space-between; margin: 1px 0; }
  table { width: 100%; border-collapse: collapse; }
  td { padding: 1px 0; vertical-align: top; }
  td.name { width: 55%; }
  td.qty { width: 15%; text-align: center; }
  td.price { width: 30%; text-align: right; }
  td.cat { font-weight: bold; padding-top: 3px; }
  .total-row { display: flex; justify-content: space-between; font-weight: bold; font-size: 13px; }
  .footer { text-align: center; margin-top: 4px; font-size: 10px; }
  @media print {
    @page { margin: 0; size: 80mm auto; }
    body { width: 80mm; }
  }
</style>
</head>
<body>
  <h1>PRECUENTA</h1>
  <div class="sep"></div>
  <div class="row"><span>${mesaLabel}</span><span>Cod: ${order.orderCode}</span></div>
  <div>Fecha: ${fecha} ${hora}</div>
  <div class="sep"></div>
  <table>
    <thead>
      <tr>
        <td class="name"><strong>Producto</strong></td>
        <td class="qty"><strong>Cant</strong></td>
        <td class="price"><strong>Total</strong></td>
      </tr>
    </thead>
    <tbody>${itemsHtml}</tbody>
  </table>
  <div class="sep"></div>
  <div class="total-row"><span>TOTAL:</span><span>S/ ${order.total.toFixed(2)}</span></div>
  <div class="sep"></div>
  <div class="footer">Gracias por su visita</div>
</body>
</html>`;

  const win = window.open("", "_blank", "width=400,height=600");
  if (!win) return;
  win.document.write(html);
  win.document.close();
  win.focus();
  setTimeout(() => {
    win.print();
    win.close();
  }, 300);
}
