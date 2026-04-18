import { useActiveOrders, useMarkOrderAsReady } from "@/features/orders";
import { OrderStatus, OrderStatusLabels } from "@/shared/enums/OrderStatus";
import { OrderType, OrderTypeLabels } from "@/shared/enums/OrderType";
import { Tag } from "@/shared/components";
import { Variant } from "@/shared/enums/VariantEnum";
import { FaConciergeBell, FaShoppingBag, FaTruck, FaCheck } from "react-icons/fa";

function getTypeIcon(type: string) {
  switch (type) {
    case OrderType.DINE_IN:   return <FaConciergeBell />;
    case OrderType.TAKEAWAY:  return <FaShoppingBag />;
    case OrderType.DELIVERY:  return <FaTruck />;
    default:                  return <FaConciergeBell />;
  }
}

export function ChefOrders() {
  const { orders, isLoading, error } = useActiveOrders();
  const markAsReadyMutation = useMarkOrderAsReady();

  const pending = orders.filter(o => o.status === OrderStatus.IN_PROGRESS);

  return (
    <main className="flex flex-col w-full gap-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Cocina</h1>
          <p className="text-sm text-gray-500">Pedidos en preparación</p>
        </div>
        {!isLoading && (
          <span className="text-sm font-semibold bg-orange/10 text-orange px-3 py-1.5 rounded-full">
            {pending.length} pendiente{pending.length !== 1 ? 's' : ''}
          </span>
        )}
      </div>

      {isLoading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="rounded-2xl border border-gray-100 p-4 flex flex-col gap-3 animate-pulse">
              <div className="flex justify-between">
                <div className="h-5 w-24 bg-gray-200 rounded" />
                <div className="h-5 w-16 bg-gray-200 rounded-full" />
              </div>
              {Array.from({ length: 3 }).map((_, j) => (
                <div key={j} className="h-4 bg-gray-100 rounded w-4/5" />
              ))}
              <div className="h-10 bg-gray-200 rounded-xl mt-2" />
            </div>
          ))}
        </div>
      )}

      {error && (
        <div className="flex justify-center py-8">
          <p className="text-red">Error al cargar pedidos</p>
        </div>
      )}

      {!isLoading && !error && pending.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 gap-3 text-gray-400">
          <FaCheck className="text-4xl text-green" />
          <p className="text-lg font-medium">Sin pedidos pendientes</p>
        </div>
      )}

      {!isLoading && !error && pending.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {pending.map((order) => (
            <div
              key={order.id}
              className="bg-white rounded-2xl border-2 border-orange/30 shadow-sm p-4 flex flex-col gap-3"
            >
              {/* Header */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-orange">{getTypeIcon(order.type)}</span>
                  <div>
                    <p className="font-bold text-gray-900">{order.orderCode}</p>
                    <p className="text-xs text-gray-500">
                      {OrderTypeLabels[order.type]}
                      {order.tableNumber ? ` · Mesa ${order.tableNumber}` : ''}
                      {order.customerName ? ` · ${order.customerName}` : ''}
                    </p>
                  </div>
                </div>
                <Tag variant={Variant.ORANGE}>{OrderStatusLabels[order.status]}</Tag>
              </div>

              {/* Items */}
              <ul className="flex flex-col gap-1.5 flex-1">
                {order.items?.map((item) => (
                  <li key={item.id} className="flex items-center gap-2 py-1.5 border-b border-gray-100 last:border-0">
                    <span className="min-w-[28px] h-7 flex items-center justify-center rounded-lg bg-orange/10 text-orange font-bold text-sm">
                      {item.quantity}
                    </span>
                    <span className="text-sm font-medium text-gray-800">{item.product.name}</span>
                  </li>
                ))}
              </ul>

              {/* Action */}
              <button
                onClick={() => markAsReadyMutation.mutate({ orderId: order.id })}
                disabled={markAsReadyMutation.isLoading}
                className="w-full py-2.5 bg-green text-white font-semibold rounded-xl hover:opacity-90 active:opacity-75 transition-opacity disabled:opacity-40 cursor-pointer flex items-center justify-center gap-2 min-h-[44px]"
              >
                <FaCheck className="text-sm" />
                {markAsReadyMutation.isLoading ? 'Marcando...' : 'Marcar como Listo'}
              </button>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
