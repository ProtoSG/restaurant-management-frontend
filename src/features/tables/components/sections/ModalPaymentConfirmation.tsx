import { useState, useEffect } from "react";
import { Modal, TitleModal } from "@/shared/components";
import { useModal } from "@/shared/hooks/useModal";
import { usePayOrder, usePayPartialOrder, useSelectedTable, usePaymentConfirmationModal, useOrderItemsModal } from "@/features/tables";
import { usePayOrder as usePayOrderOrders, usePayPartialOrder as usePayPartialOrderOrders, usePrintThermal } from "@/features/orders";
import { PaymentMethod, PaymentMethodLabels } from "@/shared/enums/PaymentMethod";
import { OrderStatus } from "@/shared/enums/OrderStatus";
import { OrderType, OrderTypeLabels } from "@/shared/enums/OrderType";
import type { Order } from "@/shared/types/Order";
import { generatePrecuentaPDF } from "./PrecuentaTicket";
import { FaPrint } from "react-icons/fa";

interface ModalPaymentConfirmationProps {
  order: Order | undefined;
  paymentModal: ReturnType<typeof usePaymentConfirmationModal>;
  selectedTable: ReturnType<typeof useSelectedTable>;
  orderItemsModal: ReturnType<typeof useOrderItemsModal>;
  orderId?: number;
}

export function ModalPaymentConfirmation({
  order,
  paymentModal,
  selectedTable,
  orderItemsModal,
  orderId
}: ModalPaymentConfirmationProps) {
  const isOrderMode = orderId !== undefined && orderId > 0;
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>(PaymentMethod.CASH);
  const [isPartialPayment, setIsPartialPayment] = useState(false);
  const [partialAmount, setPartialAmount] = useState<string>("");
  const dialogRef = useModal(paymentModal.isOpen);

  const payOrderTableMutation = usePayOrder();
  const payPartialTableMutation = usePayPartialOrder();
  const payOrderOrdersMutation = usePayOrderOrders();
  const payPartialOrdersMutation = usePayPartialOrderOrders();
  const printThermalMutation = usePrintThermal();
  useEffect(() => {
    if (order && paymentModal.isOpen) {
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
  }, [order?.id, order?.paidAmount, order?.remainingAmount, paymentModal.isOpen]);

  const handleConfirmPay = async () => {
    if (!order) return;
    if (!isOrderMode && !selectedTable.selectedTable) return;

    const remaining = order.remainingAmount ?? order.total;
    const isPartial = isPartialPayment || order.status === OrderStatus.PARTIALLY_PAID;

    if (isPartial) {
      const amount = parseFloat(partialAmount);
      if (!amount || amount <= 0) {
        alert("Por favor ingrese un monto válido");
        return;
      }
      if (amount > remaining) {
        alert(`El monto (S/ ${amount.toFixed(2)}) excede el monto restante (S/ ${remaining.toFixed(2)})`);
        return;
      }
    }

    try {
      const amount = parseFloat(partialAmount);
      if (isPartial && amount) {
        if (isOrderMode) {
          await payPartialOrdersMutation.mutateAsync({ orderId: order.id, amount, paymentMethod });
        } else {
          await payPartialTableMutation.mutateAsync({
            orderId: order.id,
            amount,
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
    payOrderTableMutation.isPending || payPartialTableMutation.isPending ||
    payOrderOrdersMutation.isPending || payPartialOrdersMutation.isPending;

  const table = selectedTable.selectedTable;
  const tableNumber = isOrderMode ? parseInt(order.tableNumber ?? '0', 10) : parseInt(table!.number, 10);
  const orderInfo = isOrderMode
    ? (order.type === OrderType.DINE_IN ? `Mesa ${order.tableNumber}` : OrderTypeLabels[order.type])
    : `Mesa ${table!.number}`;

  const hasPreviousPayments = (order.paidAmount ?? 0) > 0;
  const remaining = order.remainingAmount ?? order.total;
  const isPartial = isPartialPayment || order.status === OrderStatus.PARTIALLY_PAID;
  const parsedPartial = parseFloat(partialAmount);
  const displayAmount = isPartial && parsedPartial > 0
    ? parsedPartial
    : remaining;

  return (
    <Modal
      dialogRef={dialogRef}
      setOpen={paymentModal.close}
      className="w-full lg:max-w-sm"
    >
      <TitleModal>
        {isPartial ? 'Pago Parcial' : 'Confirmar Pago'}
      </TitleModal>

      {/* Context */}
      <p className="text-sm text-gray-500 -mt-2 text-center">
        <span className="font-semibold text-gray-700">{orderInfo}</span>
        {' · '}
        <span className="font-mono text-xs tracking-wide">{order.orderCode}</span>
      </p>

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
                  ? 'border-orange bg-orange text-white'
                  : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300 hover:bg-gray-50'
              }`}
            >
              {PaymentMethodLabels[method]}
            </button>
          ))}
        </div>
      </div>

      {/* Amount hero */}
      <div className="bg-gray-50 rounded-2xl p-5 flex flex-col items-center gap-3">
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest">
          {isPartial ? 'Pagar ahora' : hasPreviousPayments ? 'Restante' : 'Total a pagar'}
        </p>

        <p className="text-5xl font-bold text-gray-900 tabular-nums">
          S/ {displayAmount.toFixed(2)}
        </p>

        <span className="inline-flex items-center gap-1.5 text-sm font-medium bg-orange/15 text-orange px-3 py-1 rounded-full">
          {PaymentMethodLabels[paymentMethod]}
        </span>

        {/* Partial breakdown */}
        {isPartial && parsedPartial > 0 && (
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
              <span>S/ {(remaining - parsedPartial).toFixed(2)}</span>
            </div>
          </div>
        )}

        {/* Full payment with previous payments */}
        {!isPartial && hasPreviousPayments && (
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

      {/* Pago parcial */}
      <div className="space-y-3">
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

        {isPartial && (
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
            onClick={() => order && printThermalMutation.mutate({ order })}
            disabled={isProcessing || !order.items?.length || printThermalMutation.isPending}
            className="flex flex-1 items-center justify-center gap-1.5 py-2.5 border-2 border-gray-200 rounded-xl text-sm font-medium text-gray-600 hover:border-gray-300 hover:bg-gray-50 active:bg-gray-100 transition-colors cursor-pointer disabled:opacity-40"
            aria-label="Imprimir ticket térmico"
          >
            <FaPrint className="text-sm" />
            <span>{printThermalMutation.isPending ? '...' : 'Ticket'}</span>
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
