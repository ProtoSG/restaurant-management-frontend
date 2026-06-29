// Transporte USB (temporal): construye el ticket como bytes ESC/POS y los envía
// al print-server local, que los pasa a la impresora por CUPS (`lp -o raw`).
// La impresora está enchufada por USB a la misma laptop que corre todo.

import { USB_PRINT_URL } from "@/shared/Config";
import type { Order } from "@/shared/types/Order";
import { EscPosBuilder } from "./escposBuilder";
import { buildTicket, buildKitchenTicket } from "./ticketBuilder";

function send(bytes: Uint8Array): Promise<void> {
  return fetch(`${USB_PRINT_URL}/print`, {
    method: "POST",
    headers: { "Content-Type": "application/octet-stream" },
    body: bytes,
  }).then(async (res) => {
    if (!res.ok) {
      const msg = await res.text().catch(() => "");
      throw new Error(`Error al imprimir (USB): ${msg || res.status}`);
    }
  });
}

export function printOrderTicket(order: Order): Promise<void> {
  const b = new EscPosBuilder();
  buildTicket(b, order);
  return send(b.toBytes());
}

export function printKitchenTicket(order: Order): Promise<void> {
  const b = new EscPosBuilder();
  buildKitchenTicket(b, order);
  return send(b.toBytes());
}
