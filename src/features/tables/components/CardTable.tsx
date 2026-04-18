import { FaRegEdit } from "react-icons/fa"
import type { Table } from "@/features/tables/types/Table"
import { Button, Tag } from "@/shared/components"
import { TableStatus } from "@/features/tables"
import { Variant } from "@/shared/enums/VariantEnum"
import { useEffect, useState } from "react"
import { FaRegShareFromSquare } from "react-icons/fa6"
import { useTableModal, useOrderItemsModal, useProductListModal, useChangeTableModal, useSelectedTable } from "@/features/tables"

interface Props {
  table: Table;
  tableModal: ReturnType<typeof useTableModal>;
  orderItemsModal: ReturnType<typeof useOrderItemsModal>;
  productListModal: ReturnType<typeof useProductListModal>;
  changeTableModal: ReturnType<typeof useChangeTableModal>;
  selectedTable: ReturnType<typeof useSelectedTable>;
}

export function CardTable( { table, tableModal, orderItemsModal, productListModal, changeTableModal, selectedTable }: Props) {
  const [ variant, setVariant ] = useState<Variant>(Variant.DEFAULT); 
  const [ shadowColor, setShadowColor ] = useState<string>("shadow-background");
  const [ tagLabel, setTagLabel ] = useState<string>('');
  const [ buttonLabel, setButtonLabel ] = useState<string>('');

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
  
  const handleOpenFormModal = () => {
    tableModal.openEdit(table);
  }

  const handleOpenOrderItemsModal = async () => {
    selectedTable.selectTable(table);
    if (table.status === TableStatus.FREE) productListModal.open();
    else orderItemsModal.open();
  };

  const handleChangeOrderOtherTable = async() => {
    selectedTable.selectTable(table);
    changeTableModal.open();
  }

  return (
    <div className={`flex flex-col gap-4 rounded-lg p-3 shadow-[12px_12px_5px_1px] ${shadowColor}`}>
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
            <button
              onClick={handleOpenFormModal}
              aria-label="Editar mesa"
              className="
                flex items-center justify-center min-w-[44px] min-h-[44px] rounded-lg
                transition-colors cursor-pointer hover:bg-green hover:text-foreground
              "
            ><FaRegEdit /></button>
          </div>
        </div>

        <Tag variant={variant} >{tagLabel}</Tag>
      </div>

      <Button
        className="flex-1"
        onClick={handleOpenOrderItemsModal}
        variant={variant}
      >
        {buttonLabel}
      </Button>
    </div>
  )
}
