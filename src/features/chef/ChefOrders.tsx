import { useActiveOrders, useMarkOrderAsReady } from "@/features/orders";
import { OrderStatus, OrderStatusLabels } from "@/shared/enums/OrderStatus";
import { OrderTypeLabels } from "@/shared/enums/OrderType";
import { Tag, SkeletonCard, ErrorState, EmptyState } from "@/shared/components";
import { Variant } from "@/shared/enums/VariantEnum";
import { FaCheck } from "react-icons/fa";
import { getTypeIcon } from "@/shared/utils/getTypeIcon";

export function ChefOrders() {
  const { orders, isLoading, error } = useActiveOrders();
  const markAsReadyMutation = useMarkOrderAsReady();

  const pending = orders.filter(o => o.status === OrderStatus.IN_PROGRESS);

  return (
    <main className="flex flex-col w-full gap-4 p-6">
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

      {isLoading && <SkeletonCard count={6} />}

      {!!error && (
        <ErrorState message="Error al cargar pedidos" />
      )}

      {!isLoading && !error && pending.length === 0 && (
        <EmptyState
          message="Sin pedidos pendientes"
          icon={<FaCheck className="text-4xl text-green" />}
        />
      )}

      {!isLoading && !error && pending.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4">
          {pending.map((order) => (
            <div
              key={order.id}
              className="bg-white rounded-2xl border-2 border-orange/30 shadow-sm p-4 flex flex-col gap-3"
            >
              {/* Header */}
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-orange/10 flex items-center justify-center text-orange text-lg shrink-0">
                    {getTypeIcon(order.type)}
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 font-mono">{order.orderCode}</p>
                    <p className="text-lg font-extrabold text-gray-900 leading-tight">
                      {order.tableNumber
                        ? `Mesa ${order.tableNumber}`
                        : order.customerName
                          ? order.customerName
                          : OrderTypeLabels[order.type]}
                    </p>
                    {!order.tableNumber && order.customerName && (
                      <p className="text-xs text-gray-400">{OrderTypeLabels[order.type]}</p>
                    )}
                  </div>
                </div>
                <Tag variant={Variant.ORANGE}>{OrderStatusLabels[order.status]}</Tag>
              </div>

              {/* Items agrupados por categoría */}
              <div className="flex flex-col gap-2 flex-1">
                {Object.entries(
                  (order.items ?? [])
                    .filter(item => item.product.category?.name?.toLowerCase() !== "bebidas")
                    .reduce<Record<string, typeof order.items>>((acc, item) => {
                    const cat = item.product.category?.name ?? "Sin categoría";
                    if (!acc[cat]) acc[cat] = [];
                    acc[cat]!.push(item);
                    return acc;
                  }, {})
                ).map(([category, items]) => (
                  <div key={category}>
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">{category}</p>
                    <ul className="flex flex-col">
                      {items.map((item) => (
                        <li key={item.id} className="flex items-center gap-2 py-1.5 border-b border-gray-100 last:border-0">
                          <span className="min-w-[32px] h-8 flex items-center justify-center rounded-lg bg-orange/10 text-orange font-bold text-xl">
                            {item.quantity}
                          </span>
                          <div className="flex flex-col flex-1">
                            <span className="text-sm font-medium text-gray-800">{item.product.name}</span>
                            {item.notes && <span className="text-base font-semibold text-red italic">{item.notes}</span>}
                          </div>
                          <span className="text-sm font-semibold text-gray-500 tabular-nums shrink-0">
                            S/{Number(item.product.price).toFixed(2)}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>

              {/* Action */}
              <button
                onClick={() => markAsReadyMutation.mutate({ orderId: order.id })}
                disabled={markAsReadyMutation.isPending}
                className="w-full py-2.5 bg-green text-white font-semibold rounded-xl hover:opacity-90 active:opacity-75 transition-opacity disabled:opacity-40 cursor-pointer flex items-center justify-center gap-2 min-h-[44px]"
              >
                <FaCheck className="text-sm" />
                {markAsReadyMutation.isPending ? 'Marcando...' : 'Marcar como Listo'}
              </button>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
