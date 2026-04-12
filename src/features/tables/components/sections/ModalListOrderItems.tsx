import { Modal, TitleModal, Button, Tag } from "@/shared/components";
import { useModal } from "@/shared/hooks/useModal";
import { useOrderActive, useCreateOrder, useUpdateOrderItem as useUpdateOrderItemTable, useRemoveOrderItem as useRemoveOrderItemTable, useSelectedTable, useOrderItemsModal, useProductListModal, usePaymentConfirmationModal } from "@/features/tables";
import { useOrderById, useUpdateOrderItem as useUpdateOrderItemOrder, useRemoveOrderItem as useRemoveOrderItemOrder, useCancelOrder } from "@/features/orders";
import { Variant } from "@/shared/enums/VariantEnum";
import { PaymentMethod, PaymentMethodLabels } from "@/shared/enums/PaymentMethod";
import { OrderStatus, OrderStatusLabels } from "@/shared/enums/OrderStatus";
import { FaMinus, FaPlus, FaTrash } from "react-icons/fa";
import { useState, useEffect } from "react";
import { ModalPaymentConfirmation } from "./ModalPaymentConfirmation";
import { useAuth } from "@/features/auth";

interface Props {
  orderItemsModal: ReturnType<typeof useOrderItemsModal>;
  productListModal: ReturnType<typeof useProductListModal>;
  selectedTable: ReturnType<typeof useSelectedTable>;
  paymentModal: ReturnType<typeof usePaymentConfirmationModal>;
  orderId?: number;
}

export function ModalListOrderItems({ orderItemsModal, productListModal, selectedTable, paymentModal, orderId }: Props) {
  const dialogRef = useModal(orderItemsModal.isOpen);
  const { user } = useAuth();
  const canPay = user?.role === 'ADMIN' || user?.role === 'CASHIER';
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>(PaymentMethod.CASH);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const cancelOrderMutation = useCancelOrder();
  const [isPartialPayment, setIsPartialPayment] = useState(false);
  const [partialAmount, setPartialAmount] = useState<string>("");
  const [showTransactions, setShowTransactions] = useState(false);

  const isOrderMode = orderId !== undefined && orderId > 0;

  const { order: orderByTable, isLoading: isLoadingByTable, error: errorByTable } = useOrderActive(selectedTable.selectedTable?.id || 0, orderItemsModal.isOpen && !isOrderMode);
  const { order: orderById, isLoading: isLoadingById, error: errorById } = useOrderById(orderId || 0, orderItemsModal.isOpen && isOrderMode);

  const order = isOrderMode ? orderById : orderByTable;
  const isLoading = isOrderMode ? isLoadingById : isLoadingByTable;
  const error = isOrderMode ? errorById : errorByTable;

  const createOrderMutation = useCreateOrder();
  const updateOrderItemTable = useUpdateOrderItemTable();
  const removeOrderItemTable = useRemoveOrderItemTable();
  const updateOrderItemOrder = useUpdateOrderItemOrder();
  const removeOrderItemOrder = useRemoveOrderItemOrder();
  const updateOrderItemMutation = isOrderMode ? updateOrderItemOrder : updateOrderItemTable;
  const removeOrderItemMutation = isOrderMode ? removeOrderItemOrder : removeOrderItemTable;

  useEffect(() => {
    if (order && orderItemsModal.isOpen) {
      const paidAmount = order.paidAmount ?? 0;
      const remainingAmount = order.remainingAmount ?? order.total;

      if (paidAmount > 0) {
        setIsPartialPayment(true);
        setPartialAmount(remainingAmount.toFixed(2));
      } else {
        setIsPartialPayment(false);
        setPartialAmount("");
      }
    }
    if (!orderItemsModal.isOpen) {
      setShowCancelConfirm(false);
    }
  }, [order?.id, order?.paidAmount, order?.remainingAmount, orderItemsModal.isOpen]);

  const handleAddItem = async () => {
    if (!isOrderMode && !selectedTable.selectedTable) return;

    if (isOrderMode) {
      productListModal.open();
      return;
    }

    if (!order) {
      try {
        await createOrderMutation.mutateAsync(selectedTable.selectedTable!.id);
        productListModal.open();
      } catch (error) {
        console.error('Error al crear la orden:', error);
      }
    } else {
      productListModal.open();
    }
  };

  const handleUpdateQuantity = async (itemId: number, currentQuantity: number, increment: boolean) => {
    if (!isOrderMode && !selectedTable.selectedTable) return;

    const newQuantity = increment ? currentQuantity + 1 : currentQuantity - 1;
    
    if (newQuantity <= 0) {
      try {
        if (isOrderMode) {
          await removeOrderItemOrder.mutateAsync({ orderId, itemId });
        } else {
          await removeOrderItemTable.mutateAsync({ tableId: selectedTable.selectedTable!.id, itemId });
        }
      } catch (error) {
        console.error('Error al eliminar item:', error);
      }
    } else {
      try {
        if (isOrderMode) {
          await updateOrderItemOrder.mutateAsync({
            orderId,
            itemId,
            quantity: newQuantity
          });
        } else {
          await updateOrderItemTable.mutateAsync({
            tableId: selectedTable.selectedTable!.id,
            itemId,
            quantity: newQuantity
          });
        }
      } catch (error) {
        console.error('Error al actualizar cantidad:', error);
      }
    }
  };

  const handlePay = () => {
    if (!order) return;
    
    if (isPartialPayment || order.status === OrderStatus.PARTIALLY_PAID) {
      const amount = parseFloat(partialAmount);
      const remaining = order.remainingAmount ?? order.total;
      
      if (!amount || amount <= 0) {
        alert("Por favor ingrese un monto válido");
        return;
      }
      
      if (amount > remaining) {
        alert(`El monto (S/ ${amount.toFixed(2)}) excede el monto restante (S/ ${remaining.toFixed(2)})`);
        return;
      }
    }
    
    paymentModal.open();
  };

  if (!isOrderMode && !selectedTable.selectedTable) {
    return null;
  }

  const table = selectedTable.selectedTable;

  const modalTitle = isOrderMode
    ? `Pedido${order?.type === 'DINE_IN' ? ` · Mesa ${order?.tableNumber}` : ''}`
    : `Mesa ${table?.number}`;

  const hasPreviousPayments = (order?.paidAmount ?? 0) > 0;
  const remaining = order?.remainingAmount ?? order?.total ?? 0;
  const paidProgress = order?.total ? Math.round(((order.paidAmount ?? 0) / order.total) * 100) : 0;

  return (
    <>
      <Modal
        dialogRef={dialogRef}
        setOpen={orderItemsModal.close}
        className="w-full lg:w-[520px] max-h-[80dvh] lg:max-h-[90vh] overflow-y-auto"
      >
        <TitleModal>{modalTitle}</TitleModal>

        {isLoading ? (
          <div className="flex flex-col gap-3 animate-pulse">
            <div className="flex items-center justify-between">
              <div className="h-5 w-24 bg-gray-200 rounded-full" />
              <div className="h-5 w-16 bg-gray-200 rounded-full" />
            </div>
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="flex items-center gap-3 px-3 py-3 rounded-xl bg-gray-50">
                <div className="flex-1 flex flex-col gap-1.5">
                  <div className="h-4 bg-gray-200 rounded w-3/4" />
                  <div className="h-3 bg-gray-100 rounded w-1/4" />
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-11 h-11 bg-gray-200 rounded-lg" />
                  <div className="w-7 h-4 bg-gray-200 rounded" />
                  <div className="w-11 h-11 bg-gray-200 rounded-lg" />
                </div>
                <div className="h-4 w-14 bg-gray-200 rounded" />
              </div>
            ))}
            <div className="h-24 bg-gray-100 rounded-xl mt-2" />
          </div>
        ) : error ? (
          <div className="text-center py-8">
            <p className="text-red font-medium">Error al cargar el pedido</p>
          </div>
        ) : !order ? (
          <div className="flex flex-col items-center gap-4 py-10">
            <p className="text-gray-500">No hay pedido activo para esta mesa</p>
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
          <div className="flex flex-col gap-4 min-h-0">

            {/* Header: código + estado + botón agregar (solo ADMIN/CASHIER) */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono text-gray-400 bg-gray-100 px-2 py-0.5 rounded">
                  {order.orderCode}
                </span>
                <Tag>{OrderStatusLabels[order.status]}</Tag>
              </div>
              {canPay && (
                <button
                  onClick={handleAddItem}
                  disabled={createOrderMutation.isLoading}
                  className="flex items-center gap-1.5 text-sm font-medium text-orange border border-orange rounded-lg px-3 py-1.5 hover:bg-orange hover:text-white transition-colors cursor-pointer disabled:opacity-50"
                >
                  <FaPlus className="text-xs" />
                  Agregar
                </button>
              )}
            </div>

            {/* Lista de items */}
            {order.items && order.items.length > 0 ? (
              <ul className="flex flex-col gap-2 overflow-y-auto max-h-40 lg:max-h-52 pr-1">
                {order.items.map((item) => (
                  <li key={item.id} className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-gray-50 border border-gray-100">
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm text-gray-900 truncate">{item.product.name}</p>
                      <p className="text-xs text-gray-400">S/ {item.product.price.toFixed(2)} c/u</p>
                    </div>
                    <div className="flex items-center gap-1 flex-shrink-0">
                      <button
                        onClick={() => handleUpdateQuantity(item.id, item.quantity, false)}
                        disabled={updateOrderItemMutation.isLoading || removeOrderItemMutation.isLoading}
                        aria-label={item.quantity === 1 ? `Eliminar ${item.product.name}` : `Reducir cantidad de ${item.product.name}`}
                        className="min-w-[44px] min-h-[44px] flex items-center justify-center rounded-lg border border-gray-200 hover:bg-red/10 hover:border-red/40 transition-colors cursor-pointer disabled:opacity-40"
                      >
                        {item.quantity === 1 ? <FaTrash className="text-red text-[10px]" /> : <FaMinus className="text-gray-600 text-[10px]" />}
                      </button>
                      <span className="w-7 text-center font-bold text-sm">{item.quantity}</span>
                      <button
                        onClick={() => handleUpdateQuantity(item.id, item.quantity, true)}
                        disabled={updateOrderItemMutation.isLoading}
                        aria-label={`Aumentar cantidad de ${item.product.name}`}
                        className="min-w-[44px] min-h-[44px] flex items-center justify-center rounded-lg border border-gray-200 hover:bg-green/10 hover:border-green/40 transition-colors cursor-pointer disabled:opacity-40"
                      >
                        <FaPlus className="text-gray-600 text-[10px]" />
                      </button>
                    </div>
                    <span className="text-sm font-semibold text-gray-800 w-16 text-right">
                      S/ {item.subTotal.toFixed(2)}
                    </span>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="flex flex-col items-center gap-2 py-6 border-2 border-dashed border-gray-200 rounded-xl">
                <p className="text-gray-400 text-sm">Sin productos aún</p>
              </div>
            )}

            {/* Resumen de pagos parciales (compacto) */}
            {hasPreviousPayments && (
              <div className="rounded-xl border border-orange/30 bg-orange/5 p-3 space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-orange font-semibold">Pagos previos</span>
                  <span className="text-orange font-bold">S/ {(order.paidAmount ?? 0).toFixed(2)} pagado</span>
                </div>
                <div className="w-full h-1.5 bg-orange/20 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-orange rounded-full transition-all"
                    style={{ width: `${paidProgress}%` }}
                  />
                </div>
                {order.transactions && order.transactions.length > 0 && (
                  <div>
                    <button
                      onClick={() => setShowTransactions(!showTransactions)}
                      className="flex items-center gap-1 text-xs text-orange/70 hover:text-orange transition-colors cursor-pointer"
                    >
                      <svg className={`w-3 h-3 transition-transform ${showTransactions ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                      Ver detalle ({order.transactions.length} pago{order.transactions.length > 1 ? 's' : ''})
                    </button>
                    {showTransactions && (
                      <div className="mt-2 space-y-1">
                        {order.transactions.map((t) => (
                          <div key={t.id} className="flex justify-between text-xs text-gray-500">
                            <span>{PaymentMethodLabels[t.paymentMethod]}</span>
                            <span>- S/ {t.total.toFixed(2)}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Sección de pago — solo ADMIN y CASHIER */}
            {canPay && (
              <div className="space-y-3 pt-1">
                {/* Toggle pago parcial (solo si no está auto-activado) */}
                {order.status !== OrderStatus.PARTIALLY_PAID && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700">Pago parcial</span>
                    <button
                      type="button"
                      onClick={() => {
                        setIsPartialPayment(!isPartialPayment);
                        if (!isPartialPayment) setPartialAmount(remaining.toFixed(2));
                        else setPartialAmount("");
                      }}
                      className={`relative inline-flex h-5 w-10 items-center rounded-full transition-colors cursor-pointer ${isPartialPayment ? 'bg-green' : 'bg-gray-300'}`}
                    >
                      <span className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${isPartialPayment ? 'translate-x-5' : 'translate-x-0.5'}`} />
                    </button>
                  </div>
                )}

                {/* Input monto parcial */}
                {(isPartialPayment || order.status === OrderStatus.PARTIALLY_PAID) && (
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Monto a pagar</label>
                    <div className="flex items-center border-2 border-gray-200 rounded-xl overflow-hidden focus-within:border-orange transition-colors">
                      <span className="px-3 py-2.5 text-sm font-semibold text-gray-500 bg-gray-50 border-r border-gray-200">S/</span>
                      <input
                        type="number"
                        value={partialAmount}
                        onChange={(e) => setPartialAmount(e.target.value)}
                        placeholder={remaining.toFixed(2)}
                        min={0.01}
                        max={remaining}
                        step={0.01}
                        className="flex-1 px-3 py-2.5 text-sm font-semibold focus:outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                      />
                      <span className="px-3 text-xs text-gray-400">máx. {remaining.toFixed(2)}</span>
                    </div>
                  </div>
                )}

                {/* Método de pago */}
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Método de pago</label>
                  <div className="grid grid-cols-3 gap-2">
                    {Object.values(PaymentMethod).map((method) => (
                      <button
                        key={method}
                        onClick={() => setPaymentMethod(method)}
                        className={`py-2 rounded-xl border-2 text-sm font-medium transition-all cursor-pointer ${
                          paymentMethod === method
                            ? 'border-green bg-green text-white'
                            : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300 hover:bg-gray-50'
                        }`}
                      >
                        {PaymentMethodLabels[method]}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Resumen final con opciones de pago */}
                <div className="rounded-xl bg-gray-900 text-white p-4 space-y-2">
                  <div className="flex justify-between text-sm text-gray-400">
                    <span>Total cuenta</span>
                    <span>S/ {order.total.toFixed(2)}</span>
                  </div>
                  {hasPreviousPayments && (
                    <div className="flex justify-between text-sm text-orange">
                      <span>Ya pagado</span>
                      <span>- S/ {(order.paidAmount ?? 0).toFixed(2)}</span>
                    </div>
                  )}
                  <div className="flex justify-between items-center border-t border-gray-700 pt-2 mt-1">
                    <span className="font-semibold">
                      {hasPreviousPayments ? 'Restante' : 'Total a pagar'}
                    </span>
                    <span className="text-xl font-bold">
                      S/ {(isPartialPayment || order.status === OrderStatus.PARTIALLY_PAID)
                        ? (parseFloat(partialAmount) || remaining).toFixed(2)
                        : remaining.toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Resumen simple — solo para roles sin permiso de pago */}
            {!canPay && (
              <div className="rounded-xl bg-gray-50 border border-gray-200 p-4 flex justify-between items-center">
                <span className="text-sm text-gray-500">Total del pedido</span>
                <span className="text-xl font-bold text-gray-900">S/ {order.total.toFixed(2)}</span>
              </div>
            )}

            {/* Botones de acción */}
            {canPay ? (
              showCancelConfirm ? (
                <div className="rounded-xl border-2 border-red/30 bg-red/5 p-4 space-y-3">
                  <div className="text-center space-y-1">
                    <p className="font-semibold text-gray-900 text-sm">¿Cancelar este pedido?</p>
                    <p className="text-xs text-gray-500">Esta acción no se puede deshacer.</p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      className="flex-1"
                      variant={Variant.DEFAULT}
                      styleButton="Secondary"
                      onClick={() => setShowCancelConfirm(false)}
                      disabled={cancelOrderMutation.isLoading}
                    >
                      Volver
                    </Button>
                    <Button
                      className="flex-1"
                      variant={Variant.RED}
                      onClick={async () => {
                        try {
                          await cancelOrderMutation.mutateAsync({
                            id: order.id,
                            tableId: selectedTable.selectedTable?.id,
                          });
                          setShowCancelConfirm(false);
                          orderItemsModal.close();
                        } catch {
                          // error manejado en el hook
                        }
                      }}
                      disabled={cancelOrderMutation.isLoading}
                    >
                      {cancelOrderMutation.isLoading ? 'Cancelando...' : 'Sí, cancelar'}
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="flex gap-2 pt-1">
                  <Button
                    className="flex-1"
                    variant={Variant.RED}
                    styleButton="Secondary"
                    onClick={() => setShowCancelConfirm(true)}
                  >
                    Cancelar Orden
                  </Button>
                  <Button
                    variant={Variant.GREEN}
                    className="flex-1"
                    onClick={handlePay}
                    disabled={!order.items || order.items.length === 0}
                  >
                    {(isPartialPayment || order.status === OrderStatus.PARTIALLY_PAID)
                      ? `Pagar S/ ${partialAmount || remaining.toFixed(2)}`
                      : 'Pagar Total'}
                  </Button>
                </div>
              )
            ) : (
              <div className="pt-1">
                <Button
                  variant={Variant.GREEN}
                  className="flex-1"
                  onClick={handleAddItem}
                  disabled={createOrderMutation.isLoading}
                >
                  <FaPlus className="text-xs mr-2" />
                  {createOrderMutation.isLoading ? 'Abriendo...' : 'Agregar Producto'}
                </Button>
              </div>
            )}
          </div>
        )}
      </Modal>
      <ModalPaymentConfirmation
        order={order}
        paymentMethod={paymentMethod}
        isPartialPayment={isPartialPayment || order?.status === OrderStatus.PARTIALLY_PAID}
        partialAmount={(isPartialPayment || order?.status === OrderStatus.PARTIALLY_PAID) ? parseFloat(partialAmount) : undefined}
        paymentModal={paymentModal}
        selectedTable={selectedTable}
        orderItemsModal={orderItemsModal}
        orderId={isOrderMode ? orderId : undefined}
      />
    </>
  );
}
