import { useState, useEffect } from "react";
import { toast } from "sonner";
import { TitleModal, Toggle } from "@/shared/components";
import { usePayOrder, usePayPartialOrder, useSelectedTable } from "@/features/tables";
import { usePayOrder as usePayOrderOrders, usePayPartialOrder as usePayPartialOrderOrders, usePrintThermal } from "@/features/orders";
import { PaymentMethod, PaymentMethodLabels } from "@/shared/enums/PaymentMethod";
import { OrderStatus } from "@/shared/enums/OrderStatus";
import { OrderType, OrderTypeLabels } from "@/shared/enums/OrderType";
import type { Order } from "@/shared/types/Order";
import { generatePrecuentaPDF } from "./sections/PrecuentaTicket";
import { FaPrint } from "react-icons/fa";

interface PaymentPanelProps {
  order: Order;
  isOpen: boolean;
  selectedTable: ReturnType<typeof useSelectedTable>;
  orderId?: number;
  showTitle?: boolean;
  onSuccess: () => void;
}

export function PaymentPanel({
  order,
  isOpen,
  selectedTable,
  orderId,
  showTitle = true,
  onSuccess,
}: PaymentPanelProps) {
  const isOrderMode = orderId !== undefined && orderId > 0;
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>(PaymentMethod.CASH);
  const [isPartialPayment, setIsPartialPayment] = useState(false);
  const [partialAmount, setPartialAmount] = useState<string>("");

  const payOrderTableMutation = usePayOrder();
  const payPartialTableMutation = usePayPartialOrder();
  const payOrderOrdersMutation = usePayOrderOrders();
  const payPartialOrdersMutation = usePayPartialOrderOrders();
  const printThermalMutation = usePrintThermal();

  useEffect(() => {
    if (isOpen) {
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
  }, [order?.id, order?.paidAmount, order?.remainingAmount, isOpen]);

  const handleConfirmPay = async () => {
    if (!isOrderMode && !selectedTable.selectedTable) return;

    const remaining = order.remainingAmount ?? order.total;
    const isPartial = isPartialPayment || order.status === OrderStatus.PARTIALLY_PAID;

    if (isPartial) {
      const amount = parseFloat(partialAmount);
      if (!amount || amount <= 0) {
        toast.error("Por favor ingrese un monto válido");
        return;
      }
      if (amount > remaining) {
        toast.error(`El monto (S/ ${amount.toFixed(2)}) excede el monto restante (S/ ${remaining.toFixed(2)})`);
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
      onSuccess();
    } catch (error) {
      console.error('Error al pagar el pedido:', error);
    }
  };

  const isProcessing =
    payOrderTableMutation.isPending || payPartialTableMutation.isPending ||
    payOrderOrdersMutation.isPending || payPartialOrdersMutation.isPending;

  const table = selectedTable.selectedTable;
  const tableNumber = isOrderMode
    ? parseInt(order.tableNumber ?? '0', 10)
    : parseInt(table?.number ?? '0', 10);
  const orderInfo = isOrderMode
    ? (order.type === OrderType.DINE_IN ? `Mesa ${order.tableNumber}` : OrderTypeLabels[order.type])
    : `Mesa ${table!.number}`;

  const hasPreviousPayments = (order.paidAmount ?? 0) > 0;
  const remaining = order.remainingAmount ?? order.total;
  const isPartial = isPartialPayment || order.status === OrderStatus.PARTIALLY_PAID;
  const parsedPartial = parseFloat(partialAmount);
  const displayAmount = isPartial && parsedPartial > 0 ? parsedPartial : remaining;

  return (
    <div className="flex flex-col gap-4 flex-1 min-h-0 overflow-y-auto">
      {showTitle && (
        <TitleModal>
          {isPartial ? 'Pago Parcial' : 'Confirmar Pago'}
        </TitleModal>
      )}

      <p className="text-sm text-gray-500 text-center">
        <span className="font-semibold text-gray-700">{orderInfo}</span>
        {' · '}
        <span className="font-mono text-xs tracking-wide">{order.orderCode}</span>
      </p>

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

      <div className="space-y-3">
        {order.status !== OrderStatus.PARTIALLY_PAID && (
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-700">Pago parcial</span>
            <Toggle
              checked={isPartialPayment}
              onChange={(checked) => {
                setIsPartialPayment(checked);
                if (checked) setPartialAmount(remaining.toFixed(2));
                else setPartialAmount("");
              }}
            />
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

      <div className="flex flex-col gap-2 max-lg:mt-auto">
        <div className="flex gap-2">
          <button
            onClick={() => generatePrecuentaPDF({ order, tableNumber })}
            disabled={isProcessing || !order.items?.length}
            className="flex flex-1 items-center justify-center gap-1.5 py-2.5 border-2 border-gray-200 rounded-xl text-sm font-medium text-gray-600 hover:border-gray-300 hover:bg-gray-50 active:bg-gray-100 transition-colors cursor-pointer disabled:opacity-40"
            aria-label="Imprimir PDF"
          >
            <FaPrint className="text-sm" />
            <span>PDF</span>
          </button>
          <button
            onClick={() => printThermalMutation.mutate({ order })}
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
    </div>
  );
}
