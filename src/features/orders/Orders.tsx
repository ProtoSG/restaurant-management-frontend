import { useState, useCallback } from "react";
import { HeaderSection, Tag, SkeletonCard, ErrorState, EmptyState } from "@/shared/components";
import { useActiveOrders } from "./hooks/useOrders";
import { useOrderModal } from "./hooks/useOrderModal";
import { ModalCreateOrder } from "./components/sections/ModalCreateOrder";
import { useOrderItemsModal, useProductListModal, usePaymentConfirmationModal, useSelectedTable, ModalListOrderItems, ModalProductList } from "@/features/tables";
import { useSelectedCategory } from "@/features/menu";
import type { Order } from "@/shared/types/Order";
import { OrderStatus, OrderStatusLabels } from "@/shared/enums/OrderStatus";
import { OrderTypeLabels } from "@/shared/enums/OrderType";
import { Variant } from "@/shared/enums/VariantEnum";
import { getTypeIcon } from "@/shared/utils/getTypeIcon";

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
    default:
      return Variant.DEFAULT;
  }
}

export function Orders() {
  const { orders, isLoading, error } = useActiveOrders();
  const [selectedOrderId, setSelectedOrderId] = useState<number | null>(null);
  const orderModal = useOrderModal();
  const orderItemsModal = useOrderItemsModal();
  const productListModal = useProductListModal();
  const paymentModal = usePaymentConfirmationModal();
  const selectedTable = useSelectedTable();
  const selectedCategory = useSelectedCategory();

  const handleOrderCreated = useCallback((order: Order) => {
    setSelectedOrderId(order.id);
    if ((!order.items || order.items.length === 0) && window.innerWidth < 1024) {
      productListModal.open();
    } else {
      orderItemsModal.open();
    }
  }, [productListModal, orderItemsModal]);

  return (
    <main className="flex flex-col w-full gap-4 p-6">
      <HeaderSection
        title="Gestión de Pedidos"
        subTitle="Administra todos los pedidos activos"
        buttonLabel="Nuevo Pedido"
        buttonFunction={(src) => orderModal.openCreate(src)}
      />

      {isLoading && <SkeletonCard count={8} />}

      {error !== undefined && error !== null && (
        <ErrorState message="Error al cargar pedidos" />
      )}

      {!isLoading && !error && orders.length === 0 && (
        <EmptyState message="No hay pedidos activos" />
      )}

      {!isLoading && !error && orders.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4">
          {orders.map((order) => (
            <div
              key={order.id}
              onClick={(e) => {
                setSelectedOrderId(order.id);
                const source = e.currentTarget as HTMLElement;
                if ((!order.items || order.items.length === 0) && window.innerWidth < 1024) {
                  productListModal.open(source);
                } else {
                  orderItemsModal.open(source);
                }
              }}
              className="bg-white rounded-2xl p-6 shadow-[12px_12px_5px_1px] shadow-card-background border border-gray-100 flex flex-col cursor-pointer"
            >
              <div className="flex justify-between items-start mb-3 gap-2">
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
                <Tag variant={getStatusVariant(order.status)}>
                  {OrderStatusLabels[order.status]}
                </Tag>
              </div>

              <div className="flex-1">
                {order.items && order.items.length > 0 ? (
                  <div className="space-y-3">
                    {Object.entries(
                      order.items.reduce<Record<string, typeof order.items>>((acc, item) => {
                        const cat = item.product.category?.name ?? "Otros";
                        if (!acc[cat]) acc[cat] = [];
                        acc[cat].push(item);
                        return acc;
                      }, {})
                    ).map(([category, items]) => (
                      <div key={category}>
                        <p className="text-[10px] font-semibold uppercase tracking-widest text-gray-400 mb-1">
                          {category}
                        </p>
                        <ul className="space-y-1">
                          {items.map((item) => (
                            <li key={item.id} className="flex justify-between text-sm">
                              <span className="text-gray-700">
                                {item.quantity}x {item.product.name}
                              </span>
                              <span className="text-gray-500 text-nowrap">S/ {item.subTotal.toFixed(2)}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-400 italic">Sin items</p>
                )}
              </div>

              <div className="mt-3 pt-3 border-t border-gray-200 flex justify-between items-center">
                <span className="text-sm text-gray-500">
                  {order.items?.length || 0} items
                </span>
                <span className="text-xl font-bold text-gray-900">
                  S/ {order.total.toFixed(2)}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      <ModalListOrderItems
        orderItemsModal={orderItemsModal}
        productListModal={productListModal}
        selectedTable={selectedTable}
        paymentModal={paymentModal}
        selectedCategory={selectedCategory}
        orderId={selectedOrderId || undefined}
      />
      <ModalProductList
        productListModal={productListModal}
        selectedCategory={selectedCategory}
        selectedTable={selectedTable}
        orderId={selectedOrderId || undefined}
      />

      <ModalCreateOrder modal={orderModal} onOrderCreated={handleOrderCreated} />
    </main>
  );
}
