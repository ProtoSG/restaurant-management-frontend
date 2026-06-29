// Encoder ESC/POS que implementa el mismo subconjunto de la API del SDK ePOS que
// usan los tickets (ver TicketPrinter). Permite reutilizar buildTicket/
// buildKitchenTicket tal cual, pero emitiendo bytes raw para enviar por USB a
// través del print-server local (CUPS `lp -o raw`).

import type { TicketPrinter } from "./ticketBuilder";

// Comandos ESC/POS
const ESC = 0x1b;
const GS = 0x1d;
const FS = 0x1c;

export class EscPosBuilder implements TicketPrinter {
  // Constantes equivalentes a las del SDK (sus valores no importan acá; solo se
  // comparan/pasan dentro de las funciones de build).
  readonly ALIGN_LEFT = 0;
  readonly ALIGN_CENTER = 1;
  readonly ALIGN_RIGHT = 2;
  readonly COLOR_1 = 1;
  readonly CUT_FEED = 1;

  private parts: number[] = [];

  constructor() {
    // Init + salir de modo chino + seleccionar tabla de códigos para acentos
    // (mismo arranque que el print-server histórico, que imprimía bien en es-PE).
    this.push(ESC, 0x40); // ESC @  (init)
    this.push(FS, 0x2e); // FS .   (cancel kanji/chinese)
    this.push(ESC, 0x74, 0x02); // ESC t 2 (code page)
  }

  private push(...bytes: number[]): void {
    for (const b of bytes) this.parts.push(b & 0xff);
  }

  /** Codifica una cadena en latin1 (1 byte por carácter; >255 → '?'). */
  private pushText(s: string): void {
    for (let i = 0; i < s.length; i++) {
      const code = s.charCodeAt(i);
      this.parts.push(code <= 0xff ? code : 0x3f /* '?' */);
    }
  }

  addTextAlign(align: number): void {
    this.push(ESC, 0x61, align & 0xff); // ESC a n
  }

  addTextStyle(reverse: boolean, underline: boolean, bold: boolean): void {
    this.push(ESC, 0x45, bold ? 1 : 0); // ESC E n  (bold)
    this.push(ESC, 0x2d, underline ? 1 : 0); // ESC - n  (underline)
    this.push(GS, 0x42, reverse ? 1 : 0); // GS B n   (reverse)
  }

  addTextSize(width: number, height: number): void {
    const w = Math.max(1, Math.min(8, width)) - 1;
    const h = Math.max(1, Math.min(8, height)) - 1;
    this.push(GS, 0x21, (w << 4) | h); // GS ! n
  }

  addText(data: string): void {
    this.pushText(data);
  }

  addFeedLine(lines: number): void {
    this.push(ESC, 0x64, lines & 0xff); // ESC d n
  }

  addCut(): void {
    this.push(GS, 0x56, 0x42, 0x00); // GS V 66 0  (feed + partial cut)
  }

  toBytes(): Uint8Array {
    return Uint8Array.from(this.parts);
  }
}
