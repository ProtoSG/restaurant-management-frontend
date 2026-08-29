import { FaCheckCircle, FaExclamationCircle, FaChevronRight, FaShoppingBag } from "react-icons/fa";
import { Tag } from "@/shared/components";
import { Variant } from "@/shared/enums/VariantEnum";
import type { VoiceOrderPreviewItem, VoiceOrderItemStatus, VoiceOrderTableStatus } from "../types/VoiceOrder";

const ITEM_STATUS_LABEL: Record<Exclude<VoiceOrderItemStatus, 'RESOLVED'>, string> = {
  NOT_FOUND: "No lo encontramos — elegí el producto",
  PRICE_MISMATCH: "Ese precio no existe — elegí una opción",
  NOT_AVAILABLE: "No disponible",
};

function ItemStatusChip({ status }: { status: VoiceOrderItemStatus }) {
  if (status === 'RESOLVED') return null;
  const variant = status === 'PRICE_MISMATCH' ? Variant.ORANGE : Variant.RED;
  return (
    <span className="inline-flex items-center gap-1">
      <Tag variant={variant}>
        <span className="inline-flex items-center gap-1">
          <FaExclamationCircle className="text-[10px]" />
          {ITEM_STATUS_LABEL[status]}
        </span>
      </Tag>
    </span>
  );
}

function TableBanner({ tableNumber, tableStatus, isTakeawayOrder, onBackToDictate }: {
  tableNumber: number | null;
  tableStatus: VoiceOrderTableStatus;
  isTakeawayOrder: boolean;
  onBackToDictate: () => void;
}) {
  if (isTakeawayOrder) {
    return (
      <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl bg-orange/10">
        <FaShoppingBag className="text-orange text-sm shrink-0" />
        <span className="text-sm font-semibold text-gray-900">Para llevar — sin mesa</span>
      </div>
    );
  }

  if (tableStatus === 'RESOLVED') {
    return (
      <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl bg-green/10">
        <FaCheckCircle className="text-green text-sm shrink-0" />
        <span className="text-sm font-semibold text-gray-900">Mesa {tableNumber}</span>
      </div>
    );
  }

  const message = tableStatus === 'NOT_FOUND' && tableNumber != null
    ? `No reconocimos la mesa ${tableNumber} — probá de nuevo o dictá de nuevo mencionando la mesa.`
    : "No mencionaste una mesa — dictá de nuevo mencionando la mesa.";

  return (
    <div className="flex flex-col gap-2 px-3 py-3 rounded-xl bg-red/10">
      <div className="flex items-start gap-2">
        <FaExclamationCircle className="text-red text-sm shrink-0 mt-0.5" />
        <p className="text-sm font-medium text-gray-900">{message}</p>
      </div>
      <button
        onClick={onBackToDictate}
        className="self-start text-sm font-semibold text-orange hover:underline cursor-pointer"
      >
        Volver a dictar
      </button>
    </div>
  );
}

interface Props {
  tableNumber: number | null;
  tableStatus: VoiceOrderTableStatus;
  isTakeawayOrder: boolean;
  items: VoiceOrderPreviewItem[];
  allResolved: boolean;
  total: number;
  isConfirming: boolean;
  onFixItem: (index: number) => void;
  onConfirm: () => void;
  onBackToDictate: () => void;
}

export function ReviewStep({
  tableNumber, tableStatus, isTakeawayOrder, items, allResolved, total, isConfirming,
  onFixItem, onConfirm, onBackToDictate,
}: Props) {
  const hasAnyTakeawayItem = isTakeawayOrder || items.some((i) => i.isTakeaway);

  return (
    <div className="flex flex-col flex-1 min-h-0 max-w-2xl mx-auto w-full">
      <div className="flex flex-col gap-3 flex-1 min-h-0 overflow-y-auto px-1 pb-4">
        <TableBanner
          tableNumber={tableNumber}
          tableStatus={tableStatus}
          isTakeawayOrder={isTakeawayOrder}
          onBackToDictate={onBackToDictate}
        />

        {/* Todo ítem se puede tocar para ajustarlo — cantidad, precio, nota o para llevar —
            no solo los que quedaron sin resolver. */}
        <ul className="flex flex-col gap-2">
          {items.map((item, index) => {
            const isResolved = item.status === 'RESOLVED';
            return (
              <li key={index}>
                <div
                  onClick={() => onFixItem(index)}
                  role="button"
                  aria-label={`Editar ${item.productName ?? item.rawText}`}
                  className={`flex items-center gap-3 px-3 py-3 rounded-xl border transition-colors cursor-pointer select-none hover:bg-gray-50 active:bg-gray-100 ${
                    isResolved ? "bg-gray-50 border-gray-100" : "bg-white border-gray-200"
                  }`}
                >
                  <div className="flex-1 min-w-0 flex flex-col gap-1">
                    <p className="font-semibold text-sm text-gray-900 break-words">
                      {item.productName ?? item.rawText}
                    </p>
                    {!isResolved && (
                      <p className="text-xs text-gray-400 italic">Dictado: “{item.rawText}”</p>
                    )}
                    {item.notes && (
                      <p className="text-xs text-gray-400">Nota: {item.notes}</p>
                    )}
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <ItemStatusChip status={item.status} />
                      {!isTakeawayOrder && item.isTakeaway && (
                        <span className="inline-flex items-center gap-1 text-xs font-medium text-orange">
                          <FaShoppingBag className="text-[10px]" />
                          Para llevar
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    {isResolved && (
                      <>
                        <span className="text-sm font-bold text-gray-700">x{item.quantity}</span>
                        <span className="text-sm font-semibold text-gray-600 tabular-nums">
                          S/ {((item.selectedPrice ?? 0) * item.quantity).toFixed(2)}
                        </span>
                      </>
                    )}
                    <FaChevronRight className="text-gray-300 text-xs" />
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      </div>

      <div className="shrink-0 pt-3 border-t border-gray-200 flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-500">Total del pedido</span>
          <span className="text-2xl font-bold text-gray-900">S/ {total.toFixed(2)}</span>
        </div>
        {hasAnyTakeawayItem && (
          <p className="text-xs text-gray-400 text-center">
            El recargo por llevar se calcula al confirmar, según categoría
          </p>
        )}
        {!allResolved && (
          <p className="text-xs text-red font-medium text-center">
            Resuelve los ítems pendientes antes de confirmar
          </p>
        )}
        <button
          onClick={onConfirm}
          disabled={!allResolved || isConfirming}
          className="w-full py-3.5 rounded-xl bg-green text-white text-sm font-semibold disabled:opacity-40 cursor-pointer transition-opacity"
        >
          {isConfirming ? "Confirmando…" : `Confirmar pedido — S/ ${total.toFixed(2)}`}
        </button>
      </div>
    </div>
  );
}
