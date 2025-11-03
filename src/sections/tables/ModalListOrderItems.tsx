import { Modal, TitelModal, Button, Tag } from "../../components/UI";
import { useOrderItemsModal } from "../../hooks/useModal";
import { useOrderActive, useCreateOrder, useUpdateOrderItem, useRemoveOrderItem, usePayOrder } from "../../hooks/useTables";
import { useOrderItemsModalStore, useProductListModalStore } from "../../stores/ModalStore";
import { useTableStore } from "../../stores/TableStore";
import { Variant } from "../../enums/VariantEnum";
import { PaymentMethod, PaymentMethodLabels } from "../../enums/PaymentMethod";
import { FaMinus, FaPlus } from "react-icons/fa";
import { useState } from "react";

export function ModalListOrderItems() {
  const { isOpen, setOpen } = useOrderItemsModalStore();
  const dialogRef = useOrderItemsModal(isOpen);
  const { table } = useTableStore();
  const { setOpen: setProductListOpen } = useProductListModalStore();
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>(PaymentMethod.CASH);

  const { order, isLoading, error } = useOrderActive(table?.id || 0, isOpen);
  const createOrderMutation = useCreateOrder();
  const updateOrderItemMutation = useUpdateOrderItem();
  const removeOrderItemMutation = useRemoveOrderItem();
  const payOrderMutation = usePayOrder();

  const handleAddItem = async () => {
    if (!table) return;

    // Si no hay orden activa, crear una primero
    if (!order) {
      try {
        await createOrderMutation.mutateAsync(table.id);
        // Después de crear la orden, abrir la lista de productos
        setProductListOpen(true);
      } catch (error) {
        console.error('Error al crear la orden:', error);
      }
    } else {
      // Si ya hay orden activa, abrir directamente la lista de productos
      setProductListOpen(true);
    }
  };

  const handleUpdateQuantity = async (itemId: number, currentQuantity: number, increment: boolean) => {
    if (!table) return;

    const newQuantity = increment ? currentQuantity + 1 : currentQuantity - 1;
    
    if (newQuantity <= 0) {
      // Si la cantidad es 0 o menor, eliminar el item
      try {
        await removeOrderItemMutation.mutateAsync({ tableId: table.id, itemId });
      } catch (error) {
        console.error('Error al eliminar item:', error);
      }
    } else {
      // Actualizar la cantidad
      try {
        await updateOrderItemMutation.mutateAsync({ 
          tableId: table.id, 
          itemId, 
          quantity: newQuantity 
        });
      } catch (error) {
        console.error('Error al actualizar cantidad:', error);
      }
    }
  };

  const handlePay = async () => {
    if (!order) return;

    try {
      await payOrderMutation.mutateAsync({ 
        orderId: order.id, 
        paymentMethod: paymentMethod
      });
      setOpen(false); // Cerrar el modal después de pagar
    } catch (error) {
      console.error('Error al pagar el pedido:', error);
    }
  };

  if (!table) {
    return null;
  }

  return (
    <Modal
      dialogRef={dialogRef}
      setOpen={setOpen}
    >
      <TitelModal>
        {`Pedido Activo - Mesa ${table.number}`}
      </TitelModal>

      {isLoading ? (
        <div className="text-center py-4">
          <p>Cargando pedido...</p>
        </div>
      ) : error ? (
        <div className="text-center py-4">
          <p className="text-red-500">Error: {(error as Error).message}</p>
        </div>
      ) : !order ? (
        <div className="text-center py-4 space-y-4">
          <p className="text-gray-500">No hay un pedido activo para esta mesa</p>
          <Button 
            variant={Variant.GREEN}
            onClick={handleAddItem}
            disabled={createOrderMutation.isLoading}
            className="w-full"
          >
            {createOrderMutation.isLoading ? 'Creando pedido...' : 'Crear Pedido y Agregar Items'}
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="border-b pb-2">
            <div className="flex justify-between items-center">
              <p className="font-semibold">Código: {order.orderCode}</p>
              <Tag >{order.status}</Tag>
            </div>
            <p className="font-semibold">Total: S/. {order.total.toFixed(2)}</p>
          </div>
          
          <div>
            {order.items && order.items.length > 0 ? (
              <ul className="space-y-2">
                {order.items.map((item) => (
                  <li key={item.id} className="flex justify-between items-center gap-8 p-3 rounded">
                     <div className="flex-1">
                       <span className="font-medium"></span>
                       <div className="flex gap-2 items-center  w-52">
                        <p className="font-semibold text-pretty">{item.product.name} 
                        </p>
                        <span className="text-sm text-gray-600 text-nowrap">
                          (S/. {item.product.price.toFixed(2)})
                        </span>
                       </div>
                       <div className="flex gap-2">Subtotal: 
                         <span className="font-semibold">
                            S/. {item.subTotal.toFixed(2)}
                         </span>
                       </div>
                     </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant={Variant.RED}
                        onClick={() => handleUpdateQuantity(item.id, item.quantity, false)}
                        disabled={updateOrderItemMutation.isLoading || removeOrderItemMutation.isLoading}
                        className="px-2 text-sm"
                      >
                        <FaMinus />
                      </Button>
                      <span className="w-8 text-center font-semibold">{item.quantity}</span>
                      <Button
                        variant={Variant.GREEN}
                        onClick={() => handleUpdateQuantity(item.id, item.quantity, true)}
                        disabled={updateOrderItemMutation.isLoading}
                        className="px-2 text-sm"
                      >
                        <FaPlus />
                      </Button>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-500 italic">No hay items en el pedido</p>
            )}
          </div>

          <div className="pt-2 border-t">
            <label className="block text-sm font-medium mb-2">Método de pago:</label>
            <select 
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
              className="w-full p-2 border rounded-md bg-white"
            >
              {Object.values(PaymentMethod).map((method) => (
                <option key={method} value={method}>
                  {PaymentMethodLabels[method]}
                </option>
              ))}
            </select>
          </div>

          <div className="flex gap-2 pt-4">
            <Button 
              variant={Variant.GREEN} 
              className="flex-1"
              onClick={handleAddItem}
              disabled={createOrderMutation.isLoading}
            >
              {createOrderMutation.isLoading ? 'Creando orden...' : 'Agregar'}
            </Button>
            <Button 
              variant={Variant.RED} 
              className="flex-1"
              onClick={handlePay}
              disabled={payOrderMutation.isLoading || !order.items || order.items.length === 0}
            >
              {payOrderMutation.isLoading ? 'Procesando...' : 'Pagar'}
            </Button>
          </div>
        </div>
      )}  
      </Modal>
  );
}
