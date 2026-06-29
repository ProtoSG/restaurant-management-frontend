// Carga perezosa e idempotente del Epson ePOS-Device SDK.
// El script se sirve como estático desde public/epos/epos-2.js y expone el
// global `window.epson`. Solo se carga la primera vez que se imprime, para no
// penalizar el arranque de la app.

let loading: Promise<unknown> | null = null;

export function loadEpos(): Promise<unknown> {
  const w = window as unknown as { epson?: unknown };
  if (w.epson) return Promise.resolve(w.epson);
  if (loading) return loading;

  loading = new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = "/epos/epos-2.js";
    script.async = true;
    script.onload = () =>
      w.epson
        ? resolve(w.epson)
        : reject(new Error("ePOS SDK cargó pero window.epson no existe"));
    script.onerror = () => {
      loading = null; // permitir reintento
      reject(new Error("No se pudo cargar el ePOS SDK (/epos/epos-2.js)"));
    };
    document.head.appendChild(script);
  });

  return loading;
}
