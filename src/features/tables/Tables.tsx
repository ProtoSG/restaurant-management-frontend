import { 
  useTableModal, 
  useOrderItemsModal, 
  useProductListModal, 
  useChangeTableModal, 
  usePaymentConfirmationModal, 
  useSelectedTable 
} from "@/features/tables";
import { useSelectedCategory } from "@/features/menu";
import { ListTables, ModalFormTable, ModalListOrderItems, ModalProductList, ModalChangeTable } from "@/features/tables/components/sections";
import { HeaderSection } from "@/shared/components";

export function Tables() {
  const tableModal = useTableModal();
  const orderItemsModal = useOrderItemsModal();
  const productListModal = useProductListModal();
  const changeTableModal = useChangeTableModal();
  const paymentModal = usePaymentConfirmationModal();
  const selectedTable = useSelectedTable();
  const selectedCategory = useSelectedCategory();

  return (
    <main className="flex flex-col gap-8 w-full p-6">
      <HeaderSection
        title="Gestión de Mesas"
        subTitle="Administra todas las mesas"
        buttonLabel="Nueva mesa"
        buttonFunction={(src) => tableModal.openCreate(src)}
      />
      <ListTables
        tableModal={tableModal}
        orderItemsModal={orderItemsModal}
        productListModal={productListModal}
        changeTableModal={changeTableModal}
        selectedTable={selectedTable}
      />
      <ModalFormTable modal={tableModal} />
      <ModalListOrderItems
        orderItemsModal={orderItemsModal}
        productListModal={productListModal}
        selectedTable={selectedTable}
        paymentModal={paymentModal}
        selectedCategory={selectedCategory}
      />
      <ModalProductList 
        productListModal={productListModal}
        selectedCategory={selectedCategory}
        selectedTable={selectedTable}
      />
      <ModalChangeTable 
        changeTableModal={changeTableModal}
        selectedTable={selectedTable}
      />
    </main>
  );
}
