import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { MdArrowBack } from "react-icons/md";
import { cn } from "@/shared/utils/utils";
import { OrderType } from "@/shared/enums/OrderType";
import { useExtractVoiceOrder, useConfirmVoiceOrder } from "../hooks/useVoiceOrder";
import { DictateStep } from "./DictateStep";
import { ReviewStep } from "./ReviewStep";
import { ItemFixSheet, type ResolvedFix } from "./ItemFixSheet";
import type { VoiceOrderPreviewItem, VoiceOrderTableStatus } from "../types/VoiceOrder";

type Step = 'dictate' | 'review';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

/** Misma animación de slide que ya usa OrderDetailView.tsx para su overlay de página completa. */
function useSlideOverlay(isOpen: boolean) {
  const [mounted, setMounted] = useState(isOpen);
  const [closing, setClosing] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setMounted(true);
      setClosing(false);
      return;
    }
    if (!mounted) return;

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduceMotion) {
      setMounted(false);
      return;
    }

    setClosing(true);
    const timeout = window.setTimeout(() => {
      setMounted(false);
      setClosing(false);
    }, 160);
    return () => window.clearTimeout(timeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  return { mounted, closing };
}

export function VoiceOrderFlow({ isOpen, onClose }: Props) {
  const { mounted, closing } = useSlideOverlay(isOpen);
  const navigate = useNavigate();

  const [step, setStep] = useState<Step>('dictate');
  const [text, setText] = useState("");
  const [showEmptyMessage, setShowEmptyMessage] = useState(false);
  const [tableNumber, setTableNumber] = useState<number | null>(null);
  const [tableStatus, setTableStatus] = useState<VoiceOrderTableStatus>('MISSING');
  const [isTakeawayOrder, setIsTakeawayOrder] = useState(false);
  const [items, setItems] = useState<VoiceOrderPreviewItem[]>([]);
  const [fixingIndex, setFixingIndex] = useState<number | null>(null);

  const extractMutation = useExtractVoiceOrder();
  const confirmMutation = useConfirmVoiceOrder();

  const resetDraft = () => {
    setStep('dictate');
    setText("");
    setShowEmptyMessage(false);
    setTableNumber(null);
    setTableStatus('MISSING');
    setIsTakeawayOrder(false);
    setItems([]);
    setFixingIndex(null);
  };

  useEffect(() => {
    if (!isOpen) resetDraft();
  }, [isOpen]);

  // La mesa está resuelta si se identificó una real, O si el pedido entero es para llevar y
  // por diseño no necesita ninguna (NOT_APPLICABLE) — mismo criterio que VoiceOrderValidator.
  const tableDimensionResolved = tableStatus === 'RESOLVED' || tableStatus === 'NOT_APPLICABLE';
  const allResolved = tableDimensionResolved && items.length > 0 && items.every((i) => i.status === 'RESOLVED');
  const total = useMemo(
    () => items.reduce((sum, i) => sum + (i.selectedPrice ?? 0) * i.quantity, 0),
    [items]
  );

  // Nada se envía al backend hasta este punto: extraer solo genera una vista previa,
  // recién "Confirmar pedido" en el paso de revisión escribe algo real.
  const handleExtract = async () => {
    setShowEmptyMessage(false);
    try {
      const preview = await extractMutation.mutateAsync(text);
      if (preview.items.length === 0) {
        setShowEmptyMessage(true);
        return;
      }
      setTableNumber(preview.tableNumber);
      setTableStatus(preview.tableStatus);
      setIsTakeawayOrder(preview.isTakeawayOrder);
      setItems(preview.items);
      setStep('review');
    } catch {
      // El error ya se muestra vía toast en el hook.
    }
  };

  const handleBackToDictate = () => {
    setStep('dictate');
    setItems([]);
    setTableNumber(null);
    setTableStatus('MISSING');
    setIsTakeawayOrder(false);
  };

  const handleResolveFix = (resolved: ResolvedFix) => {
    setItems((prev) =>
      prev.map((item, index) =>
        index === fixingIndex
          ? {
              ...item,
              status: 'RESOLVED',
              productId: resolved.productId,
              productName: resolved.productName,
              selectedPrice: resolved.selectedPrice,
              quantity: resolved.quantity,
              notes: resolved.notes,
              isTakeaway: resolved.isTakeaway,
            }
          : item
      )
    );
    setFixingIndex(null);
  };

  const handleDeleteItem = () => {
    setItems((prev) => prev.filter((_, index) => index !== fixingIndex));
    setFixingIndex(null);
  };

  const handleConfirm = async () => {
    if (!allResolved) return;
    if (!isTakeawayOrder && tableNumber == null) return;
    try {
      const order = await confirmMutation.mutateAsync({
        tableNumber: isTakeawayOrder ? null : tableNumber,
        isTakeawayOrder,
        items: items.map((i) => ({
          productId: i.productId!,
          selectedPrice: i.selectedPrice!,
          quantity: i.quantity,
          notes: i.notes,
          isTakeaway: i.isTakeaway,
        })),
      });
      toast.success(
        order.type === OrderType.TAKEAWAY
          ? "Pedido para llevar creado"
          : `Pedido creado — Mesa ${order.tableNumber ?? tableNumber}`
      );
      onClose();
      navigate('/orders', { state: { openOrderId: order.id } });
    } catch {
      // El error ya se muestra vía toast en el hook.
    }
  };

  const isBlocked = confirmMutation.isPending;
  const blockedTitle = "Esperando confirmación…";

  const handleClose = () => {
    if (isBlocked) return;
    onClose();
  };

  if (!mounted) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Pedido por voz"
      className={cn(
        "fixed inset-0 z-[65] flex flex-col bg-background",
        closing ? "modal-slide-exit" : "modal-slide-enter"
      )}
    >
      {/* Este overlay reemplaza TopBar/BottomNav enteros mientras está abierto — a
          diferencia de esas dos, no hay layout padre que le reserve el área segura
          de notch/home-indicator, así que la maneja acá (mismo criterio que
          TopBar.tsx/BottomNav.tsx: pt-/pb-[env(safe-area-inset-*)]). Sin esto, en
          tablet no se nota (insets suelen ser 0 ahí), pero en un celular con
          home-indicator el botón "Confirmar pedido" queda pegado al borde real. */}
      <header className="flex items-center gap-2 px-3 pt-[calc(0.625rem+env(safe-area-inset-top))] pb-2.5 lg:px-8 lg:py-4 border-b border-gray-200 shrink-0">
        <button
          onClick={handleClose}
          disabled={isBlocked}
          aria-label={isBlocked ? blockedTitle : "Cerrar"}
          title={isBlocked ? blockedTitle : undefined}
          className={cn(
            "min-w-[44px] min-h-[44px] flex items-center justify-center rounded-lg text-gray-500 hover:text-red hover:bg-red/5 transition-colors cursor-pointer shrink-0",
            isBlocked && "opacity-40 cursor-not-allowed hover:bg-transparent hover:text-gray-500"
          )}
        >
          <MdArrowBack size={22} className={isBlocked ? "animate-pulse" : ""} />
        </button>

        <div className="flex-1 min-w-0 flex items-center justify-center lg:justify-start">
          <h1 className="font-semibold text-base lg:text-xl leading-tight truncate">Pedido por voz</h1>
        </div>

        <div className="w-11 shrink-0" />
      </header>

      <div className="flex-1 min-h-0 px-3 pt-4 pb-[calc(1rem+env(safe-area-inset-bottom))] lg:px-8 lg:py-6 overflow-hidden flex flex-col">
        {step === 'dictate' ? (
          <DictateStep
            text={text}
            onChangeText={setText}
            onExtract={handleExtract}
            isExtracting={extractMutation.isPending}
            showEmptyMessage={showEmptyMessage}
          />
        ) : (
          <ReviewStep
            tableNumber={tableNumber}
            tableStatus={tableStatus}
            isTakeawayOrder={isTakeawayOrder}
            items={items}
            allResolved={allResolved}
            total={total}
            isConfirming={confirmMutation.isPending}
            onFixItem={setFixingIndex}
            onConfirm={handleConfirm}
            onBackToDictate={handleBackToDictate}
          />
        )}
      </div>

      {fixingIndex !== null && items[fixingIndex] && (
        <ItemFixSheet
          item={items[fixingIndex]}
          showTakeawayToggle={!isTakeawayOrder}
          onResolve={handleResolveFix}
          onDelete={handleDeleteItem}
          onClose={() => setFixingIndex(null)}
        />
      )}
    </div>
  );
}
