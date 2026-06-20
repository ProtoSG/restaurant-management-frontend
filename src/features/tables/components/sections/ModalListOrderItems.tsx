import { Modal, TitleModal, Button, Tag } from "@/shared/components";
import { useModal } from "@/shared/hooks/useModal";
import { useOrderActive, useCreateOrder, useUpdateOrderItem as useUpdateOrderItemTable, useRemoveOrderItem as useRemoveOrderItemTable, useAddItemToOrder as useAddItemToOrderTable, useSelectedTable, useOrderItemsModal, useProductListModal, usePaymentConfirmationModal } from "@/features/tables";
import { useOrderById, useUpdateOrderItem as useUpdateOrderItemOrder, useRemoveOrderItem as useRemoveOrderItemOrder, useAddItemToOrder as useAddItemToOrderOrders, useCancelOrder, useMarkOrderAsReady } from "@/features/orders";
import { useAuth } from "@/features/auth";
import { useSelectedCategory } from "@/features/menu";
import { Variant } from "@/shared/enums/VariantEnum";
import { PaymentMethodLabels } from "@/shared/enums/PaymentMethod";
import { OrderStatus, OrderStatusLabels } from "@/shared/enums/OrderStatus";
import { FaMinus, FaPlus, FaTrash, FaShoppingBag } from "react-icons/fa";
import { MdArrowBack } from "react-icons/md";
import { useState, useEffect } from "react";
import { ModalPaymentConfirmation } from "./ModalPaymentConfirmation";
import { QuickAddItems } from "./QuickAddItems";
import { ProductCatalogPanel } from "../ProductCatalogPanel";
import { PaymentPanel } from "../PaymentPanel";

interface Props {
  orderItemsModal: ReturnType<typeof useOrderItemsModal>;
  productListModal: ReturnType<typeof useProductListModal>;
  selectedTable: ReturnType<typeof useSelectedTable>;
  paymentModal: ReturnType<typeof usePaymentConfirmationModal>;
  selectedCategory: ReturnType<typeof useSelectedCategory>;
  orderId?: number;
}

export function ModalListOrderItems({ orderItemsModal, productListModal, selectedTable, paymentModal, selectedCategory, orderId }: Props) {
  const dialogRef = useModal(orderItemsModal.isOpen, orderItemsModal.sourceRef, true);
  const { user } = useAuth();
  const canPay = user?.role === 'ADMIN' || user?.role === 'CASHIER';
  const isAdmin = user?.role === 'ADMIN';
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [desktopPanel, setDesktopPanel] = useState<'catalog' | 'payment'>('catalog');
  const cancelOrderMutation = useCancelOrder();
  const markAsReadyMutation = useMarkOrderAsReady();
  const [showTransactions, setShowTransactions] = useState(false);

  const isOrderMode = orderId !== undefined && orderId > 0;

  const { order: orderByTable, isLoading: isLoadingByTable, error: errorByTable } = useOrderActive(selectedTable.selectedTable?.id || 0, orderItemsModal.isOpen && !isOrderMode);
  const { order: orderById, isLoading: isLoadingById, error: errorById } = useOrderById(orderId || 0, orderItemsModal.isOpen && isOrderMode);

  const order = isOrderMode ? orderById : orderByTable;
  const isLoading = isOrderMode ? isLoadingById : isLoadingByTable;
  const error = isOrderMode ? errorById : errorByTable;

  const createOrderMutation = useCreateOrder();
  const addItemTableMutation = useAddItemToOrderTable();
  const addItemOrdersMutation = useAddItemToOrderOrders();
  const updateOrderItemTable = useUpdateOrderItemTable();
  const removeOrderItemTable = useRemoveOrderItemTable();
  const updateOrderItemOrder = useUpdateOrderItemOrder();
  const removeOrderItemOrder = useRemoveOrderItemOrder();
  const updateOrderItemMutation = isOrderMode ? updateOrderItemOrder : updateOrderItemTable;
  const removeOrderItemMutation = isOrderMode ? removeOrderItemOrder : removeOrderItemTable;

  useEffect(() => {
    if (!orderItemsModal.isOpen) {
      setShowCancelConfirm(false);
      setDesktopPanel('catalog');
    }
  }, [orderItemsModal.isOpen]);

  const handleAddItem = async (source?: HTMLElement) => {
    if (!isOrderMode && !selectedTable.selectedTable) return;

    const isDesktop = window.innerWidth >= 1024;

    if (isOrderMode) {
      if (!isDesktop) productListModal.open(source);
      return;
    }

    if (!order) {
      try {
        await createOrderMutation.mutateAsync(selectedTable.selectedTable!.id);
        if (!isDesktop) productListModal.open();
      } catch (error) {
        console.error('Error al crear la orden:', error);
      }
    } else {
      if (!isDesktop) productListModal.open(source);
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
          await removeOrderItemTable.mutateAsync({ orderId: order!.id, tableId: selectedTable.selectedTable!.id, itemId });
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
            orderId: order!.id,
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

  const handleQuickAdd = async (productId: number) => {
    if (!order) return;
    if (isOrderMode) {
      await addItemOrdersMutation.mutateAsync({ orderId: orderId!, productId, quantity: 1 });
    } else {
      if (!selectedTable.selectedTable) return;
      await addItemTableMutation.mutateAsync({
        orderId: order.id,
        tableId: selectedTable.selectedTable.id,
        productId,
        quantity: 1,
      });
    }
  };

  const handlePay = (source?: HTMLElement) => {
    if (!order) return;
    if (window.innerWidth >= 1024) {
      setDesktopPanel('payment');
      return;
    }
    paymentModal.open(source);
  };

  if (!isOrderMode && !selectedTable.selectedTable) {
    return null;
  }

  const table = selectedTable.selectedTable;

  const modalTitle = isOrderMode
    ? `Pedido${order?.type === 'DINE_IN' ? ` · Mesa ${order?.tableNumber}` : ''}`
    : `Mesa ${table?.number}`;

  const hasPreviousPayments = (order?.paidAmount ?? 0) > 0;
  const paidProgress = order?.total ? Math.round(((order.paidAmount ?? 0) / order.total) * 100) : 0;

  return (
    <>
      <Modal
        dialogRef={dialogRef}
        setOpen={orderItemsModal.close}
        fullScreenMobile
        className="w-full lg:w-[920px] lg:max-w-[95vw] lg:max-h-[90vh] lg:overflow-y-auto"
      >
        <TitleModal>{modalTitle}</TitleModal>

        {isLoading ? (
          <div className="lg:flex lg:gap-0">
            <div className="flex flex-col gap-3 animate-pulse lg:w-[340px] lg:shrink-0 lg:pr-6 lg:border-r lg:border-gray-100">
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
            <div className="hidden lg:flex lg:flex-1 lg:pl-6 lg:items-center lg:justify-center">
              <div className="text-gray-300 text-sm">Cargando carta…</div>
            </div>
          </div>
        ) : error ? (
          <div className="text-center py-8">
            <p className="text-red font-medium">Error al cargar el pedido</p>
          </div>
        ) : (
          <div className="lg:flex lg:gap-0 min-h-0 max-lg:flex-1">

            {/* LEFT COLUMN: order items */}
            <div className="flex flex-col gap-4 min-h-0 max-lg:flex-1 lg:w-[340px] lg:shrink-0 lg:pr-6 lg:border-r lg:border-gray-100">

              {!order ? (
                <div className="flex flex-col items-center gap-4 py-10">
                  <p className="text-gray-500">No hay pedido activo para esta mesa</p>
                  <Button
                    variant={Variant.GREEN}
                    onClick={(e) => handleAddItem(e.currentTarget as HTMLElement)}
                    disabled={createOrderMutation.isPending}
                    className="w-full"
                  >
                    {createOrderMutation.isPending ? 'Creando pedido...' : 'Crear Pedido y Agregar Items'}
                  </Button>
                </div>
              ) : (
                <>
                  {/* Header: código + estado + botón agregar (mobile only) */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono text-gray-400 bg-gray-100 px-2 py-0.5 rounded">
                        {order.orderCode}
                      </span>
                      <Tag>{OrderStatusLabels[order.status]}</Tag>
                    </div>
                    {canPay && (
                      <div className="lg:hidden flex items-center gap-2">
                        <button
                          onClick={(e) => handleAddItem(e.currentTarget as HTMLElement)}
                          disabled={createOrderMutation.isPending}
                          className="flex items-center gap-1.5 text-sm font-medium text-orange border border-orange rounded-lg px-3 py-1.5 hover:bg-orange hover:text-white transition-colors cursor-pointer disabled:opacity-50"
                        >
                          <FaPlus className="text-xs" />
                          Agregar
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Lista de items */}
                  {order.items && order.items.length > 0 ? (
                    <ul className="flex flex-col gap-2 overflow-y-auto flex-1 min-h-0 pr-1">
                      {order.items.map((item) => (
                        <li key={item.id} className={`flex items-center gap-3 px-3 py-2.5 rounded-xl border ${item.isTakeaway ? "bg-orange/5 border-orange/20" : "bg-gray-50 border-gray-100"}`}>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-1.5">
                              <p className="font-semibold text-sm text-gray-900 truncate">{item.product.name}</p>
                              {item.isTakeaway && (
                                <FaShoppingBag className="text-orange text-[10px] shrink-0" title="Para llevar" />
                              )}
                            </div>
                            <p className="text-xs text-gray-400">
                              S/ {item.product.price.toFixed(2)} c/u
                              {item.isTakeaway && item.takeawaySurcharge ? (
                                <span className="text-orange ml-1">+S/ {item.takeawaySurcharge.toFixed(2)} llevar</span>
                              ) : null}
                            </p>
                          </div>
                          <div className="flex items-center gap-1 flex-shrink-0">
                            <button
                              onClick={() => handleUpdateQuantity(item.id, item.quantity, false)}
                              disabled={updateOrderItemMutation.isPending || removeOrderItemMutation.isPending}
                              aria-label={item.quantity === 1 ? `Eliminar ${item.product.name}` : `Reducir cantidad de ${item.product.name}`}
                              className="min-w-[44px] min-h-[44px] flex items-center justify-center rounded-lg border border-gray-200 hover:bg-red/10 hover:border-red/40 transition-colors cursor-pointer disabled:opacity-40"
                            >
                              {item.quantity === 1 ? <FaTrash className="text-red text-[10px]" /> : <FaMinus className="text-gray-600 text-[10px]" />}
                            </button>
                            <span className="w-7 text-center font-bold text-sm">{item.quantity}</span>
                            <button
                              onClick={() => handleUpdateQuantity(item.id, item.quantity, true)}
                              disabled={updateOrderItemMutation.isPending}
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

                  {/* Acceso rápido */}
                  <QuickAddItems
                    onAdd={handleQuickAdd}
                    disabled={addItemTableMutation.isPending || addItemOrdersMutation.isPending}
                  />

                  {/* Resumen de pagos parciales */}
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

                  {/* Total del pedido */}
                  <div className="rounded-xl bg-gray-50 border border-gray-200 p-4 flex justify-between items-center">
                    <span className="text-sm text-gray-500">Total del pedido</span>
                    <span className="text-xl font-bold text-gray-900">S/ {order.total.toFixed(2)}</span>
                  </div>

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
                            disabled={cancelOrderMutation.isPending}
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
                            disabled={cancelOrderMutation.isPending}
                          >
                            {cancelOrderMutation.isPending ? 'Cancelando...' : 'Sí, cancelar'}
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex flex-col gap-2 pt-1">
                        {isAdmin && order.status === OrderStatus.IN_PROGRESS && (
                          <Button
                            variant={Variant.ORANGE}
                            className="w-full"
                            onClick={() => markAsReadyMutation.mutate({ orderId: order.id, tableId: selectedTable.selectedTable?.id })}
                            disabled={markAsReadyMutation.isPending || !order.items?.length}
                          >
                            {markAsReadyMutation.isPending ? 'Marcando...' : 'Marcar como Listo'}
                          </Button>
                        )}
                        <div className="flex gap-2">
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
                            onClick={(e) => handlePay(e.currentTarget as HTMLElement)}
                            disabled={!order.items?.length || order.status === OrderStatus.IN_PROGRESS}
                          >
                            Pagar
                          </Button>
                        </div>
                      </div>
                    )
                  ) : (
                    <div className="pt-1">
                      <Button
                        variant={Variant.GREEN}
                        className="flex-1 lg:hidden"
                        onClick={(e) => handleAddItem(e.currentTarget as HTMLElement)}
                        disabled={createOrderMutation.isPending}
                      >
                        <FaPlus className="text-xs mr-2" />
                        {createOrderMutation.isPending ? 'Abriendo...' : 'Agregar Producto'}
                      </Button>
                    </div>
                  )}
                </>
              )}
            </div>

            {/* RIGHT COLUMN: catalog or payment (desktop only) */}
            <div className="hidden lg:flex lg:flex-col lg:flex-1 lg:pl-6 lg:h-[58vh] lg:overflow-hidden">
              {desktopPanel === 'catalog' ? (
                <>
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3 shrink-0">Carta</p>
                  <ProductCatalogPanel
                    selectedCategory={selectedCategory}
                    selectedTable={selectedTable}
                    orderId={isOrderMode ? orderId : undefined}
                  />
                </>
              ) : (
                <>
                  <button
                    onClick={() => setDesktopPanel('catalog')}
                    className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 transition-colors cursor-pointer mb-3 shrink-0"
                  >
                    <MdArrowBack size={16} />
                    Volver al pedido
                  </button>
                  {order && (
                    <PaymentPanel
                      order={order}
                      isOpen={desktopPanel === 'payment'}
                      selectedTable={selectedTable}
                      orderId={isOrderMode ? orderId : undefined}
                      showTitle={false}
                      onSuccess={() => {
                        setDesktopPanel('catalog');
                        orderItemsModal.close();
                      }}
                    />
                  )}
                </>
              )}
            </div>
          </div>
        )}
      </Modal>
      <ModalPaymentConfirmation
        order={order}
        paymentModal={paymentModal}
        selectedTable={selectedTable}
        orderItemsModal={orderItemsModal}
        orderId={isOrderMode ? orderId : undefined}
      />
    </>
  );
}
