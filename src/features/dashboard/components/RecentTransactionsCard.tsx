import { useState } from "react";
import { FiPrinter } from "react-icons/fi";
import { BsFiletypePdf } from "react-icons/bs";
import defaultApiClient from "@/shared/utils/apiClient";
import type { Order } from "@/shared/types/Order";

export interface Transaction {
  id: number;
  orderId?: number;
  from: string;
  amount: number;
  time: string;
  change: number;
  paymentMethod?: string;
}

interface Props {
  transactions: Transaction[];
}

const PAYMENT_LABELS: Record<string, string> = {
  CASH: 'Efectivo',
  YAPE: 'Yape',
  CREDITCARD: 'Tarjeta',
};

async function exportOrderPdf(t: Transaction, paymentLabel: string | null) {
  const { default: html2pdf } = await import('html2pdf.js');
  const html = `
    <div style="font-family:sans-serif;padding:24px;color:#111;font-size:14px;max-width:300px;">
      <h2 style="font-size:16px;font-weight:bold;margin:0 0 4px;">${t.from}</h2>
      <div style="color:#666;font-size:12px;margin-bottom:16px;">${t.time}</div>
      <hr style="border:none;border-top:1px solid #eee;margin:12px 0;"/>
      <div style="display:flex;justify-content:space-between;margin-bottom:6px;">
        <span style="color:#555;">Método de pago</span>
        <span>${paymentLabel ?? '—'}</span>
      </div>
      <hr style="border:none;border-top:1px solid #eee;margin:12px 0;"/>
      <div style="display:flex;justify-content:space-between;">
        <span style="color:#555;">Total pagado</span>
        <span style="font-size:18px;font-weight:bold;color:#16a34a;">+S/ ${Math.abs(Number(t.amount)).toFixed(2)}</span>
      </div>
    </div>
  `;
  const el = document.createElement('div');
  el.innerHTML = html;
  html2pdf().set({ filename: `orden-${t.from.replace(/\s+/g, '-')}.pdf`, margin: 0 }).from(el).save();
}

export function RecentTransactionsCard({ transactions }: Props) {
  const safeTransactions = transactions ?? [];
  const [printing, setPrinting] = useState<number | null>(null);

  async function handlePrintThermal(t: Transaction) {
    if (t.orderId == null) return;
    setPrinting(t.id);
    try {
      const { data } = await defaultApiClient.get<Order>(`/orders/${t.orderId}`);
      const res = await fetch("http://127.0.0.1:3001/print", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error ?? "Error al imprimir");
      }
    } finally {
      setPrinting(null);
    }
  }

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
      <h3 className="text-lg font-bold text-gray-900 mb-4">Últimas órdenes pagadas</h3>

      {safeTransactions.length === 0 ? (
        <p className="text-gray-500 text-center py-4">No hay órdenes pagadas hoy</p>
      ) : (
        <div className="space-y-1">
          {safeTransactions.map((transaction, index) => {
            const paymentLabel = transaction.paymentMethod
              ? (PAYMENT_LABELS[transaction.paymentMethod] ?? transaction.paymentMethod)
              : null;
            const isPrinting = printing === transaction.id;

            return (
              <div
                key={transaction.id ?? index}
                className="group flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <span className="text-xs font-mono text-gray-400 w-5 shrink-0 tabular-nums">
                  {String(index + 1).padStart(2, '0')}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-900 text-sm truncate">
                    {transaction.from ?? 'Desconocido'}
                  </p>
                  <div className="flex items-center gap-1.5">
                    <p className="text-xs text-gray-500">{transaction.time ?? ''}</p>
                    {paymentLabel && (
                      <span className="text-xs text-gray-400">· {paymentLabel}</span>
                    )}
                  </div>
                </div>
                <p className="font-semibold text-sm tabular-nums text-green">
                  +S/ {Math.abs(Number(transaction.amount ?? 0)).toFixed(2)}
                </p>
                <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => exportOrderPdf(transaction, paymentLabel)}
                    title="Exportar PDF"
                    className="p-1 rounded text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                  >
                    <BsFiletypePdf size={15} />
                  </button>
                  <button
                    onClick={() => handlePrintThermal(transaction)}
                    disabled={isPrinting || transaction.orderId == null}
                    title="Imprimir ticket"
                    className="p-1 rounded text-gray-400 hover:text-blue-500 hover:bg-blue-50 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    <FiPrinter size={15} className={isPrinting ? 'animate-pulse' : ''} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
