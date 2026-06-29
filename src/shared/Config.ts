export const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8080/api";

// Epson ePOS-Device SDK (impresión directa browser → impresora LAN).
// Un solo flag SSL alterna local (8008/ws) ↔ producción (8043/wss).
const EPSON_SSL = import.meta.env.VITE_EPSON_SSL === "true";
export const EPSON_PRINTER_IP     = import.meta.env.VITE_EPSON_PRINTER_IP || "192.168.18.154";
export const EPSON_PRINTER_PORT   = EPSON_SSL ? 8043 : 8008;
export const EPSON_PRINTER_CRYPTO = EPSON_SSL;
export const EPSON_DEVICE_ID      = import.meta.env.VITE_EPSON_DEVICE_ID || "local_printer";
export const RESTAURANT_NAME      = import.meta.env.VITE_RESTAURANT_NAME || "La Carte";

// Transporte de impresión: "epson" (browser → impresora LAN vía ePOS SDK) o
// "usb" (print-server local → CUPS lp -o raw). USB es temporal mientras se
// configura la red de la impresora.
export const PRINT_TRANSPORT = import.meta.env.VITE_PRINT_TRANSPORT || "epson";
export const USB_PRINT_URL   = import.meta.env.VITE_USB_PRINT_URL || "http://localhost:3001";
