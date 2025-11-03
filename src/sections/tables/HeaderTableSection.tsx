import { FaPlus } from "react-icons/fa";
import { Button } from "../../components/UI";
import { Variant } from "../../enums/VariantEnum";
import { useTableStore } from "../../stores/TableStore";
import { useTableEditModalStore } from "../../stores/ModalStore";
import type { Table } from "../../models/Table.model";

export function HeaderTableSection() {
  const { setIsEdit, setTable } = useTableStore();
  const { setOpen } = useTableEditModalStore();
    
  const handleOpenModal = () => {
    setTable({} as Table);
    setIsEdit(false);
    setOpen(true);
  }

  return (
    <div className="flex justify-between items-center">
      <h3 className="text-3xl font-bold">Gestión de Mesas</h3>
      <Button 
        variant={Variant.GREEN}
        onClick={handleOpenModal}
        className="flex gap-4 justify-center items-center"
      >
        <FaPlus />
        Crear nueva mesa
      </Button>
    </div>
  )
}
