import { useState, useCallback } from "react";
import { HeaderSection, Tag } from "@/shared/components";
import { useActiveOrders } from "./hooks/useOrders";
import { useOrderModal } from "./hooks/useOrderModal";
import { ModalCreateOrder } from "./components/sections/ModalCreateOrder";
import { useOrderItemsModal, useProductListModal, usePaymentConfirmationModal, useSelectedTable, ModalListOrderItems, ModalProductList } from "@/features/tables";
import { useSelectedCategory } from "@/features/menu";
import type { Order } from "@/shared/types/Order";
import { OrderStatus, OrderStatusLabels } from "@/shared/enums/OrderStatus";
import { OrderType, OrderTypeLabels } from "@/shared/enums/OrderType";
import { Variant } from "@/shared/enums/VariantEnum";
import { FaConciergeBell, FaShoppingBag, FaTruck } from "react-icons/fa";

function getTypeIcon(type: OrderType) {
  switch (type) {
    case OrderType.DINE_IN:
      return <FaConciergeBell className="text-lg" />;
    case OrderType.TAKEAWAY:
      return <FaShoppingBag className="text-lg" />;
    case OrderType.DELIVERY:
      return <FaTruck className="text-lg" />;
  }
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
    if (!order.items || order.items.length === 0) {
      productListModal.open();
    } else {
      orderItemsModal.open();
    }
  }, [productListModal, orderItemsModal]);

  return (
    <main className="flex flex-col w-full gap-4">
      <HeaderSection
        title="Gestión de Pedidos"
        subTitle="Administra todos los pedidos activos"
        buttonLabel="Nuevo Pedido"
        buttonFunction={orderModal.openCreate}
      />

      {isLoading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="rounded-xl border border-gray-100 p-4 flex flex-col gap-3 animate-pulse">
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-2">
                  <div className="w-9 h-9 rounded-lg bg-gray-200" />
                  <div className="flex flex-col gap-1.5">
                    <div className="h-4 w-20 bg-gray-200 rounded" />
                    <div className="h-3 w-14 bg-gray-200 rounded" />
                  </div>
                </div>
                <div className="h-5 w-16 bg-gray-200 rounded-full" />
              </div>
              <div className="flex flex-col gap-2">
                <div className="h-3 w-full bg-gray-100 rounded" />
                <div className="h-3 w-4/5 bg-gray-100 rounded" />
                <div className="h-3 w-3/5 bg-gray-100 rounded" />
              </div>
              <div className="pt-3 border-t border-gray-100 flex justify-between items-center">
                <div className="h-3 w-12 bg-gray-200 rounded" />
                <div className="h-5 w-16 bg-gray-200 rounded" />
              </div>
            </div>
          ))}
        </div>
      )}

      {error !== undefined && error !== null && (
        <div className="flex justify-center py-8">
          <p className="text-red">Error al cargar pedidos</p>
        </div>
      )}

      {!isLoading && !error && orders.length === 0 && (
        <div className="flex justify-center py-8">
          <p className="text-gray-500">No hay pedidos activos</p>
        </div>
      )}

      {!isLoading && !error && orders.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {orders.map((order) => (
            <div
              key={order.id}
              onClick={() => {
                setSelectedOrderId(order.id);
                if (!order.items || order.items.length === 0) productListModal.open();
                else orderItemsModal.open();
              }}
              className="bg-white rounded-2xl border shadow-md border-gray-100 hover:shadow-md transition-shadow p-4 flex flex-col cursor-pointer"
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
                  <ul className="space-y-2">
                    {order.items.slice(0, 4).map((item) => (
                      <li key={item.id} className="flex justify-between text-sm">
                        <span className="text-gray-700">
                          {item.quantity}x {item.product.name}
                        </span>
                        <span className="text-gray-500 text-nowrap">S/ {item.subTotal.toFixed(2)}</span>
                      </li>
                    ))}
                    {order.items.length > 4 && (
                      <li className="text-xs text-gray-400 italic">
                        + {order.items.length - 4} más...
                      </li>
                    )}
                  </ul>
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
