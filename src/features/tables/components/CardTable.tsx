import { FaRegEdit } from "react-icons/fa"
import { MdLockOpen } from "react-icons/md"
import type { Table } from "@/features/tables/types/Table"
import { Button, Tag, ConfirmDialog } from "@/shared/components"
import { TableStatus } from "@/features/tables"
import { Variant } from "@/shared/enums/VariantEnum"
import { useEffect, useState } from "react"
import type { MouseEvent } from "react"
import { FaRegShareFromSquare } from "react-icons/fa6"
import { useTableModal, useOrderItemsModal, useProductListModal, useChangeTableModal, useSelectedTable, useReleaseTable } from "@/features/tables"
import { useAuth } from "@/features/auth"

interface Props {
  table: Table;
  tableModal: ReturnType<typeof useTableModal>;
  orderItemsModal: ReturnType<typeof useOrderItemsModal>;
  productListModal: ReturnType<typeof useProductListModal>;
  changeTableModal: ReturnType<typeof useChangeTableModal>;
  selectedTable: ReturnType<typeof useSelectedTable>;
  clearOrderSelection?: () => void;
}

export function CardTable( { table, tableModal, orderItemsModal, productListModal, changeTableModal, selectedTable, clearOrderSelection }: Props) {
  const [ variant, setVariant ] = useState<Variant>(Variant.DEFAULT); 
  const [ shadowColor, setShadowColor ] = useState<string>("shadow-background");
  const [ tagLabel, setTagLabel ] = useState<string>('');
  const [ buttonLabel, setButtonLabel ] = useState<string>('');
  const [ showReleaseConfirm, setShowReleaseConfirm ] = useState<boolean>(false);
  const { user } = useAuth();
  const isAdmin = user?.role === 'ADMIN';
  const releaseTableMutation = useReleaseTable();

  useEffect(() => {
    switch(table.status) {
      case TableStatus.FREE: {
        setVariant(Variant.GREEN);
        setShadowColor('shadow-green');
        setTagLabel('Libre');
        setButtonLabel('Tomar Pedido');
        return;
      };
      case TableStatus.OCCUPIED: {
        setVariant(Variant.RED);
        setShadowColor('shadow-red');
        setTagLabel('Ocupado');
        setButtonLabel('Ver Pedido');
        return;
      };
      case TableStatus.RESERVED: {
        setVariant(Variant.ORANGE);
        setShadowColor('shadow-orange');
        setTagLabel('Reservada');
        setButtonLabel('Tomar Pedido');
        return;
      }
      default: {
        setVariant(Variant.DEFAULT);
        setShadowColor('shadow-background');
        setTagLabel(table.status);
        setButtonLabel(table.status);
        return;
      }
    }
  }, [table])
  
  const handleOpenFormModal = (e: MouseEvent<HTMLButtonElement>) => {
    tableModal.openEdit(table, e.currentTarget);
  }

  const handleOpenOrderItemsModal = async (e: MouseEvent<HTMLButtonElement>) => {
    clearOrderSelection?.();
    selectedTable.selectTable(table);
    const src = e.currentTarget as HTMLElement;
    // En desktop siempre abrimos el modal de detalle (items + carta al lado),
    // igual que en la vista de Pedidos. En móvil, una mesa libre va directo a
    // la carta porque no hay layout de dos columnas.
    if (table.status === TableStatus.FREE && window.innerWidth < 1024) {
      productListModal.open(src);
    } else {
      orderItemsModal.open(src);
    }
  };

  const handleChangeOrderOtherTable = (e: MouseEvent<HTMLButtonElement>) => {
    selectedTable.selectTable(table);
    changeTableModal.open(e.currentTarget);
  }

  const handleConfirmRelease = async () => {
    try {
      await releaseTableMutation.mutateAsync(table.id);
      setShowReleaseConfirm(false);
    } catch {
      // el error ya se maneja (toast) dentro del hook useReleaseTable
    }
  };

  return (
    <div className={`flex flex-col gap-4 rounded-lg p-3 bg-white shadow-[12px_12px_5px_1px] ${shadowColor}`}>
      <div>
        <div className="flex items-center justify-between font-semibold text-xl">
          <p>Mesa {table.number}</p>
          <div className="flex items-center ">
            {table.status === TableStatus.OCCUPIED && (
              <button
                onClick={handleChangeOrderOtherTable}
                aria-label="Mover orden a otra mesa"
                className="
                  flex items-center justify-center min-w-[44px] min-h-[44px] rounded-lg
                  transition-colors cursor-pointer hover:bg-green hover:text-foreground
                "
              ><FaRegShareFromSquare /></button>
            )}
            {isAdmin && table.status === TableStatus.OCCUPIED && (
              <button
                onClick={() => setShowReleaseConfirm(true)}
                aria-label="Liberar mesa"
                title="Liberar mesa"
                className="
                  flex items-center justify-center min-w-[44px] min-h-[44px] rounded-lg
                  transition-colors cursor-pointer hover:bg-orange hover:text-foreground
                "
              ><MdLockOpen /></button>
            )}
            {isAdmin && (
              <button
                onClick={handleOpenFormModal}
                aria-label="Editar mesa"
                className="
                  flex items-center justify-center min-w-[44px] min-h-[44px] rounded-lg
                  transition-colors cursor-pointer hover:bg-green hover:text-foreground
                "
              ><FaRegEdit /></button>
            )}
          </div>
        </div>

        <Tag variant={variant} >{tagLabel}</Tag>
      </div>

      {showReleaseConfirm ? (
        <ConfirmDialog
          title="¿Liberar esta mesa?"
          message="Se finalizará cualquier pedido pagado pendiente y la mesa quedará libre. Esta acción no se puede deshacer."
          confirmLabel="Sí, liberar"
          cancelLabel="Volver"
          variant="orange"
          loading={releaseTableMutation.isPending}
          onCancel={() => setShowReleaseConfirm(false)}
          onConfirm={handleConfirmRelease}
        />
      ) : (
        <Button
          className="flex-1"
          onClick={handleOpenOrderItemsModal}
          variant={variant}
        >
          {buttonLabel}
        </Button>
      )}
    </div>
  )
}
