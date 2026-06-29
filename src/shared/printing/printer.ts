// Punto de entrada de impresión: despacha al transporte configurado.
//   VITE_PRINT_TRANSPORT=epson  → directo browser → impresora LAN (ePOS SDK)
//   VITE_PRINT_TRANSPORT=usb    → print-server local → USB (CUPS lp -o raw)
//
// Los callsites importan desde aquí y no saben del transporte.

import { PRINT_TRANSPORT } from "@/shared/Config";
import * as epson from "./eposPrinter";
import * as usb from "./usbPrinter";

const transport = PRINT_TRANSPORT === "usb" ? usb : epson;

export const printOrderTicket = transport.printOrderTicket;
export const printKitchenTicket = transport.printKitchenTicket;
