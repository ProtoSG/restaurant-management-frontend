import { useAvailableProducts, useSelectedCategory, categoryColorClasses, type Product } from "@/features/menu"
import { useSelectedTable, useAddItemToOrder as useAddItemToOrderTable, useOrderActive, useCreateOrder } from "@/features/tables"
import { useAddItemToOrder as useAddItemToOrderOrders } from "@/features/orders"
import { useTakeawaySurcharge } from "@/shared/hooks/useTakeawaySurcharge"
import { useQuickNotes } from "@/shared/hooks/useQuickNotes"
import { Toggle } from "@/shared/components"
import { QuickAddItems } from "./sections/QuickAddItems"
import { FaSearch, FaPlus, FaMinus, FaShoppingBag } from "react-icons/fa";
import { useRef, useState } from "react";

/**
 * Foto si la hay; si no, un círculo con el color de la categoría y la inicial del nombre —
 * mismo tamaño, igual de tappeable. `imageUrl` roto (404, borrado a mano) cae al mismo
 * placeholder vía onError, no deja un ícono de imagen rota en medio de la grilla.
 */
function ProductThumbnail({ product }: { product: Product }) {
  const [failed, setFailed] = useState(false);
  const showPlaceholder = !product.imageUrl || failed;

  if (showPlaceholder) {
    return (
      <div className={`w-full aspect-square flex items-center justify-center text-2xl font-bold ${categoryColorClasses(product.categoryId)}`}>
        {product.name.trim().charAt(0).toUpperCase()}
      </div>
    );
  }

  return (
    <img
      src={product.imageUrl!}
      alt=""
      className="w-full aspect-square object-contain bg-gray-50"
      onError={() => setFailed(true)}
    />
  );
}

interface Props {
  searchTerm: string;
  setSearchTerm: React.Dispatch<React.SetStateAction<string>>;
  selectedTable: ReturnType<typeof useSelectedTable>;
  selectedCategory: ReturnType<typeof useSelectedCategory>;
  orderId?: number;
}

interface PendingItem {
  product: Product;
  selectedPrice?: number;
  notes: string;
  quantity: number;
  isTakeaway: boolean;
}

interface PriceOption {
  price: number;
  ariaLabel: string;
}

/**
 * Un producto puede tener varios precios: el precio inicial (con el que se creó)
 * más, opcionalmente, uno o más precios adicionales (sus variantes). Ninguno es
 * un caso especial del otro — acá se listan todos como un único conjunto de
 * opciones, deduplicando por valor exacto para no mostrar dos chips idénticos.
 */
function getPriceOptions(product: Product): PriceOption[] {
  const options: PriceOption[] = [
    { price: product.price, ariaLabel: `Precio inicial, S/ ${product.price.toFixed(2)}` },
  ];
  for (const variant of product.variants ?? []) {
    if (!options.some((option) => option.price === variant.price)) {
      options.push({ price: variant.price, ariaLabel: `${variant.name}, S/ ${variant.price.toFixed(2)}` });
    }
  }
  return options;
}

function getUnitPrice(item: PendingItem, surcharge: number): number {
  const base = item.selectedPrice ?? item.product.price;
  return base + (item.isTakeaway ? surcharge : 0);
}

export function ListProducts({ searchTerm, setSearchTerm, selectedTable, selectedCategory, orderId }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [pendingItem, setPendingItem] = useState<PendingItem | null>(null);
  const surcharge = useTakeawaySurcharge();
  const noteSuggestions = useQuickNotes();

  const noteTokens = (notes: string) => notes.split(",").map((t) => t.trim()).filter(Boolean);

  const toggleNoteSuggestion = (suggestion: string) => {
    setPendingItem((prev) => {
      if (!prev) return prev;
      const tokens = noteTokens(prev.notes);
      const next = tokens.includes(suggestion)
        ? tokens.filter((t) => t !== suggestion)
        : [...tokens, suggestion];
      return { ...prev, notes: next.join(", ") };
    });
  };

  const isSearching = searchTerm.trim().length > 0;
  const { products: allAvailableProducts, isLoading, error } = useAvailableProducts();
  const { order: activeOrder } = useOrderActive(selectedTable.selectedTable?.id || 0, !orderId && !!selectedTable.selectedTable);
  const createOrderMutation = useCreateOrder();
  const addItemTableMutation = useAddItemToOrderTable();
  const addItemOrdersMutation = useAddItemToOrderOrders();

  const selectedCategoryId = selectedCategory.selectedCategory?.id || 0;
  const products = isSearching
    ? allAvailableProducts
    : allAvailableProducts.filter(p => p.categoryId === selectedCategoryId);

  const pendingPriceOptions = pendingItem ? getPriceOptions(pendingItem.product) : [];

  // Con una sola opción de precio, se auto-selecciona (comportamiento actual sin
  // cambios). Con más de una, se abre el modal sin precio elegido: hay que
  // elegir explícitamente adentro (ver cabecera de precios más abajo).
  const handleAddItem = (product: Product) => {
    const hasMultipleOptions = getPriceOptions(product).length > 1;
    setPendingItem({
      product,
      selectedPrice: hasMultipleOptions ? undefined : product.price,
      notes: "",
      quantity: 1,
      isTakeaway: false,
    });
  };

  const handleSelectPrice = (price: number) => {
    setPendingItem((prev) => prev ? { ...prev, selectedPrice: price } : prev);
  };

  const handleConfirm = async () => {
    if (!pendingItem) return;
    if (pendingItem.selectedPrice === undefined) return;
    try {
      const notes = pendingItem.notes.trim() || undefined;
      const isTakeaway = pendingItem.isTakeaway;
      const selectedPrice = pendingItem.selectedPrice;

      if (orderId) {
        await addItemOrdersMutation.mutateAsync({
          orderId,
          productId: pendingItem.product.id,
          quantity: pendingItem.quantity,
          notes,
          isTakeaway,
          selectedPrice,
        });
      } else {
        if (!selectedTable.selectedTable) return;
        let currentOrderId = activeOrder?.id;
        if (!currentOrderId) {
          const newOrder = await createOrderMutation.mutateAsync(selectedTable.selectedTable.id);
          currentOrderId = newOrder.id;
        }
        await addItemTableMutation.mutateAsync({
          orderId: currentOrderId,
          tableId: selectedTable.selectedTable.id,
          productId: pendingItem.product.id,
          quantity: pendingItem.quantity,
          notes,
          isTakeaway,
          selectedPrice,
        });
      }
    } catch (error) {
      console.error('Error al agregar item:', error);
    } finally {
      setPendingItem(null);
    }
  };

  const isAdding = createOrderMutation.isPending || addItemTableMutation.isPending || addItemOrdersMutation.isPending;

  const handleQuickAdd = async (productId: number) => {
    try {
      if (orderId) {
        await addItemOrdersMutation.mutateAsync({ orderId, productId, quantity: 1 });
      } else {
        if (!selectedTable.selectedTable) return;
        let currentOrderId = activeOrder?.id;
        if (!currentOrderId) {
          const newOrder = await createOrderMutation.mutateAsync(selectedTable.selectedTable.id);
          currentOrderId = newOrder.id;
        }
        await addItemTableMutation.mutateAsync({
          orderId: currentOrderId,
          tableId: selectedTable.selectedTable.id,
          productId,
          quantity: 1,
        });
      }
    } catch (error) {
      console.error('Error en acceso rápido:', error);
    }
  };

  const filteredProducts = products.filter((product: Product) =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (isLoading) return (
    <div className="flex flex-col gap-3 flex-1 animate-pulse">
      <div className="h-10 bg-gray-100 rounded-xl" />
      <div className="grid grid-cols-[repeat(auto-fit,minmax(110px,1fr))] gap-2.5">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="rounded-xl overflow-hidden border border-gray-100">
            <div className="w-full aspect-square bg-gray-100" />
            <div className="p-2 flex flex-col gap-1.5">
              <div className="h-3 bg-gray-100 rounded w-4/5" />
              <div className="h-3 bg-gray-100 rounded w-1/2" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  if (error) return <p className="text-red text-sm">Error al cargar los productos</p>;

  return (
    <>
      <div className="flex flex-col gap-3 flex-1 min-h-0 overflow-hidden">
        <div className="hidden xl:flex items-center gap-2 border-2 border-gray-200 rounded-xl px-3 py-2.5 focus-within:border-orange transition-colors shrink-0">
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

        {filteredProducts.length === 0 ? (
          <div className="flex flex-col items-center justify-center flex-1 gap-2 py-8">
            <p className="text-gray-400 text-sm">
              {searchTerm ? `Sin resultados para "${searchTerm}"` : "No hay productos en esta categoría"}
            </p>
          </div>
        ) : (
          <ul className="grid grid-cols-[repeat(auto-fit,minmax(110px,1fr))] gap-2.5 overflow-y-auto flex-1 content-start pb-1 -mx-1 px-1">
            {filteredProducts.map((p: Product) => {
              const priceOptions = getPriceOptions(p);
              const hasMultipleOptions = priceOptions.length > 1;
              const minPrice = Math.min(...priceOptions.map((option) => option.price));

              return (
                <li key={p.id}>
                  <div
                    onClick={() => !isAdding && handleAddItem(p)}
                    role="button"
                    aria-label={`Agregar ${p.name}`}
                    className="flex flex-col rounded-xl overflow-hidden border border-gray-100 transition-colors cursor-pointer select-none hover:border-orange/50 active:bg-gray-50"
                  >
                    <ProductThumbnail product={p} />
                    <div className="flex flex-col gap-0.5 px-2 py-2">
                      <p className="text-sm font-medium text-gray-900 leading-snug line-clamp-2">{p.name}</p>
                      <span className="text-sm font-semibold text-gray-600 tabular-nums">
                        {hasMultipleOptions ? `Desde S/ ${minPrice.toFixed(2)}` : `S/ ${p.price.toFixed(2)}`}
                      </span>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      <div className="shrink-0 pt-3 mt-1 border-t border-gray-100">
        <QuickAddItems onAdd={handleQuickAdd} disabled={isAdding} />
      </div>

      {pendingItem && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40" onClick={() => setPendingItem(null)}>
          <div
            className="bg-white w-full max-w-md rounded-t-2xl sm:rounded-2xl p-5 flex flex-col gap-4 animate-[slide-up_0.28s_cubic-bezier(0.4,0,0.2,1)]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="font-semibold text-gray-900">{pendingItem.product.name}</p>
                {pendingPriceOptions.length <= 1 && (
                  <p className="text-sm text-gray-400">
                    S/ {getUnitPrice(pendingItem, surcharge).toFixed(2)} c/u
                    {pendingItem.isTakeaway && (
                      <span className="ml-1 text-orange font-medium">(+S/ {surcharge.toFixed(2)} llevar)</span>
                    )}
                  </p>
                )}
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => setPendingItem({ ...pendingItem, quantity: Math.max(1, pendingItem.quantity - 1) })}
                  className="w-11 h-11 flex items-center justify-center rounded-xl border-2 border-gray-200 text-gray-600 active:bg-gray-50 transition-colors cursor-pointer"
                  aria-label="Disminuir cantidad"
                >
                  <FaMinus className="text-xs" />
                </button>
                <span className="w-6 text-center text-base font-semibold text-gray-900 tabular-nums">
                  {pendingItem.quantity}
                </span>
                <button
                  onClick={() => setPendingItem({ ...pendingItem, quantity: pendingItem.quantity + 1 })}
                  className="w-11 h-11 flex items-center justify-center rounded-xl bg-green text-white active:opacity-75 transition-opacity cursor-pointer"
                  aria-label="Aumentar cantidad"
                >
                  <FaPlus className="text-xs" />
                </button>
              </div>
            </div>

            {/* Cabecera de precios: con más de una opción, el precio se elige acá en vez de en la lista */}
            {pendingPriceOptions.length > 1 && (
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-gray-700">Elegí el precio</label>
                <div className="flex flex-wrap gap-1.5">
                  {pendingPriceOptions.map((option) => {
                    const selected = pendingItem.selectedPrice === option.price;
                    return (
                      <button
                        key={option.price}
                        type="button"
                        onClick={() => handleSelectPrice(option.price)}
                        aria-label={option.ariaLabel}
                        className={`px-4 py-2 min-h-[44px] rounded-xl border-2 transition-all cursor-pointer select-none ${
                          selected
                            ? "border-orange bg-orange text-white"
                            : "border-gray-200 text-gray-700 hover:border-orange hover:bg-orange/5"
                        }`}
                      >
                        <span className="text-sm font-bold tabular-nums">S/ {option.price.toFixed(2)}</span>
                      </button>
                    );
                  })}
                </div>
                {pendingItem.isTakeaway && pendingItem.selectedPrice !== undefined && (
                  <p className="text-xs text-orange font-medium">+S/ {surcharge.toFixed(2)} llevar</p>
                )}
              </div>
            )}

            <div className={`flex items-center gap-2.5 w-full px-3.5 py-2.5 rounded-xl border-2 transition-colors text-sm font-medium ${
              pendingItem.isTakeaway
                ? "border-orange bg-orange/10 text-orange"
                : "border-gray-200 text-gray-500"
            }`}>
              <FaShoppingBag className="text-sm shrink-0" />
              <Toggle
                checked={pendingItem.isTakeaway}
                onChange={(checked) => setPendingItem({ ...pendingItem, isTakeaway: checked })}
                label="Para llevar"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-gray-700">Nota (opcional)</label>
              {noteSuggestions.length > 0 && (
                <div className="flex flex-wrap gap-1.5 pb-0.5">
                  {noteSuggestions.map((suggestion) => {
                    const active = noteTokens(pendingItem.notes).includes(suggestion);
                    return (
                      <button
                        key={suggestion}
                        type="button"
                        onClick={() => toggleNoteSuggestion(suggestion)}
                        className={`px-3 py-1.5 rounded-full border-2 text-xs font-medium whitespace-nowrap transition-all cursor-pointer select-none ${
                          active
                            ? "border-orange bg-orange/10 text-orange"
                            : "border-gray-200 text-gray-600 hover:border-orange hover:bg-orange/5 hover:text-orange"
                        }`}
                      >
                        {suggestion}
                      </button>
                    );
                  })}
                </div>
              )}
              <input
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
                disabled={isAdding || pendingItem.selectedPrice === undefined}
                className="flex-1 py-3 rounded-xl bg-green text-white text-sm font-semibold disabled:opacity-40 cursor-pointer"
              >
                {isAdding
                  ? "Agregando..."
                  : pendingItem.selectedPrice === undefined
                  ? "Elegí un precio"
                  : `Agregar — S/ ${(getUnitPrice(pendingItem, surcharge) * pendingItem.quantity).toFixed(2)}`
                }
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
