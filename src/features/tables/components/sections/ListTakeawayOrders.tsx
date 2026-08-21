import { useActiveOrders } from "@/features/orders";
import { useOrderItemsModal, useProductListModal } from "@/features/tables";
import { Tag } from "@/shared/components";
import { OrderStatus, OrderStatusLabels } from "@/shared/enums/OrderStatus";
import { Variant } from "@/shared/enums/VariantEnum";
import { FaShoppingBag } from "react-icons/fa";

interface Props {
  orderItemsModal: ReturnType<typeof useOrderItemsModal>;
  productListModal: ReturnType<typeof useProductListModal>;
  onSelectOrder: (orderId: number) => void;
}

function getStatusVariant(status: OrderStatus): Variant {
  switch (status) {
    case OrderStatus.CREATED:
      return Variant.DEFAULT;
    case OrderStatus.IN_PROGRESS:
      return Variant.ORANGE;
    case OrderStatus.READY:
      return Variant.GREEN;
    case OrderStatus.PARTIALLY_PAID:
      return Variant.ORANGE;
    case OrderStatus.FINALIZADO:
      return Variant.GREEN;
    default:
      return Variant.DEFAULT;
  }
}

export function ListTakeawayOrders({ orderItemsModal, productListModal, onSelectOrder }: Props) {
  const { orders, isLoading } = useActiveOrders();

  const takeawayOrders = orders.filter((o) => o.type === 'TAKEAWAY');

  if (isLoading || takeawayOrders.length === 0) return null;

  const handleOpenOrder = (order: typeof takeawayOrders[number]) => {
    onSelectOrder(order.id);
    if ((!order.items || order.items.length === 0) && window.innerWidth < 1024) {
      productListModal.open();
    } else {
      orderItemsModal.open();
    }
  };

  return (
    <section className="flex flex-col gap-3">
      <div className="flex items-center gap-2">
        <FaShoppingBag className="text-orange text-sm" />
        <h2 className="text-lg font-bold text-gray-900">Para Llevar</h2>
        <span className="text-xs font-semibold text-orange bg-orange/15 px-2 py-0.5 rounded-full tabular-nums">
          {takeawayOrders.length}
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {takeawayOrders.map((order) => (
          <button
            key={order.id}
            onClick={() => handleOpenOrder(order)}
            className="bg-white rounded-xl p-4 shadow-[4px_4px_12px_0px] shadow-card-background/40 border border-gray-100 flex flex-col gap-2.5 cursor-pointer text-left hover:bg-gray-50 active:bg-gray-100 transition-colors"
          >
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 min-w-0">
                <span className="text-xs font-mono text-gray-400 shrink-0">{order.orderCode}</span>
                {order.customerName && (
                  <span className="text-sm font-semibold text-gray-900 truncate">{order.customerName}</span>
                )}
              </div>
              <Tag variant={getStatusVariant(order.status)}>
                {OrderStatusLabels[order.status]}
              </Tag>
            </div>

            {order.items && order.items.length > 0 ? (
              <p className="text-xs text-gray-500 line-clamp-2">
                {order.items.map((item) => `${item.quantity}x ${item.product.name}`).join(", ")}
              </p>
            ) : (
              <p className="text-xs text-gray-400 italic">Sin items</p>
            )}

            <div className="flex items-center justify-between pt-1.5 border-t border-gray-100">
              <span className="text-xs text-gray-400">{order.items?.length || 0} items</span>
              <span className="text-sm font-bold text-gray-900 tabular-nums">S/ {order.total.toFixed(2)}</span>
            </div>
          </button>
        ))}
      </div>
    </section>
  );
}
