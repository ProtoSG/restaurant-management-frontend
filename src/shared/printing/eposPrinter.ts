// Servicio de impresión reutilizable basado en el Epson ePOS-Device SDK
// (WebSocket). La tablet del POS está en la misma LAN que la impresora y le
// habla directo por su IP, sin pasar por el backend (que vive en un VPS y no
// alcanza la IP local detrás del NAT).
//
// Cada impresión abre una conexión, envía el ticket y la cierra limpiamente.

import { loadEpos } from "./eposLoader";
import {
  EPSON_PRINTER_IP,
  EPSON_PRINTER_PORT,
  EPSON_PRINTER_CRYPTO,
  EPSON_DEVICE_ID,
} from "@/shared/Config";
import type { Order } from "@/shared/types/Order";
import { buildTicket, buildKitchenTicket } from "./ticketBuilder";

// El SDK no trae tipos; los aislamos acá.
/* eslint-disable @typescript-eslint/no-explicit-any */
interface Conn {
  device: any;
  printer: any;
}

const CONNECT_TIMEOUT_MS = 8000;

function connect(): Promise<Conn> {
  return loadEpos().then(
    (epson: any) =>
      new Promise<Conn>((resolve, reject) => {
        const device = new epson.ePOSDevice();
        const timer = setTimeout(
          () => reject(new Error("Timeout conectando a la impresora")),
          CONNECT_TIMEOUT_MS
        );

        device.connect(EPSON_PRINTER_IP, EPSON_PRINTER_PORT, (res: string) => {
          if (res !== "OK" && res !== "SSL_CONNECT_OK") {
            clearTimeout(timer);
            reject(new Error(`No se pudo conectar a la impresora (${res})`));
            return;
          }
          device.createDevice(
            EPSON_DEVICE_ID,
            device.DEVICE_TYPE_PRINTER,
            { crypto: EPSON_PRINTER_CRYPTO, buffer: false },
            (printer: any, code: string) => {
              clearTimeout(timer);
              if (code !== "OK") {
                reject(new Error(`No se pudo inicializar la impresora (${code})`));
                return;
              }
              resolve({ device, printer });
            }
          );
        });
      })
  );
}

/** Cierre limpio: libera el device y desconecta el WebSocket. */
function disconnect({ device, printer }: Conn): void {
  try {
    device.deleteDevice(printer, () => device.disconnect());
  } catch {
    try {
      device.disconnect();
    } catch {
      /* noop */
    }
  }
}

/** Ejecuta una impresión: conecta, construye, envía y desconecta limpiamente. */
function runPrint(build: (p: any) => void): Promise<void> {
  return connect().then(
    (conn) =>
      new Promise<void>((resolve, reject) => {
        const { printer } = conn;

        printer.onreceive = (r: { success: boolean; code: string }) => {
          disconnect(conn);
          if (r.success) resolve();
          else reject(new Error(`Error de impresión: ${r.code}`));
        };
        printer.onerror = () => {
          disconnect(conn);
          reject(new Error("Error de comunicación con la impresora"));
        };

        try {
          build(printer);
          printer.send();
        } catch (e) {
          disconnect(conn);
          reject(e instanceof Error ? e : new Error(String(e)));
        }
      })
  );
}

/** Ticket de cuenta (cliente): productos, precios y total. */
export function printOrderTicket(order: Order): Promise<void> {
  return runPrint((p) => buildTicket(p, order));
}

/** Comanda de cocina: nombre, cantidad y notas por categoría. */
export function printKitchenTicket(order: Order): Promise<void> {
  return runPrint((p) => buildKitchenTicket(p, order));
}
