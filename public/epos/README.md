# Epson ePOS-Device SDK

Coloca aquí el archivo **`epos-2.js`** del **Epson ePOS-Device SDK for JavaScript**.

Descarga oficial:
https://download.epson-biz.com/modules/pos/ → categoría *ePOS-Device SDK* → JavaScript.

El SDK expone el global `window.epson` y se carga bajo demanda desde
`/epos/epos-2.js` (ver `src/shared/printing/eposLoader.ts`). Sin este archivo la
impresión no funciona, pero el resto de la app sí.

Nota: los puertos 8008 (ws) / 8043 (wss) y el protocolo WebSocket corresponden a
este SDK (ePOS-Device), no a la API ePOS-Print antigua basada en HTTP.
