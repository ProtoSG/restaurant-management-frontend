import { useProductsByCategoryId, useProducts, useSelectedCategory, type Product } from "@/features/menu"
import { useSelectedTable, useAddItemToOrder as useAddItemToOrderTable } from "@/features/tables"
import { useAddItemToOrder as useAddItemToOrderOrders } from "@/features/orders"
import { FaSearch, FaPlus } from "react-icons/fa";
import { useRef, useState } from "react";

interface Props {
  searchTerm: string;
  setSearchTerm: React.Dispatch<React.SetStateAction<string>>;
  selectedTable: ReturnType<typeof useSelectedTable>;
  selectedCategory: ReturnType<typeof useSelectedCategory>;
  orderId?: number;
}

interface PendingItem {
  product: Product;
  notes: string;
}

export function ListProducts({ searchTerm, setSearchTerm, selectedTable, selectedCategory, orderId }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [pendingItem, setPendingItem] = useState<PendingItem | null>(null);

  const isSearching = searchTerm.trim().length > 0;
  const { products: categoryProducts, isLoading: isLoadingCategory, error: errorCategory } = useProductsByCategoryId(selectedCategory.selectedCategory?.id || 0);
  const { products: allProducts, isLoading: isLoadingAll, error: errorAll } = useProducts();
  const addItemTableMutation = useAddItemToOrderTable();
  const addItemOrdersMutation = useAddItemToOrderOrders();

  const products = isSearching ? allProducts : categoryProducts;
  const isLoading = isSearching ? isLoadingAll : isLoadingCategory;
  const error = isSearching ? errorAll : errorCategory;

  const handleAddItem = async (product: Product) => {
    setPendingItem({ product, notes: "" });
  };

  const handleConfirm = async () => {
    if (!pendingItem) return;
    try {
      const notes = pendingItem.notes.trim() || undefined;
      if (orderId) {
        await addItemOrdersMutation.mutateAsync({ orderId, productId: pendingItem.product.id, quantity: 1, notes });
      } else {
        if (!selectedTable.selectedTable) return;
        await addItemTableMutation.mutateAsync({
          tableId: selectedTable.selectedTable.id,
          productId: pendingItem.product.id,
          quantity: 1,
          notes,
        });
      }
    } catch (error) {
      console.error('Error al agregar item:', error);
    } finally {
      setPendingItem(null);
    }
  };

  const isAdding = addItemTableMutation.isPending || addItemOrdersMutation.isPending;

  const filteredProducts = products.filter((product: Product) =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (isLoading) return (
    <div className="flex flex-col gap-3 flex-1 animate-pulse">
      <div className="h-10 bg-gray-100 rounded-xl" />
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="flex items-center gap-3 py-3 border-b border-gray-100">
          <div className="flex-1 h-4 bg-gray-100 rounded" />
          <div className="w-14 h-4 bg-gray-100 rounded" />
          <div className="w-11 h-11 bg-gray-100 rounded-xl shrink-0" />
        </div>
      ))}
    </div>
  );

  if (error) return <p className="text-red text-sm">Error al cargar los productos</p>;

  return (
    <>
      <div className="flex flex-col gap-3 flex-1 min-h-0 overflow-hidden">
        {/* Buscador */}
        <div className="flex items-center gap-2 border-2 border-gray-200 rounded-xl px-3 py-2.5 focus-within:border-orange transition-colors shrink-0">
          <FaSearch className="text-gray-400 shrink-0 text-xs" />
          <input
            ref={inputRef}
            type="text"
            placeholder="Buscar producto…"
            className="w-full focus:outline-none text-sm bg-transparent"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            aria-label="Buscar producto en la carta"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm("")}
              className="text-gray-400 hover:text-gray-600 text-xs shrink-0 cursor-pointer"
              aria-label="Limpiar búsqueda"
            >
              ✕
            </button>
          )}
        </div>

        {/* Lista */}
        {filteredProducts.length === 0 ? (
          <div className="flex flex-col items-center justify-center flex-1 gap-2 py-8">
            <p className="text-gray-400 text-sm">
              {searchTerm ? `Sin resultados para "${searchTerm}"` : "No hay productos en esta categoría"}
            </p>
          </div>
        ) : (
          <ul className="flex flex-col overflow-y-auto flex-1 -mx-1">
            {filteredProducts.map((p: Product) => (
              <li
                key={p.id}
                className="flex items-center gap-3 px-1 py-3.5 border-b border-gray-100 last:border-0 active:bg-gray-50 transition-colors"
              >
                <p className="flex-1 text-sm font-medium text-gray-900 leading-snug">{p.name}</p>
                <span className="text-sm font-semibold text-gray-600 tabular-nums shrink-0 min-w-[56px] text-right">
                  S/ {p.price.toFixed(2)}
                </span>
                <button
                  onClick={() => handleAddItem(p)}
                  disabled={isAdding}
                  aria-label={`Agregar ${p.name}`}
                  className="min-w-[44px] min-h-[44px] flex items-center justify-center rounded-xl bg-green text-white active:opacity-75 transition-opacity disabled:opacity-40 cursor-pointer shrink-0"
                >
                  <FaPlus className="text-xs" />
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Modal notas */}
      {pendingItem && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40" onClick={() => setPendingItem(null)}>
          <div
            className="bg-white w-full max-w-md rounded-t-2xl sm:rounded-2xl p-5 flex flex-col gap-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div>
              <p className="font-semibold text-gray-900">{pendingItem.product.name}</p>
              <p className="text-sm text-gray-400">S/ {pendingItem.product.price.toFixed(2)}</p>
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-gray-700">Nota (opcional)</label>
              <input
                autoFocus
                type="text"
                placeholder="Ej: sin ají, poco sal…"
                maxLength={255}
                className="border-2 border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-orange transition-colors"
                value={pendingItem.notes}
                onChange={(e) => setPendingItem({ ...pendingItem, notes: e.target.value })}
                onKeyDown={(e) => e.key === "Enter" && handleConfirm()}
              />
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setPendingItem(null)}
                className="flex-1 py-3 rounded-xl border-2 border-gray-200 text-sm font-semibold text-gray-600 cursor-pointer"
              >
                Cancelar
              </button>
              <button
                onClick={handleConfirm}
                disabled={isAdding}
                className="flex-1 py-3 rounded-xl bg-green text-white text-sm font-semibold disabled:opacity-40 cursor-pointer"
              >
                {isAdding ? "Agregando..." : "Agregar"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
