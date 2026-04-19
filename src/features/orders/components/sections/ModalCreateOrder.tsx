import { useForm } from "react-hook-form";
import { useEffect, useState } from "react";
import { Modal, TitleModal, Input, Button } from "@/shared/components";
import { Variant } from "@/shared/enums/VariantEnum";
import { useModal } from "@/shared/hooks/useModal";
import { useTables } from "@/features/tables";
import type { Table } from "@/features/tables/types/Table";
import { useCreateOrder, useOrderModal } from "@/features/orders";
import type { CreateOrderRequest } from "../../schemas/Order.schema";
import { OrderType, OrderTypeLabels } from "@/shared/enums/OrderType";
import type { Order } from "@/shared/types/Order";
import { FaConciergeBell, FaShoppingBag, FaTruck } from "react-icons/fa";

interface FormData {
  tableId: string;
  type: string;
  customerName: string;
}

const EMPTY_FORM: FormData = {
  tableId: "",
  type: "",
  customerName: "",
};

interface Props {
  modal: ReturnType<typeof useOrderModal>;
  onOrderCreated?: (order: Order) => void;
}

export function ModalCreateOrder({ modal, onOrderCreated }: Props) {
  const dialogRef = useModal(modal.isOpen);
  const { tables = [] } = useTables();
  const createOrderMutation = useCreateOrder();
  const [selectedType, setSelectedType] = useState<OrderType | undefined>(undefined);
  const [selectedTable, setSelectedTable] = useState<Table | null>(null);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
  } = useForm<FormData>({
    defaultValues: EMPTY_FORM,
  });

  const typeValue = watch("type");

  useEffect(() => {
    if (!modal.isOpen) {
      reset(EMPTY_FORM);
      setSelectedType(undefined);
      setSelectedTable(null);
      setFormErrors({});
    }
  }, [modal.isOpen, reset]);

  useEffect(() => {
    if (typeValue) {
      setSelectedType(typeValue as OrderType);
      setFormErrors(prev => ({ ...prev, type: "" }));
    }
  }, [typeValue]);

  const validateForm = (data: FormData): boolean => {
    const errors: Record<string, string> = {};

    if (!data.type) {
      errors.type = "El tipo de orden es obligatorio";
    } else if (data.type === OrderType.DINE_IN && !data.tableId) {
      errors.tableId = "La mesa es obligatoria para pedidos en mesa";
    } else if ((data.type === OrderType.TAKEAWAY || data.type === OrderType.DELIVERY) && !data.customerName) {
      errors.customerName = "El nombre del cliente es obligatorio";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const onSubmit = async (data: FormData) => {
    if (!validateForm(data)) return;
    if (!data.type) return;
    
    try {
      const payload: CreateOrderRequest = {
        tableId: data.tableId || undefined,
        type: data.type as OrderType,
        customerName: data.customerName || undefined
      };
      const createdOrder = await createOrderMutation.mutateAsync(payload);
      modal.close();
      reset(EMPTY_FORM);
      onOrderCreated?.(createdOrder);
    } catch (error) {
      console.error("Error al crear la orden:", error);
    }
  };

  const handleSelectTable = (table: Table) => {
    setSelectedTable(table);
    setValue("tableId", String(table.id));
    setFormErrors(prev => ({ ...prev, tableId: "" }));
  };

  const availableTables = tables.filter(t => t.status === "FREE");

  return (
    <Modal dialogRef={dialogRef} setOpen={modal.close} className={selectedType === OrderType.DINE_IN ? "max-w-2xl" : ""}>
      <TitleModal>Crear Nuevo Pedido</TitleModal>

      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
        <div>
          <p className="mb-2">Tipo de Pedido</p>
          <input type="hidden" {...register("type")} />
          <div className={`grid grid-cols-3 gap-2 p-1 rounded-xl border-2 ${formErrors.type ? "border-red" : "border-transparent"}`}>
            {Object.values(OrderType).map((type) => (
              <button
                key={type}
                type="button"
                onClick={() => { setValue("type", type); }}
                className={`flex flex-col items-center gap-1.5 py-3 px-2 rounded-xl border-2 text-sm font-medium transition-all cursor-pointer ${
                  typeValue === type
                    ? "border-orange bg-orange text-white shadow-md"
                    : `border-gray-200 bg-white text-gray-600 hover:border-orange/40 hover:bg-orange/5 ${formErrors.type ? "border-red/40" : ""}`
                }`}
              >
                {type === OrderType.DINE_IN && <FaConciergeBell className="text-xl" />}
                {type === OrderType.TAKEAWAY && <FaShoppingBag className="text-xl" />}
                {type === OrderType.DELIVERY && <FaTruck className="text-xl" />}
                <span>{OrderTypeLabels[type]}</span>
              </button>
            ))}
          </div>
          {formErrors.type && (
            <p className="text-red font-semibold text-sm mt-1">
              {formErrors.type}
            </p>
          )}
        </div>

        {selectedType === OrderType.DINE_IN && (
          <div className="space-y-2">
            <p>Mesa</p>
            <input type="hidden" {...register("tableId")} />
            {availableTables.length === 0 ? (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-center">
                <p className="text-yellow-800 text-sm">No hay mesas disponibles</p>
              </div>
            ) : (
              <div className="grid grid-cols-3 gap-3 max-h-60 overflow-y-auto p-1">
                {availableTables.map((table) => (
                  <button
                    key={table.id}
                    type="button"
                    onClick={() => handleSelectTable(table)}
                    className={`
                      p-4 border-2 rounded-lg transition-all cursor-pointer
                      ${selectedTable?.id === table.id
                        ? "border-green bg-green/10 shadow-md"
                        : `hover:border-green/50 hover:bg-gray-50 ${formErrors.tableId ? "border-red" : "border-gray-300"}`
                      }
                    `}
                  >
                    <div className="text-center">
                      <p className="font-semibold text-lg">Mesa {table.number}</p>
                      <p className="text-sm text-green">Libre</p>
                    </div>
                  </button>
                ))}
              </div>
            )}
            {formErrors.tableId && (
              <p className="text-red font-semibold text-sm">
                {formErrors.tableId}
              </p>
            )}
          </div>
        )}

        {(selectedType === OrderType.TAKEAWAY || selectedType === OrderType.DELIVERY) && (
          <Input
            type="text"
            placeholder="Ej: Juan Pérez"
            label="Nombre del Cliente"
            error={formErrors.customerName}
            {...register("customerName")}
          />
        )}

        <Button variant={Variant.GREEN} disabled={createOrderMutation.isPending}>
          {createOrderMutation.isPending ? "Creando..." : "Crear Pedido"}
        </Button>

        {createOrderMutation.error !== undefined && createOrderMutation.error !== null && (
          <p className="text-red text-sm">
            Error al crear la orden
          </p>
        )}
      </form>
    </Modal>
  );
}