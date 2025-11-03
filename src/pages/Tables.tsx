import { HeaderTableSection, ListOrdersDelivery, ListTables, ModalFormTable, ModalListOrderItems, ModalProductList } from "../sections/tables";

export function Tables() {

  return (
    <main className="p-8 flex flex-col gap-8 w-full">
      <HeaderTableSection />
      <ListTables />
      <ModalFormTable />
      <ModalListOrderItems />
      <ModalProductList />
    </main>
  );
}
