import { Modal, TitleModal, Button } from "@/shared/components";
import { useModal } from "@/shared/hooks/useModal";
import { useChangeOrderTable, useTables, useOrderActive, useSelectedTable, useChangeTableModal, TableStatus } from "@/features/tables";
import type { Table } from "@/features/tables/types/Table";
import { Variant } from "@/shared/enums/VariantEnum";
import { useState, useEffect, useRef } from "react";

interface Props {
  changeTableModal: ReturnType<typeof useChangeTableModal>;
  selectedTable: ReturnType<typeof useSelectedTable>;
}

const POPOVER_WIDTH = 272;
const POPOVER_HEIGHT = 320;
const GAP = 8;

function calcPosition(rect: DOMRect) {
  const vw = window.innerWidth;
  const vh = window.innerHeight;

  // align right edge of popover with right edge of button; clamp to viewport
  let left = rect.right - POPOVER_WIDTH;
  if (left < GAP) left = GAP;
  if (left + POPOVER_WIDTH > vw - GAP) left = vw - POPOVER_WIDTH - GAP;

  // open below if enough room, otherwise open above
  const spaceBelow = vh - rect.bottom - GAP;
  const top = spaceBelow >= POPOVER_HEIGHT
    ? rect.bottom + GAP
    : rect.top - POPOVER_HEIGHT - GAP;

  return { top: Math.max(GAP, top), left };
}

export function ModalChangeTable({ changeTableModal, selectedTable }: Props) {
  const isMobile = typeof window !== "undefined" && window.innerWidth < 1024;

  const dialogRef = useModal(
    isMobile ? false : changeTableModal.isOpen,
    changeTableModal.sourceRef,
  );

  const { tables } = useTables();
  const { order } = useOrderActive(
    selectedTable.selectedTable?.id || 0,
    changeTableModal.isOpen && !!selectedTable.selectedTable?.id,
  );
  const changeOrderTableMutation = useChangeOrderTable();
  const [selectedDestinationTable, setSelectedDestinationTable] = useState<Table | null>(null);
  const [error, setError] = useState<string | null>(null);
  const popoverRef = useRef<HTMLDivElement>(null);

  const availableTables = tables.filter(
    (t) => t.status === TableStatus.FREE && t.id !== selectedTable.selectedTable?.id,
  );

  useEffect(() => {
    if (!changeTableModal.isOpen) {
      setSelectedDestinationTable(null);
      setError(null);
    }
  }, [changeTableModal.isOpen]);

  const executeChange = async (targetTable: Table) => {
    if (!order) return;
    try {
      await changeOrderTableMutation.mutateAsync({
        orderId: order.id,
        destinationTableId: targetTable.id,
      });
      changeTableModal.close();
    } catch (err) {
      setError((err as Error).message || "Error al cambiar la orden de mesa");
    }
  };

  const handleTableClick = (t: Table) => {
    if (isMobile) {
      executeChange(t);
    } else {
      setSelectedDestinationTable(t);
      setError(null);
    }
  };

  const handleCancel = () => changeTableModal.close();

  if (!selectedTable.selectedTable) return null;

  const table = selectedTable.selectedTable;

  // ── Mobile: floating popover ────────────────────────────────────────────────
  if (isMobile) {
    if (!changeTableModal.isOpen) return null;

    const pos = changeTableModal.sourceRect
      ? calcPosition(changeTableModal.sourceRect)
      : { top: 80, left: GAP };

    return (
      <>
        {/* backdrop */}
        <div
          className="fixed inset-0 z-40"
          onClick={handleCancel}
        />

        {/* popover */}
        <div
          ref={popoverRef}
          className="fixed z-50 bg-white rounded-2xl shadow-[0_8px_32px_rgba(0,0,0,0.18)] p-4 flex flex-col animate-[modal-in_0.2s_ease-out]"
          style={{ width: POPOVER_WIDTH, height: POPOVER_HEIGHT, top: pos.top, left: pos.left }}
        >
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-3 shrink-0">
            Mesa {table.number} → selecciona destino
          </p>

          {availableTables.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-4">No hay mesas libres</p>
          ) : (
            <div className="grid grid-cols-2 gap-2 overflow-y-auto flex-1 content-start">
              {availableTables.map((t) => (
                <button
                  key={t.id}
                  onClick={() => handleTableClick(t)}
                  disabled={changeOrderTableMutation.isPending}
                  className="aspect-square flex flex-col items-center justify-center rounded-xl border-2 border-gray-200 hover:border-green/60 hover:bg-green/5 active:scale-95 transition-all cursor-pointer disabled:opacity-40"
                >
                  <p className="font-bold text-2xl text-gray-900">{t.number}</p>
                  <p className="text-xs text-green font-medium mt-0.5">Libre</p>
                </button>
              ))}
            </div>
          )}

          {error && <p className="text-red text-xs mt-2 shrink-0">{error}</p>}
        </div>
      </>
    );
  }

  // ── Desktop: dialog ─────────────────────────────────────────────────────────
  return (
    <Modal
      dialogRef={dialogRef}
      setOpen={changeTableModal.close}
      className="lg:max-w-2xl"
    >
      <TitleModal>Cambiar Mesa</TitleModal>

      <p className="text-sm text-gray-500 -mt-2">
        Mesa <span className="font-semibold text-gray-700">{table.number}</span>
        {order && (
          <> · <span className="font-mono text-xs tracking-wide">{order.orderCode}</span></>
        )}
      </p>

      {availableTables.length === 0 ? (
        <div className="flex items-center justify-center py-10">
          <p className="text-gray-400 text-sm">No hay mesas libres disponibles</p>
        </div>
      ) : (
        <div className="grid grid-cols-3 gap-4 max-h-96 overflow-y-auto">
          {availableTables.map((t) => (
            <button
              key={t.id}
              onClick={() => handleTableClick(t)}
              disabled={changeOrderTableMutation.isPending}
              className={`
                aspect-square flex flex-col items-center justify-center rounded-2xl border-2 transition-all cursor-pointer disabled:opacity-40 active:scale-95
                ${selectedDestinationTable?.id === t.id
                  ? "border-green bg-green/10 shadow-md"
                  : "border-gray-200 hover:border-green/50 hover:bg-gray-50"}
              `}
            >
              <p className="font-bold text-xl text-gray-900">{t.number}</p>
              <p className="text-sm text-green font-medium mt-1">Libre</p>
            </button>
          ))}
        </div>
      )}

      {error && (
        <div className="bg-red/10 border border-red/30 rounded-lg p-3">
          <p className="text-red text-sm">{error}</p>
        </div>
      )}

      <div className="flex gap-3">
        <Button
          variant={Variant.DEFAULT}
          styleButton="Secondary"
          className="flex-1"
          onClick={handleCancel}
          disabled={changeOrderTableMutation.isPending}
        >
          Cancelar
        </Button>
        <Button
          variant={Variant.GREEN}
          className="flex-1"
          onClick={() => selectedDestinationTable && executeChange(selectedDestinationTable)}
          disabled={!selectedDestinationTable || changeOrderTableMutation.isPending || availableTables.length === 0}
        >
          {changeOrderTableMutation.isPending ? "Transfiriendo..." : "Confirmar Cambio"}
        </Button>
      </div>
    </Modal>
  );
}
