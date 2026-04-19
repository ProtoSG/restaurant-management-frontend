import { Modal, TitleModal, Button } from "@/shared/components";
import { useModal } from "@/shared/hooks/useModal";
import { useChangeOrderTable, useTables, useOrderActive, useSelectedTable, useChangeTableModal, TableStatus } from "@/features/tables";
import type { Table } from "@/features/tables/types/Table";
import { Variant } from "@/shared/enums/VariantEnum";
import { useState } from "react";

interface Props {
  changeTableModal: ReturnType<typeof useChangeTableModal>;
  selectedTable: ReturnType<typeof useSelectedTable>;
}

export function ModalChangeTable({ changeTableModal, selectedTable }: Props) {
  const dialogRef = useModal(changeTableModal.isOpen);
  const { tables } = useTables();
  const { order } = useOrderActive(selectedTable.selectedTable?.id || 0, changeTableModal.isOpen && !!selectedTable.selectedTable?.id);
  const changeOrderTableMutation = useChangeOrderTable();
  const [selectedDestinationTable, setSelectedDestinationTable] = useState<Table | null>(null);
  const [error, setError] = useState<string | null>(null);

  const availableTables = tables.filter(
    (t) => t.status === TableStatus.FREE && t.id !== selectedTable.selectedTable?.id
  );

  const handleSelectTable = (targetTable: Table) => {
    setSelectedDestinationTable(targetTable);
    setError(null);
  };

  const handleConfirmChange = async () => {
    if (!order || !selectedDestinationTable) return;

    try {
      await changeOrderTableMutation.mutateAsync({
        orderId: order.id,
        destinationTableId: selectedDestinationTable.id
      });
      changeTableModal.close();
      setSelectedDestinationTable(null);
      setError(null);
    } catch (error) {
      console.error('Error al cambiar la orden de mesa:', error);
      setError((error as Error).message || 'Error al cambiar la orden de mesa');
    }
  };

  const handleCancel = () => {
    changeTableModal.close();
    setSelectedDestinationTable(null);
    setError(null);
  };

  if (!selectedTable.selectedTable) {
    return null;
  }

  const table = selectedTable.selectedTable;

  return (
    <Modal
      dialogRef={dialogRef}
      setOpen={changeTableModal.close}
      className="max-w-2xl"
    >
      <TitleModal>
        Cambiar Orden a Otra Mesa
      </TitleModal>

      <div className="space-y-6">
        <div className="text-center space-y-2">
          <p className="text-lg">
            Selecciona la mesa destino para transferir la orden
          </p>
          <p className="text-sm text-gray-600">
            Desde Mesa <span className="font-semibold">{table.number}</span>
            {order && (
              <> • Código: <span className="font-semibold">{order.orderCode}</span></>
            )}
          </p>
        </div>

        {availableTables.length === 0 ? (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-center">
            <p className="text-yellow-800">No hay mesas disponibles para transferir la orden</p>
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-4 max-h-96 overflow-y-auto p-2">
            {availableTables.map((t) => (
              <button
                key={t.id}
                onClick={() => handleSelectTable(t)}
                className={`
                  p-4 border-2 rounded-lg transition-all cursor-pointer
                  ${selectedDestinationTable?.id === t.id
                    ? 'border-green bg-green/10 shadow-md'
                    : 'border-gray-300 hover:border-green/50 hover:bg-gray-50'
                  }
                `}
              >
                <div className="text-center">
                  <p className="font-semibold text-lg">Mesa {t.number}</p>
                  <p className="text-sm text-green">Libre</p>
                </div>
              </button>
            ))}
          </div>
        )}

        {error && (
          <div className="bg-red/10 border border-red/30 rounded-lg p-3">
            <p className="text-red text-sm">{error}</p>
          </div>
        )}

        <div className="flex gap-3 pt-2">
          <Button 
            variant={Variant.DEFAULT} 
            className="flex-1"
            onClick={handleCancel}
            styleButton="Secondary"
            disabled={changeOrderTableMutation.isPending}
          >
            Cancelar
          </Button>
          <Button 
            variant={Variant.GREEN} 
            className="flex-1"
            onClick={handleConfirmChange}
            disabled={!selectedDestinationTable || changeOrderTableMutation.isPending || availableTables.length === 0}
          >
            {changeOrderTableMutation.isPending ? 'Transfiriendo...' : 'Confirmar Cambio'}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
