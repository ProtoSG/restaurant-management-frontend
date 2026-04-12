import { Modal, TitleModal } from "@/shared/components";
import { useModal } from "@/shared/hooks/useModal";
import { usePayOrder, usePayPartialOrder, useSelectedTable, usePaymentConfirmationModal, useOrderItemsModal } from "@/features/tables";
import { usePayOrder as usePayOrderOrders, usePayPartialOrder as usePayPartialOrderOrders, usePrintThermal } from "@/features/orders";
import { PaymentMethodLabels } from "@/shared/enums/PaymentMethod";
import type { PaymentMethod } from "@/shared/enums/PaymentMethod";
import { OrderType, OrderTypeLabels } from "@/shared/enums/OrderType";
import type { Order } from "@/shared/types/Order";
import { generatePrecuentaPDF } from "./PrecuentaTicket";
import { FaPrint } from "react-icons/fa";

interface ModalPaymentConfirmationProps {
  order: Order | undefined;
  paymentMethod: PaymentMethod;
  isPartialPayment: boolean;
  partialAmount?: number;
  paymentModal: ReturnType<typeof usePaymentConfirmationModal>;
  selectedTable: ReturnType<typeof useSelectedTable>;
  orderItemsModal: ReturnType<typeof useOrderItemsModal>;
  orderId?: number;
}

export function ModalPaymentConfirmation({
  order,
  paymentMethod,
  isPartialPayment,
  partialAmount,
  paymentModal,
  selectedTable,
  orderItemsModal,
  orderId
}: ModalPaymentConfirmationProps) {
  const isOrderMode = orderId !== undefined && orderId > 0;
  const dialogRef = useModal(paymentModal.isOpen);

  const payOrderTableMutation = usePayOrder();
  const payPartialTableMutation = usePayPartialOrder();
  const payOrderOrdersMutation = usePayOrderOrders();
  const payPartialOrdersMutation = usePayPartialOrderOrders();
  const printThermalMutation = usePrintThermal();

  const handleConfirmPay = async () => {
    if (!order) return;
    if (!isOrderMode && !selectedTable.selectedTable) return;

    try {
      if (isPartialPayment && partialAmount) {
        if (isOrderMode) {
          await payPartialOrdersMutation.mutateAsync({
            orderId: order.id,
            amount: partialAmount,
            paymentMethod,
          });
        } else {
          await payPartialTableMutation.mutateAsync({
            orderId: order.id,
            amount: partialAmount,
            paymentMethod,
            tableId: selectedTable.selectedTable!.id,
          });
        }
      } else {
        if (isOrderMode) {
          await payOrderOrdersMutation.mutateAsync({ orderId: order.id, paymentMethod });
        } else {
          await payOrderTableMutation.mutateAsync({ orderId: order.id, paymentMethod });
        }
      }
      paymentModal.close();
      orderItemsModal.close();
    } catch (error) {
      console.error('Error al pagar el pedido:', error);
    }
  };

  if (!order) return null;
  if (!isOrderMode && !selectedTable.selectedTable) return null;

  const isProcessing =
    payOrderTableMutation.isLoading || payPartialTableMutation.isLoading ||
    payOrderOrdersMutation.isLoading || payPartialOrdersMutation.isLoading;

  const table = selectedTable.selectedTable;
  const tableNumber = isOrderMode ? parseInt(order.tableNumber ?? '0', 10) : parseInt(table!.number, 10);
  const orderInfo = isOrderMode
    ? (order.type === OrderType.DINE_IN ? `Mesa ${order.tableNumber}` : OrderTypeLabels[order.type])
    : `Mesa ${table!.number}`;

  const hasPreviousPayments = (order.paidAmount ?? 0) > 0;
  const displayAmount = isPartialPayment && partialAmount
    ? partialAmount
    : (order.remainingAmount ?? order.total);

  return (
    <Modal
      dialogRef={dialogRef}
      setOpen={paymentModal.close}
      className="w-full lg:max-w-sm"
    >
      <TitleModal>
        {isPartialPayment ? 'Pago Parcial' : 'Confirmar Pago'}
      </TitleModal>

      {/* Context */}
      <p className="text-sm text-gray-500 -mt-2 text-center">
        <span className="font-semibold text-gray-700">{orderInfo}</span>
        {' · '}
        <span className="font-mono text-xs tracking-wide">{order.orderCode}</span>
      </p>

      {/* Amount hero */}
      <div className="bg-gray-50 rounded-2xl p-5 flex flex-col items-center gap-3">
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest">
          {isPartialPayment ? 'Pagar ahora' : hasPreviousPayments ? 'Restante' : 'Total a pagar'}
        </p>

        <p className="text-5xl font-bold text-gray-900 tabular-nums">
          S/ {displayAmount.toFixed(2)}
        </p>

        <span className="inline-flex items-center gap-1.5 text-sm font-medium bg-orange/15 text-orange px-3 py-1 rounded-full">
          {PaymentMethodLabels[paymentMethod]}
        </span>

        {/* Partial breakdown */}
        {isPartialPayment && partialAmount && (
          <div className="w-full pt-3 border-t border-gray-200 space-y-1.5 text-sm">
            <div className="flex justify-between text-gray-500">
              <span>Total cuenta</span>
              <span>S/ {order.total.toFixed(2)}</span>
            </div>
            {hasPreviousPayments && (
              <div className="flex justify-between text-orange">
                <span>Ya pagado</span>
                <span>− S/ {(order.paidAmount ?? 0).toFixed(2)}</span>
              </div>
            )}
            <div className="flex justify-between text-gray-500">
              <span>Quedará pendiente</span>
              <span>S/ {((order.remainingAmount ?? order.total) - partialAmount).toFixed(2)}</span>
            </div>
          </div>
        )}

        {/* Full payment with previous payments */}
        {!isPartialPayment && hasPreviousPayments && (
          <div className="w-full pt-3 border-t border-gray-200 space-y-1.5 text-sm">
            <div className="flex justify-between text-gray-500">
              <span>Total cuenta</span>
              <span>S/ {order.total.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-orange">
              <span>Ya pagado</span>
              <span>− S/ {(order.paidAmount ?? 0).toFixed(2)}</span>
            </div>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex flex-col gap-2">
        <div className="flex gap-2">
          <button
            onClick={() => order && generatePrecuentaPDF({ order, tableNumber })}
            disabled={isProcessing || !order.items?.length}
            className="flex flex-1 items-center justify-center gap-1.5 py-2.5 border-2 border-gray-200 rounded-xl text-sm font-medium text-gray-600 hover:border-gray-300 hover:bg-gray-50 active:bg-gray-100 transition-colors cursor-pointer disabled:opacity-40"
            aria-label="Imprimir PDF"
          >
            <FaPrint className="text-sm" />
            <span>PDF</span>
          </button>
          <button
            onClick={() => order && printThermalMutation.mutate({ orderId: order.id })}
            disabled={isProcessing || !order.items?.length || printThermalMutation.isLoading}
            className="flex flex-1 items-center justify-center gap-1.5 py-2.5 border-2 border-gray-200 rounded-xl text-sm font-medium text-gray-600 hover:border-gray-300 hover:bg-gray-50 active:bg-gray-100 transition-colors cursor-pointer disabled:opacity-40"
            aria-label="Imprimir ticket térmico"
          >
            <FaPrint className="text-sm" />
            <span>{printThermalMutation.isLoading ? '...' : 'Ticket'}</span>
          </button>
        </div>
        <button
          onClick={handleConfirmPay}
          disabled={isProcessing}
          className="w-full py-3 bg-green text-white font-semibold rounded-xl hover:opacity-90 active:opacity-75 transition-opacity cursor-pointer disabled:opacity-40 min-h-[44px]"
        >
          {isProcessing ? 'Procesando…' : 'Confirmar Pago'}
        </button>
      </div>
    </Modal>
  );
}
