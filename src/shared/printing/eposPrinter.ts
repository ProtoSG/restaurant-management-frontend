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

// El SDK de Epson devuelve códigos técnicos en inglés (ERROR_TIMEOUT, DEVICE_NOT_FOUND, etc.)
// que no le dicen nada a un mozo/cajero. Los traducimos acá; el código crudo queda
// solo en la consola para quien tenga que diagnosticar el problema.
const CONNECT_ERRORS: Record<string, string> = {
  ERROR_TIMEOUT: "La impresora no respondió a tiempo. Revisá que esté encendida y conectada a la red.",
  ERROR_PARAMETER: "Configuración de impresora inválida. Avisá a soporte.",
  ERROR_ALREADY_CONNECT: "Ya hay una conexión abierta con la impresora, probá de nuevo en unos segundos.",
  ERROR_ALREADY_OPEN: "Ya hay una conexión abierta con la impresora, probá de nuevo en unos segundos.",
  ERROR_SSL: "No se pudo establecer una conexión segura con la impresora.",
};

const INIT_ERRORS: Record<string, string> = {
  DEVICE_NOT_FOUND: "No se encontró la impresora en la red.",
  DEVICE_IN_USE: "La impresora está siendo usada por otro dispositivo.",
  DEVICE_TYPE_INVALID: "Configuración de impresora inválida. Avisá a soporte.",
};

const PRINT_ERRORS: Record<string, string> = {
  EPTR_REC_EMPTY: "La impresora se quedó sin papel.",
  EPTR_COVER_OPEN: "La tapa de la impresora está abierta.",
  EPTR_PAPER_JAM: "Hay un atasco de papel en la impresora.",
  EPTR_AUTOCUTTER_ERR: "Error en la cuchilla automática de la impresora.",
  EPTR_UNRECOVERABLE: "Error grave en la impresora, puede necesitar reiniciarse.",
};

function friendlyMessage(map: Record<string, string>, code: string, fallback: string, label: string): string {
  const message = map[code];
  if (!message) {
    console.error(`[printer] ${label} — código no mapeado: ${code}`);
  }
  return message ?? fallback;
}

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
            reject(new Error(friendlyMessage(
              CONNECT_ERRORS, res,
              "No se pudo conectar a la impresora. Revisá que esté encendida y en la misma red.",
              "connect"
            )));
            return;
          }
          device.createDevice(
            EPSON_DEVICE_ID,
            device.DEVICE_TYPE_PRINTER,
            { crypto: EPSON_PRINTER_CRYPTO, buffer: false },
            (printer: any, code: string) => {
              clearTimeout(timer);
              if (code !== "OK") {
                reject(new Error(friendlyMessage(
                  INIT_ERRORS, code,
                  "No se pudo inicializar la impresora.",
                  "init"
                )));
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
          else reject(new Error(friendlyMessage(
            PRINT_ERRORS, r.code,
            "No se pudo completar la impresión.",
            "print"
          )));
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
