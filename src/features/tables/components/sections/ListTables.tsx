import { CardTable } from "../CardTable";
import { useTables, useTableModal, useOrderItemsModal, useProductListModal, useChangeTableModal, useSelectedTable } from "@/features/tables";

interface Props {
  tableModal: ReturnType<typeof useTableModal>;
  orderItemsModal: ReturnType<typeof useOrderItemsModal>;
  productListModal: ReturnType<typeof useProductListModal>;
  changeTableModal: ReturnType<typeof useChangeTableModal>;
  selectedTable: ReturnType<typeof useSelectedTable>;
}

/**
 * Lista de mesas.
 * 
 * Vista que renderiza las tarjetas de mesas.
 * Recibe los hooks como props para pasarlos a los componentes hijos.
 */
function CardTableSkeleton() {
  return (
    <li className="flex flex-col gap-4 border-2 border-gray-100 rounded-lg p-3 animate-pulse">
      <div>
        <div className="flex items-center justify-between mb-2">
          <div className="h-6 w-16 bg-gray-200 rounded" />
          <div className="h-8 w-8 bg-gray-200 rounded-lg" />
        </div>
        <div className="h-5 w-14 bg-gray-200 rounded-full" />
      </div>
      <div className="h-9 w-full bg-gray-200 rounded-md" />
    </li>
  );
}

export function ListTables({ tableModal, orderItemsModal, productListModal, changeTableModal, selectedTable }: Props) {
  const { tables, isLoading, error} = useTables();

  if (error) return <p className="text-red">Error: {(error as Error).message}</p>;

  if (isLoading) {
    return (
      <ul className="pb-4 grid grid-cols-2 gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 lg:gap-5">
        {Array.from({ length: 10 }).map((_, i) => (
          <CardTableSkeleton key={i} />
        ))}
      </ul>
    );
  }

  return (
    <ul className="pb-4 grid grid-cols-2 gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 lg:gap-5">
      {tables.map((t) => (
        <CardTable
          key={t.id}
          table={t}
          tableModal={tableModal}
          orderItemsModal={orderItemsModal}
          productListModal={productListModal}
          changeTableModal={changeTableModal}
          selectedTable={selectedTable}
        />
      ))}
    </ul>
  );
}
