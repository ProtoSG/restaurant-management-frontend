import { useMemo, useRef, useState } from "react";
import { FaSearch, FaMinus, FaPlus, FaArrowLeft } from "react-icons/fa";
import { useAvailableProducts, type Product } from "@/features/menu";
import type { VoiceOrderPreviewItem } from "../types/VoiceOrder";

interface PriceOption {
  price: number;
  ariaLabel: string;
}

/**
 * Mismo criterio que ListProducts.tsx: un producto puede tener varios precios
 * (el inicial + variantes). Ninguno es un caso especial del otro — se listan
 * todos como un único conjunto de opciones, deduplicando por valor exacto.
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

export interface ResolvedFix {
  productId: number;
  productName: string;
  selectedPrice: number;
  quantity: number;
  notes: string | null;
}

interface Props {
  item: VoiceOrderPreviewItem;
  onResolve: (resolved: ResolvedFix) => void;
  onClose: () => void;
}

/**
 * Picker de producto/precio reutilizado del flujo táctil (ListProducts.tsx):
 * si el ítem ya trae un producto identificado (PRICE_MISMATCH) se salta directo
 * a elegir precio; si no (NOT_FOUND / NOT_AVAILABLE) primero hay que buscar
 * y elegir el producto.
 */
export function ItemFixSheet({ item, onResolve, onClose }: Props) {
  const { products, isLoading, error } = useAvailableProducts();
  const preselected = useMemo(
    () => (item.productId != null ? products.find((p) => p.id === item.productId) ?? null : null),
    [products, item.productId]
  );

  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [search, setSearch] = useState(item.productName ?? item.rawText);
  const [selectedPrice, setSelectedPrice] = useState<number | undefined>(undefined);
  const [quantity, setQuantity] = useState(item.quantity || 1);
  const [notes, setNotes] = useState(item.notes ?? "");
  const inputRef = useRef<HTMLInputElement>(null);

  const activeProduct = selectedProduct ?? preselected;
  const priceOptions = activeProduct ? getPriceOptions(activeProduct) : [];

  const handlePickProduct = (product: Product) => {
    const options = getPriceOptions(product);
    setSelectedProduct(product);
    setSelectedPrice(options.length === 1 ? options[0].price : undefined);
  };

  const filteredProducts = products.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase())
  );

  const showProductPicker = !activeProduct;
  const effectiveSelectedPrice = selectedProduct
    ? selectedPrice
    : preselected
      ? (selectedPrice ?? (priceOptions.length === 1 ? priceOptions[0].price : undefined))
      : undefined;

  const handleConfirm = () => {
    if (!activeProduct || effectiveSelectedPrice === undefined) return;
    onResolve({
      productId: activeProduct.id,
      productName: activeProduct.name,
      selectedPrice: effectiveSelectedPrice,
      quantity,
      notes: notes.trim() || null,
    });
  };

  return (
    <div className="fixed inset-0 z-[80] flex items-end sm:items-center justify-center bg-black/40" onClick={onClose}>
      <div
        className="bg-white w-full max-w-md rounded-t-2xl sm:rounded-2xl p-5 flex flex-col gap-4 max-h-[85vh] animate-[slide-up_0.28s_cubic-bezier(0.4,0,0.2,1)]"
        onClick={(e) => e.stopPropagation()}
      >
        {showProductPicker ? (
          <>
            <div>
              <p className="font-semibold text-gray-900">Elegí el producto</p>
              <p className="text-sm text-gray-400">Dictado: “{item.rawText}”</p>
            </div>
            <div className="flex items-center gap-2 border-2 border-gray-200 rounded-xl px-3 py-2.5 focus-within:border-orange transition-colors shrink-0">
              <FaSearch className="text-gray-400 shrink-0 text-xs" />
              <input
                ref={inputRef}
                type="text"
                autoFocus
                placeholder="Buscar producto…"
                className="w-full focus:outline-none text-sm bg-transparent"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                aria-label="Buscar producto en la carta"
              />
            </div>

            {isLoading ? (
              <p className="text-sm text-gray-400 py-4 text-center">Cargando productos…</p>
            ) : error ? (
              <p className="text-sm text-red py-4 text-center">Error al cargar los productos</p>
            ) : filteredProducts.length === 0 ? (
              <p className="text-sm text-gray-400 py-4 text-center">Sin resultados para "{search}"</p>
            ) : (
              <ul className="flex flex-col overflow-y-auto flex-1 -mx-1">
                {filteredProducts.map((p) => {
                  const options = getPriceOptions(p);
                  const hasMultipleOptions = options.length > 1;
                  const minPrice = Math.min(...options.map((o) => o.price));
                  return (
                    <li key={p.id} className="border-b border-gray-100 last:border-0">
                      <div
                        onClick={() => handlePickProduct(p)}
                        role="button"
                        aria-label={`Elegir ${p.name}`}
                        className="flex items-center gap-3 px-1 py-3.5 min-h-[44px] transition-colors cursor-pointer select-none hover:bg-gray-50 active:bg-gray-100"
                      >
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 leading-snug">{p.name}</p>
                          {hasMultipleOptions && (
                            <p className="text-xs text-gray-400 mt-0.5">{options.length} precios</p>
                          )}
                        </div>
                        <span className="text-sm font-semibold text-gray-600 tabular-nums shrink-0 text-right">
                          {hasMultipleOptions ? `Desde S/ ${minPrice.toFixed(2)}` : `S/ ${p.price.toFixed(2)}`}
                        </span>
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}

            <button
              onClick={onClose}
              className="py-3 rounded-xl border-2 border-gray-200 text-sm font-semibold text-gray-600 cursor-pointer"
            >
              Cancelar
            </button>
          </>
        ) : (
          <>
            <div className="flex items-start gap-3">
              {selectedProduct && preselected == null ? (
                <button
                  onClick={() => setSelectedProduct(null)}
                  aria-label="Volver a buscar producto"
                  className="w-9 h-9 shrink-0 flex items-center justify-center rounded-lg text-gray-500 hover:bg-gray-100 cursor-pointer"
                >
                  <FaArrowLeft className="text-xs" />
                </button>
              ) : null}
              <div className="min-w-0 flex-1">
                <p className="font-semibold text-gray-900">{activeProduct!.name}</p>
                {priceOptions.length <= 1 && (
                  <p className="text-sm text-gray-400">S/ {activeProduct!.price.toFixed(2)} c/u</p>
                )}
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  className="w-11 h-11 flex items-center justify-center rounded-xl border-2 border-gray-200 text-gray-600 active:bg-gray-50 transition-colors cursor-pointer"
                  aria-label="Disminuir cantidad"
                >
                  <FaMinus className="text-xs" />
                </button>
                <span className="w-6 text-center text-base font-semibold text-gray-900 tabular-nums">{quantity}</span>
                <button
                  onClick={() => setQuantity((q) => q + 1)}
                  className="w-11 h-11 flex items-center justify-center rounded-xl bg-green text-white active:opacity-75 transition-opacity cursor-pointer"
                  aria-label="Aumentar cantidad"
                >
                  <FaPlus className="text-xs" />
                </button>
              </div>
            </div>

            {priceOptions.length > 1 && (
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-gray-700">Elegí el precio</label>
                <div className="flex flex-wrap gap-1.5">
                  {priceOptions.map((option) => {
                    const selected = effectiveSelectedPrice === option.price;
                    return (
                      <button
                        key={option.price}
                        type="button"
                        onClick={() => setSelectedPrice(option.price)}
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
              </div>
            )}

            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-gray-700">Nota (opcional)</label>
              <input
                type="text"
                placeholder="Ej: sin ají, poco sal…"
                maxLength={255}
                className="border-2 border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-orange transition-colors"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleConfirm()}
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={onClose}
                className="flex-1 py-3 rounded-xl border-2 border-gray-200 text-sm font-semibold text-gray-600 cursor-pointer"
              >
                Cancelar
              </button>
              <button
                onClick={handleConfirm}
                disabled={effectiveSelectedPrice === undefined}
                className="flex-1 py-3 rounded-xl bg-green text-white text-sm font-semibold disabled:opacity-40 cursor-pointer"
              >
                {effectiveSelectedPrice === undefined ? "Elegí un precio" : "Usar este producto"}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
