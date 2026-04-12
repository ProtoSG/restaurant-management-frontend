import { Modal, TitleModal, Tag } from "@/shared/components";
import { useModal } from "@/shared/hooks/useModal";
import { useOrderById } from "@/features/orders/hooks/useOrders";
import { OrderStatusLabels } from "@/shared/enums/OrderStatus";
import { OrderType, OrderTypeLabels } from "@/shared/enums/OrderType";

interface OrderDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  orderId: number;
  title?: string;
}

export function OrderDetailModal({ isOpen, onClose, orderId, title }: OrderDetailModalProps) {
  const dialogRef = useModal(isOpen);
  const { order, isLoading, error } = useOrderById(orderId, isOpen);

  const defaultTitle = order?.type === OrderType.DINE_IN 
    ? `Pedido - Mesa ${order?.tableId}`
    : `Pedido - ${OrderTypeLabels[order?.type || OrderType.DINE_IN]}`;

  return (
    <Modal
      dialogRef={dialogRef}
      setOpen={onClose}
      className="max-h-[900px] overflow-y-clip"
    >
      <TitleModal>
        {title || defaultTitle}
      </TitleModal>

      {isLoading && (
        <div className="text-center py-4">
          <p>Cargando pedido...</p>
        </div>
      )}

      {error !== undefined && error !== null && (
        <div className="text-center py-4">
          <p className="text-red">Error al cargar el pedido</p>
        </div>
      )}

      {order && (
        <div className="space-y-4 flex flex-col flex-1 min-h-0">
          <div className="pb-2">
            <div className="flex justify-between items-center">
              <div>
                <p className="font-semibold">Código: {order.orderCode}</p>
                {order.type !== OrderType.DINE_IN && order.customerName && (
                  <p className="text-sm text-gray-500">Cliente: {order.customerName}</p>
                )}
              </div>
              <Tag>{OrderStatusLabels[order.status]}</Tag>
            </div>
          </div>

          {order.items && order.items.length > 0 ? (
            <ul className="space-y-3 overflow-y-scroll">
              {order.items.map((item) => (
                <li key={item.id} className="flex justify-between items-center gap-4 p-4 rounded-lg bg-foreground/85">
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-base text-wrap w-64 text-gray-900 mb-1">
                      {item.product?.name || 'Producto desconocido'}
                    </p>
                    <div className="flex items-center gap-4">
                      <span className="text-sm text-gray-500">
                        {item.product?.category?.name || 'Sin categoría'}
                      </span>
                      <span className="text-sm text-gray-500">
                        S/ {item.product?.price?.toFixed(2) || '0.00'} c/u
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <span className="w-8 text-center font-bold text-lg">{item.quantity}</span>
                  </div>
                  <span className="text-sm font-semibold text-gray-800 w-[72px]">
                    S/ {item.subTotal?.toFixed(2) || '0.00'}
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-500 italic">No hay items en el pedido</p>
          )}

          <div className="pt-4 space-y-4 border-t-2">
            {order.paidAmount && order.paidAmount > 0 && (
              <div className="bg-orange/10 border-2 border-orange/40 rounded-lg p-4">
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-orange font-medium">Ya pagado:</span>
                    <span className="font-bold text-orange">S/ {order.paidAmount.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between items-center border-t-2 border-orange/20 pt-2">
                    <span className="text-background font-bold">Restante:</span>
                    <span className="font-bold text-background">
                      S/ {(order.remainingAmount ?? order.total).toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {order.transactions && order.transactions.length > 0 && (
              <div className="border rounded-lg overflow-hidden">
                <div className="p-3 bg-gray-50">
                  <span className="text-xs font-medium text-gray-700">
                    Pagos realizados ({order.transactions.length})
                  </span>
                </div>
                <div className="p-3 bg-white space-y-2 border-t">
                  {order.transactions.map((transaction) => (
                    <div key={transaction.id} className="flex justify-between items-center text-sm">
                      <span className="text-gray-600">
                        {transaction.paymentMethod}
                      </span>
                      <span className="text-gray-600 font-medium">
                        S/ {transaction.total.toFixed(2)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="pt-3 space-y-2 border-t-2">
              <div className="flex items-center justify-between pt-2">
                <p className="text-sm text-gray-600">Total del pedido:</p>
                <span className="text-lg text-gray-900 font-semibold">
                  S/ {order.total.toFixed(2)}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </Modal>
  );
}