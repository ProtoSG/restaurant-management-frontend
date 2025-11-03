import { FaRegEdit } from "react-icons/fa"
import type { Table } from "../../models/Table.model"
import { Button, Tag } from "../UI"
import { TableStatus } from "../../enums/Table.enum"
import { Variant } from "../../enums/VariantEnum"
import { useOrderItemsModalStore, useProductListModalStore, useTableEditModalStore } from "../../stores/ModalStore"
import { useTableStore } from "../../stores/TableStore"
import { useEffect, useState } from "react"

interface Props {
  table: Table
}

export function CardTable( { table }: Props) {
  const { setOpen: setOpenForm } = useTableEditModalStore();
  const { setOpen: setOpenOrderItems } = useOrderItemsModalStore();
  const { setOpen: setOpenProductList } = useProductListModalStore();
  const { setTable, setIsEdit } = useTableStore();
  
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
        setButtonLabel('Pagar');
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
    setTable(table);
    setIsEdit(true);
    setOpenForm(true);
  }

  const handleOpenOrderItemsModal = async () => {
    setTable(table);
    if (table.status === TableStatus.FREE) setOpenProductList(true);
    else setOpenOrderItems(true);
  };

  return (
    <div className={`flex flex-col gap-4 border-2 rounded-lg p-3 shadow-[12px_12px_5px_1px] ${shadowColor}`}>
      <div>
        <div className="flex items-center justify-between font-semibold text-xl">
          <p>Mesa {table.number}</p>
          <button
            onClick={handleOpenFormModal}
            className="
              flex items-center justify-center p-2 rounded-lg 
              transition-colors cursor-pointer hover:bg-green hover:text-foreground
            "
          ><FaRegEdit /></button>
        </div>

        <Tag variant={variant} >{tagLabel}</Tag>
      </div>

      <Button 
        onClick={handleOpenOrderItemsModal}
        variant={variant}
      >
        {buttonLabel}
      </Button>
    </div>
  )
}
