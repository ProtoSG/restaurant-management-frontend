import { useLayoutEffect, useRef, type RefObject } from "react";

function expandFromCard(dialog: HTMLDialogElement, source: HTMLElement) {
  if (!dialog.open) dialog.showModal();

  const dr = dialog.getBoundingClientRect();
  const cr = source.getBoundingClientRect();

  const originX   = (cr.left + cr.width  / 2) - dr.left;
  const originY   = (cr.top  + cr.height / 2) - dr.top;
  const startScale = Math.min(cr.width / dr.width, 0.4);

  // Persist for close animation
  dialog.style.setProperty("--ct-card-ox",    `${originX}px`);
  dialog.style.setProperty("--ct-card-oy",    `${originY}px`);
  dialog.style.setProperty("--ct-card-scale", `${startScale}`);

  // Animation vars
  dialog.style.setProperty("--ct-ox",    `${originX}px`);
  dialog.style.setProperty("--ct-oy",    `${originY}px`);
  dialog.style.setProperty("--ct-scale", `${startScale}`);
  dialog.classList.add("modal-ct-open");

  dialog.addEventListener("animationend", () => {
    dialog.classList.remove("modal-ct-open");
    ["--ct-ox", "--ct-oy", "--ct-scale"].forEach(p => dialog.style.removeProperty(p));
  }, { once: true });
}

function collapseToCard(dialog: HTMLDialogElement) {
  const ox    = dialog.style.getPropertyValue("--ct-card-ox");
  const oy    = dialog.style.getPropertyValue("--ct-card-oy");
  const scale = dialog.style.getPropertyValue("--ct-card-scale");

  dialog.style.setProperty("--ct-ox",    ox);
  dialog.style.setProperty("--ct-oy",    oy);
  dialog.style.setProperty("--ct-scale", scale);
  dialog.classList.add("modal-ct-close");

  dialog.addEventListener("animationend", () => {
    dialog.classList.remove("modal-ct-close");
    if (dialog.open) dialog.close();
    ["--ct-ox", "--ct-oy", "--ct-scale",
     "--ct-card-ox", "--ct-card-oy", "--ct-card-scale",
    ].forEach(p => dialog.style.removeProperty(p));
  }, { once: true });
}

export function useModal(isOpen: boolean, sourceRef?: RefObject<HTMLElement | null>, mobileFullscreen?: boolean) {
  const dialogRef = useRef<HTMLDialogElement>(null);

  useLayoutEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    const isMobileFull = mobileFullscreen && window.innerWidth < 1024;

    // Reduce-motion (ej. tablet con "Eliminar animaciones"): abrir/cerrar al instante,
    // sin View Transitions ni animaciones por clase (que dependen de animationend).
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      if (isOpen) {
        if (!dialog.open) dialog.showModal();
        if (sourceRef) sourceRef.current = null;
      } else if (dialog.open) {
        dialog.close();
      }
      return;
    }

    if (isOpen) {
      if (isMobileFull) {
        if (!dialog.open) dialog.showModal();
        if (sourceRef) sourceRef.current = null;
        dialog.classList.add("modal-slide-enter");
        dialog.addEventListener("animationend", () => {
          dialog.classList.remove("modal-slide-enter");
        }, { once: true });
        return;
      }

      const source = sourceRef?.current ?? null;

      if (source?.isConnected) {
        expandFromCard(dialog, source);
        if (sourceRef) sourceRef.current = null;
        return;
      }

      if (!document.startViewTransition) { dialog.showModal(); return; }
      dialog.style.viewTransitionName = "modal-panel";
      const vt = document.startViewTransition(() => dialog.showModal());
      vt.finished.finally(() => { dialog.style.viewTransitionName = ""; });

    } else {
      if (!dialog.open) return;

      if (isMobileFull) {
        dialog.classList.add("modal-slide-exit");
        dialog.addEventListener("animationend", () => {
          dialog.classList.remove("modal-slide-exit");
          if (dialog.open) dialog.close();
        }, { once: true });
        return;
      }

      if (dialog.style.getPropertyValue("--ct-card-ox") !== "") {
        collapseToCard(dialog);
        return;
      }

      if (!document.startViewTransition) { dialog.close(); return; }
      dialog.style.viewTransitionName = "modal-panel";
      const vt = document.startViewTransition(() => dialog.close());
      vt.finished.finally(() => { dialog.style.viewTransitionName = ""; });
    }
  }, [isOpen]); // sourceRef and mobileFullscreen are stable, intentionally omitted

  return dialogRef;
}
