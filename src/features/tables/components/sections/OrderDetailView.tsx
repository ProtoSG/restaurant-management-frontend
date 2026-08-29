import { Button, Tag } from "@/shared/components";
import { cn } from "@/shared/utils/utils";
import { useOrderActive, useUpdateOrderItem as useUpdateOrderItemTable, useRemoveOrderItem as useRemoveOrderItemTable, useSelectedTable, useOrderItemsModal } from "@/features/tables";
import { useOrderById, useUpdateOrderItem as useUpdateOrderItemOrder, useRemoveOrderItem as useRemoveOrderItemOrder, useCancelOrder, usePrintKitchen, useMarkOrderAsReady, useFinalizeOrder } from "@/features/orders";
import { useAuth } from "@/features/auth";
import { useSelectedCategory } from "@/features/menu";
import { Variant } from "@/shared/enums/VariantEnum";
import { PaymentMethodLabels } from "@/shared/enums/PaymentMethod";
import { OrderStatus, OrderStatusLabels } from "@/shared/enums/OrderStatus";
import { FaMinus, FaPlus, FaTrash, FaShoppingBag, FaUtensils, FaCheckCircle, FaBan } from "react-icons/fa";
import { toast } from "sonner";
import { MdArrowBack } from "react-icons/md";
import { useState, useEffect, type ReactNode } from "react";
import { ProductCatalogPanel } from "../ProductCatalogPanel";
import { PaymentPanel } from "../PaymentPanel";

// "menu" solo existe como paso navegable en mobile — la pestaña "Carta" es
// lg:hidden más abajo. En desktop, carta+pedido siguen juntos como siempre
// (nunca se llega a "menu" por UI ahí), controlado con clases lg: puras, sin
// detección de viewport en JS.
type Step = "order" | "menu" | "payment";

interface Props {
  orderItemsModal: ReturnType<typeof useOrderItemsModal>;
  selectedTable: ReturnType<typeof useSelectedTable>;
  selectedCategory: ReturnType<typeof useSelectedCategory>;
  orderId?: number;
}

/**
 * Controla el montaje/desmontaje de la vista de detalle con la misma animación
 * de slide que ya usan los modales fullScreenMobile (`useModal.ts`), pero aplicada
 * en todos los breakpoints porque esto ya no es un <dialog>, es una vista de página.
 */
function useSlideOverlay(isOpen: boolean) {
  const [mounted, setMounted] = useState(isOpen);
  const [closing, setClosing] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setMounted(true);
      setClosing(false);
      return;
    }
    if (!mounted) return;

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduceMotion) {
      setMounted(false);
      return;
    }

    setClosing(true);
    const timeout = window.setTimeout(() => {
      setMounted(false);
      setClosing(false);
    }, 160);
    return () => window.clearTimeout(timeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  return { mounted, closing };
}

function TabButton({ active, disabled, title, onClick, children }: { active: boolean; disabled?: boolean; title?: string; onClick: () => void; children: ReactNode }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      title={title}
      className={cn(
        "flex-1 min-h-[44px] px-3 rounded-lg text-sm font-semibold cursor-pointer transition-colors",
        active ? "bg-orange text-white" : "text-gray-600 hover:bg-gray-100 active:bg-gray-200",
        disabled && "opacity-40 cursor-not-allowed hover:bg-transparent"
      )}
    >
      {children}
    </button>
  );
}

export function OrderDetailView({ orderItemsModal, selectedTable, selectedCategory, orderId }: Props) {
  const { mounted, closing } = useSlideOverlay(orderItemsModal.isOpen);
  const { user } = useAuth();
  const canPay = user?.role === 'ADMIN' || user?.role === 'CASHIER';
  const canMarkReady = user?.role === 'ADMIN' || user?.role === 'CASHIER' || user?.role === 'WAITER';
  const canFinalizeOrder = user?.role === 'ADMIN' || user?.role === 'CASHIER' || user?.role === 'WAITER';
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [step, setStep] = useState<Step>('order');
  const cancelOrderMutation = useCancelOrder();
  const printKitchenMutation = usePrintKitchen();
  const markOrderAsReadyMutation = useMarkOrderAsReady();
  const finalizeOrderMutation = useFinalizeOrder();
  const [showTransactions, setShowTransactions] = useState(false);
  // Levantado desde PaymentPanel: mientras haya un pago en curso, no se debe poder
  // navegar fuera del flujo (ver back/tabs más abajo) — el request sigue en vuelo
  // aunque el usuario ya no lo vea.
  const [isPaymentProcessing, setIsPaymentProcessing] = useState(false);

  const isOrderMode = orderId !== undefined && orderId > 0;

  const { order: orderByTable, isLoading: isLoadingByTable, error: errorByTable } = useOrderActive(selectedTable.selectedTable?.id || 0, orderItemsModal.isOpen && !isOrderMode);
  const { order: orderById, isLoading: isLoadingById, error: errorById } = useOrderById(orderId || 0, orderItemsModal.isOpen && isOrderMode);

  const order = isOrderMode ? orderById : orderByTable;
  const isLoading = isOrderMode ? isLoadingById : isLoadingByTable;
  const error = isOrderMode ? errorById : errorByTable;

  const updateOrderItemTable = useUpdateOrderItemTable();
  const removeOrderItemTable = useRemoveOrderItemTable();
  const updateOrderItemOrder = useUpdateOrderItemOrder();
  const removeOrderItemOrder = useRemoveOrderItemOrder();
  const updateOrderItemMutation = isOrderMode ? updateOrderItemOrder : updateOrderItemTable;
  const removeOrderItemMutation = isOrderMode ? removeOrderItemOrder : removeOrderItemTable;

  useEffect(() => {
    if (!orderItemsModal.isOpen) {
      setShowCancelConfirm(false);
      setStep('order');
    }
  }, [orderItemsModal.isOpen]);

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

  const handleFinalize = () => {
    if (!order) return;
    const promise = finalizeOrderMutation.mutateAsync({
      orderId: order.id,
      tableId: selectedTable.selectedTable?.id,
    });
    toast.promise(promise, {
      loading: "Finalizando pedido…",
      success: "Pedido finalizado",
      error: (e) => (e instanceof Error ? e.message : "Error al finalizar el pedido"),
    });
    promise.then(() => orderItemsModal.close()).catch(() => {});
  };

  const handleBack = () => {
    orderItemsModal.close();
  };

  if (!mounted) return null;
  if (!isOrderMode && !selectedTable.selectedTable) return null;

  const table = selectedTable.selectedTable;

  const modalTitle = isOrderMode
    ? `Pedido${order?.type === 'DINE_IN' ? ` · Mesa ${order?.tableNumber}` : ''}`
    : `Mesa ${table?.number}`;

  const hasPreviousPayments = (order?.paidAmount ?? 0) > 0;
  const paidProgress = order?.total ? Math.round(((order.paidAmount ?? 0) / order.total) * 100) : 0;

  // "Enviado a cocina" es un estado a nivel de pedido, no por item: mientras
  // quede AL MENOS un item con cantidad pendiente de imprimir (envío parcial
  // incluido), el botón sigue habilitado como "Enviar a cocina".
  const hasPendingKitchenItems =
    order?.items?.some((item) => item.quantity > (item.kitchenPrintedQuantity ?? 0)) ?? false;

  // Los pasos (Pedido/Pagar) solo tienen sentido mientras el pedido admite cambios.
  const showSteps = !!order && order.status !== OrderStatus.PAID && order.status !== OrderStatus.FINALIZADO;
  // La carta solo se muestra junto al pedido mientras se puede seguir agregando
  // productos — un pedido pagado/finalizado no debe ofrecer agregar más.
  const canEditOrder = !order || (order.status !== OrderStatus.PAID && order.status !== OrderStatus.FINALIZADO);

  // Mientras una mutación crítica está en vuelo (cancelar/finalizar/marcar listo/pagar)
  // no se debe poder salir del flujo: el back/tabs quedan bloqueados hasta que resuelva.
  const isCriticalMutationPending =
    cancelOrderMutation.isPending || finalizeOrderMutation.isPending ||
    markOrderAsReadyMutation.isPending || isPaymentProcessing;
  const navigationBlockedTitle = "Esperando confirmación…";

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={modalTitle}
      className={cn(
        "fixed inset-0 z-[60] flex flex-col bg-background",
        closing ? "modal-slide-exit" : "modal-slide-enter"
      )}
    >
      {/* Header: back + título + acciones de estado del pedido */}
      <header className="flex items-center gap-2 px-3 py-2.5 lg:px-8 lg:py-4 border-b border-gray-200 shrink-0">
        <button
          onClick={handleBack}
          disabled={isCriticalMutationPending}
          aria-label={isCriticalMutationPending ? navigationBlockedTitle : "Cerrar"}
          title={isCriticalMutationPending ? navigationBlockedTitle : undefined}
          className={cn(
            "min-w-[44px] min-h-[44px] flex items-center justify-center rounded-lg text-gray-500 hover:text-red hover:bg-red/5 transition-colors cursor-pointer shrink-0",
            isCriticalMutationPending && "opacity-40 cursor-not-allowed hover:bg-transparent hover:text-gray-500"
          )}
        >
          <MdArrowBack size={22} className={isCriticalMutationPending ? "animate-pulse" : ""} />
        </button>

        <div className="flex-1 min-w-0 flex flex-col items-center lg:items-start">
          <h1 className="font-semibold text-base lg:text-xl leading-tight truncate">{modalTitle}</h1>
          {order && (
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono text-gray-400">{order.orderCode}</span>
              <Tag>{OrderStatusLabels[order.status]}</Tag>
            </div>
          )}
        </div>

        <div className="flex items-center gap-1 shrink-0">
          {order && canMarkReady && order.status === OrderStatus.IN_PROGRESS && (
            <button
              onClick={() =>
                toast.promise(
                  markOrderAsReadyMutation.mutateAsync({
                    orderId: order.id,
                    tableId: selectedTable.selectedTable?.id,
                  }),
                  {
                    loading: "Marcando pedido como listo…",
                    success: "Pedido marcado como listo",
                    error: (e) => (e instanceof Error ? e.message : "Error al marcar el pedido como listo"),
                  }
                )
              }
              disabled={markOrderAsReadyMutation.isPending}
              title="Marcar listo"
              aria-label="Marcar listo"
              className="min-w-[44px] min-h-[44px] flex items-center justify-center rounded-lg text-gray-500 hover:text-green hover:bg-green/5 transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <FaCheckCircle className={`text-base ${markOrderAsReadyMutation.isPending ? 'animate-pulse' : ''}`} />
            </button>
          )}
          {order && canPay && order.status !== OrderStatus.PAID && order.status !== OrderStatus.FINALIZADO && (
            <button
              onClick={() => setShowCancelConfirm(true)}
              title="Cancelar pedido"
              aria-label="Cancelar pedido"
              className="min-w-[44px] min-h-[44px] flex items-center justify-center rounded-lg text-gray-500 hover:text-red hover:bg-red/5 transition-colors cursor-pointer"
            >
              <FaBan className="text-base" />
            </button>
          )}
        </div>
      </header>

      {/* Pasos: en mobile, Pedido/Carta/Pagar por separado — una sola tarea visible
          a la vez, como pide el principio #2 de .impeccable.md. En desktop, carta +
          pedido siguen juntos (la pestaña "Carta" es lg:hidden, nunca se navega ahí),
          solo Pedido ↔ Pagar como antes. */}
      {showSteps && (
        <div className="flex gap-1.5 px-3 pt-3 lg:px-8 shrink-0">
          <TabButton
            active={step === 'order'}
            disabled={isCriticalMutationPending}
            title={isCriticalMutationPending ? navigationBlockedTitle : undefined}
            onClick={() => setStep('order')}
          >
            Pedido
          </TabButton>
          {canEditOrder && (
            <div className="lg:hidden flex-1 flex">
              <TabButton
                active={step === 'menu'}
                disabled={isCriticalMutationPending}
                title={isCriticalMutationPending ? navigationBlockedTitle : undefined}
                onClick={() => setStep('menu')}
              >
                Carta
              </TabButton>
            </div>
          )}
          {canPay && (
            <TabButton
              active={step === 'payment'}
              disabled={isCriticalMutationPending || !order?.items?.length}
              title={isCriticalMutationPending ? navigationBlockedTitle : undefined}
              onClick={() => setStep('payment')}
            >
              Pagar
            </TabButton>
          )}
        </div>
      )}

      {/* Contenido */}
      <div className="flex-1 min-h-0 px-3 py-4 lg:px-8 lg:py-6 overflow-hidden flex flex-col">
        {isLoading ? (
          <div className="flex flex-col gap-3 animate-pulse max-w-2xl mx-auto w-full flex-1 min-h-0 overflow-y-auto px-1">
            <div className="flex items-center justify-between">
              <div className="h-5 w-24 bg-gray-200 rounded-full" />
              <div className="h-5 w-16 bg-gray-200 rounded-full" />
            </div>
            {Array.from({ length: 4 }).map((_, i) => (
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
          </div>
        ) : error ? (
          <div className="text-center py-8">
            <p className="text-red font-medium">Error al cargar el pedido</p>
          </div>
        ) : step === 'payment' && order ? (
          <div className="max-w-2xl mx-auto w-full flex-1 min-h-0">
            <PaymentPanel
              order={order}
              isOpen={step === 'payment'}
              selectedTable={selectedTable}
              orderId={isOrderMode ? orderId : undefined}
              onSuccess={() => setStep('order')}
              onProcessingChange={setIsPaymentProcessing}
            />
          </div>
        ) : (
          // Desktop (lg+): carta + pedido siempre juntos, lado a lado — un vistazo,
          // el total se actualiza sin cambiar de paso. Mobile: uno u otro según
          // `step` ("order"/"menu"), pantalla completa para cada uno — no hay ancho
          // para dos columnas ni sentido en apilarlas y perder la mitad del alto.
          <div className="flex flex-col lg:flex-row gap-4 flex-1 min-h-0">
            {/* Sin pedido todavía, showSteps es false y no hay pestaña "Carta" que
                pulsar — ahí la carta se muestra igual por defecto en mobile, si no
                el mesero queda sin forma de agregar el primer producto. */}
            {canEditOrder && (
              <div className={cn(
                "flex-col min-h-0 min-w-0 h-full flex-1 lg:border-r lg:border-gray-100 lg:pr-4",
                (step === 'menu' || !order) ? "flex" : "hidden lg:flex"
              )}>
                <ProductCatalogPanel
                  selectedCategory={selectedCategory}
                  selectedTable={selectedTable}
                  orderId={isOrderMode ? orderId : undefined}
                />
              </div>
            )}
            <div className={cn(
              "flex-col gap-4 flex-1 min-h-0 min-w-0 overflow-y-auto px-1",
              (step === 'menu' || !order) ? "hidden lg:flex" : "flex",
              canEditOrder && "lg:flex-none lg:w-[380px] xl:w-[420px] lg:shrink-0",
              !canEditOrder && "max-w-2xl mx-auto w-full"
            )}>
            {!order ? (
              <>
                {/* Pedido vacío — se crea de forma diferida al agregar el primer item (ver ListProducts) */}
                <div className="flex flex-col items-center gap-2 py-10 text-center">
                  <p className="text-gray-400 text-sm">Sin productos aún</p>
                  <p className="text-gray-300 text-xs px-4">Elegí un producto de la carta para iniciar el pedido</p>
                </div>
                <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                  <span className="text-sm text-gray-500">Total del pedido</span>
                  <span className="text-2xl font-bold text-gray-900">S/ 0.00</span>
                </div>
              </>
            ) : (
              <>
                {order.status === OrderStatus.PAID ? (
                  <div className="flex flex-col items-center gap-4 py-4">
                    {/* Pedido pagado: sigue mostrando qué se pidió, solo sin controles de edición */}
                    {order.items && order.items.length > 0 && (
                      <ul className="flex flex-col gap-2 w-full">
                        {order.items.map((item) => (
                          <li key={item.id} className={`flex items-center gap-3 px-3 py-2.5 rounded-xl border ${item.isTakeaway ? "bg-orange/5 border-orange/20" : "bg-gray-50 border-gray-100"}`}>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-1.5">
                                <p className="font-semibold text-sm text-gray-900 break-words">{item.product.name}</p>
                                {item.isTakeaway && (
                                  <FaShoppingBag className="text-orange text-[10px] shrink-0" title="Para llevar" />
                                )}
                              </div>
                              <p className="text-xs text-gray-400">
                                S/ {item.unitPrice.toFixed(2)} c/u
                                {item.isTakeaway && item.takeawaySurcharge ? (
                                  <span className="text-orange ml-1">+S/ {item.takeawaySurcharge.toFixed(2)} llevar</span>
                                ) : null}
                              </p>
                            </div>
                            <span className="text-sm font-bold text-gray-700 shrink-0">x{item.quantity}</span>
                          </li>
                        ))}
                      </ul>
                    )}

                    <div className="w-full max-w-sm bg-gray-50 rounded-2xl p-5 flex flex-col items-center gap-3">
                      <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest">Pagado</p>
                      <p className="text-5xl font-bold text-gray-900 tabular-nums">
                        S/ {order.total.toFixed(2)}
                      </p>
                      {order.transactions && order.transactions.length > 0 && (
                        <span className="inline-flex items-center gap-1.5 text-sm font-medium bg-orange/15 text-orange px-3 py-1 rounded-full">
                          {PaymentMethodLabels[order.transactions[order.transactions.length - 1].paymentMethod]}
                        </span>
                      )}
                    </div>
                    {canFinalizeOrder ? (
                      <Button
                        variant={Variant.GREEN}
                        className="w-full max-w-xs"
                        onClick={handleFinalize}
                        disabled={finalizeOrderMutation.isPending}
                      >
                        {finalizeOrderMutation.isPending ? 'Finalizando…' : 'Finalizar pedido'}
                      </Button>
                    ) : (
                      <p className="text-sm text-gray-400">Pedido pagado — falta finalizar</p>
                    )}
                  </div>
                ) : order.status === OrderStatus.FINALIZADO ? (
                  <div className="flex items-center justify-center gap-2 py-10 text-sm text-gray-400">
                    <FaCheckCircle className="text-green text-xs" />
                    Pedido finalizado — mesa liberada
                  </div>
                ) : (
                  <>
                    {/* Lista de items */}
                    {order.items && order.items.length > 0 ? (
                      <ul className="flex flex-col gap-2">
                        {order.items.map((item) => (
                          <li key={item.id} className={`flex items-center gap-3 px-3 py-2.5 rounded-xl border ${item.isTakeaway ? "bg-orange/5 border-orange/20" : "bg-gray-50 border-gray-100"}`}>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-1.5">
                                <p className="font-semibold text-sm text-gray-900 break-words">{item.product.name}</p>
                                {item.isTakeaway && (
                                  <FaShoppingBag className="text-orange text-[10px] shrink-0" title="Para llevar" />
                                )}
                              </div>
                              <p className="text-xs text-gray-400">
                                S/ {item.unitPrice.toFixed(2)} c/u
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
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <div className="flex flex-col items-center gap-2 py-10 text-center">
                        <p className="text-gray-400 text-sm">Sin productos aún</p>
                      </div>
                    )}

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

                    {/* Total del pedido — jerarquía tipográfica en vez de otra tarjeta */}
                    <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                      <span className="text-sm text-gray-500">Total del pedido</span>
                      <span className="text-2xl font-bold text-gray-900">S/ {order.total.toFixed(2)}</span>
                    </div>

                    {/* Acción principal del paso "Pedido": enviar a cocina. Pagar vive en su propio paso. */}
                    {showCancelConfirm ? (
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
                    ) : canMarkReady ? (
                      <Button
                        className={`w-full ${
                          printKitchenMutation.isPending
                            ? 'grayscale opacity-60'
                            : !hasPendingKitchenItems
                              ? '!outline-green !text-green !bg-green/10'
                              : ''
                        }`}
                        variant={hasPendingKitchenItems ? Variant.ORANGE : Variant.GREEN}
                        styleButton="Primary"
                        onClick={() =>
                          toast.promise(printKitchenMutation.mutateAsync({ orderId: order.id, tableId: selectedTable.selectedTable?.id }), {
                            loading: "Enviando comanda a cocina…",
                            success: (r) =>
                              r.printed > 0 ? "Comanda enviada a cocina" : "No hay productos nuevos para cocina",
                            error: (e) => (e instanceof Error ? e.message : "Error al imprimir comanda"),
                          })
                        }
                        disabled={!order.items?.length || printKitchenMutation.isPending || !hasPendingKitchenItems}
                      >
                        <span className="flex items-center justify-center gap-2 whitespace-nowrap">
                          {hasPendingKitchenItems ? (
                            <FaUtensils className={`text-xs ${printKitchenMutation.isPending ? 'animate-pulse' : ''}`} />
                          ) : (
                            <FaCheckCircle className="text-xs" />
                          )}
                          {printKitchenMutation.isPending
                            ? '...'
                            : hasPendingKitchenItems
                              ? 'Enviar a cocina'
                              : 'Enviado a cocina'}
                        </span>
                      </Button>
                    ) : null}
                  </>
                )}
              </>
            )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
