import { useState, useCallback } from "react";
import { FaShoppingBag } from "react-icons/fa";
import {
  useTableModal,
  useOrderItemsModal,
  useProductListModal,
  useChangeTableModal,
  usePaymentConfirmationModal,
  useSelectedTable
} from "@/features/tables";
import { useSelectedCategory } from "@/features/menu";
import { useAuth } from "@/features/auth";
import { useOrderModal, ModalCreateOrder } from "@/features/orders";
import { ListTables, ModalFormTable, ModalListOrderItems, ModalProductList, ModalChangeTable } from "@/features/tables/components/sections";
import { HeaderSection } from "@/shared/components";
import { OrderType } from "@/shared/enums/OrderType";
import type { Order } from "@/shared/types/Order";

export function Tables() {
  const tableModal = useTableModal();
  const orderItemsModal = useOrderItemsModal();
  const productListModal = useProductListModal();
  const changeTableModal = useChangeTableModal();
  const paymentModal = usePaymentConfirmationModal();
  const selectedTable = useSelectedTable();
  const selectedCategory = useSelectedCategory();
  const takeawayModal = useOrderModal();
  const { user } = useAuth();
  const isAdmin = user?.role === 'ADMIN';
  const [selectedOrderId, setSelectedOrderId] = useState<number | null>(null);

  // Una mesa usa modo "mesa" (selectedTable); un pedido para llevar usa modo
  // "orden" (selectedOrderId). Al abrir desde una mesa hay que limpiar el id de
  // orden para no quedar en el modo equivocado.
  const clearOrderSelection = useCallback(() => setSelectedOrderId(null), []);

  const handleTakeawayCreated = useCallback((order: Order) => {
    setSelectedOrderId(order.id);
    if ((!order.items || order.items.length === 0) && window.innerWidth < 1024) {
      productListModal.open();
    } else {
      orderItemsModal.open();
    }
  }, [productListModal, orderItemsModal]);

  return (
    <main className="flex flex-col gap-8 w-full p-6">
      <HeaderSection
        title="Gestión de Mesas"
        subTitle="Administra todas las mesas"
        buttonHide={!isAdmin}
        buttonLabel="Nueva mesa"
        buttonFunction={(src) => tableModal.openCreate(src)}
        secondaryAction={{
          label: "Para llevar",
          icon: <FaShoppingBag size={18} />,
          function: (src) => takeawayModal.openCreate(src),
        }}
      />
      <ListTables
        tableModal={tableModal}
        orderItemsModal={orderItemsModal}
        productListModal={productListModal}
        changeTableModal={changeTableModal}
        selectedTable={selectedTable}
        clearOrderSelection={clearOrderSelection}
      />
      <ModalFormTable modal={tableModal} />
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
      <ModalChangeTable
        changeTableModal={changeTableModal}
        selectedTable={selectedTable}
      />
      <ModalCreateOrder
        modal={takeawayModal}
        lockedType={OrderType.TAKEAWAY}
        onOrderCreated={handleTakeawayCreated}
      />
    </main>
  );
}
