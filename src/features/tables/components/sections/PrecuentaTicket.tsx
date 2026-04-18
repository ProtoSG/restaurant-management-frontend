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
