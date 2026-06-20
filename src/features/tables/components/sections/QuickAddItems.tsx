import { useProducts, type Product } from "@/features/menu";
import { useQuickAddProducts } from "@/shared/hooks/useQuickAddProducts";
import { FaBolt, FaPlus } from "react-icons/fa";
import { useState } from "react";

interface Props {
  onAdd: (productId: number) => Promise<void>;
  disabled?: boolean;
}

export function QuickAddItems({ onAdd, disabled }: Props) {
  const [addingId, setAddingId] = useState<number | null>(null);
  const quickIds = useQuickAddProducts();
  const { products: allProducts } = useProducts();

  const products = quickIds
    .map((id) => allProducts.find((p) => p.id === id))
    .filter((p): p is Product => p !== undefined && p.active !== false);

  if (products.length === 0) return null;

  const handleAdd = async (product: Product) => {
    if (addingId !== null || disabled) return;
    setAddingId(product.id);
    try {
      await onAdd(product.id);
    } finally {
      setAddingId(null);
    }
  };

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-1.5">
        <FaBolt className="text-orange text-[10px]" />
        <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wide">
          Acceso rápido
        </span>
      </div>
      <div className="overflow-x-auto -mx-1 px-1 pb-0.5">
        <div className="flex gap-2 min-w-max">
          {products.map((p) => {
            const isThisAdding = addingId === p.id;
            return (
              <button
                key={p.id}
                onClick={() => handleAdd(p)}
                disabled={disabled || addingId !== null}
                aria-label={`Agregar rápido: ${p.name}`}
                className={`
                  flex items-center gap-2 pl-3 pr-2.5 py-2 rounded-full border-2 text-sm
                  font-medium whitespace-nowrap transition-all cursor-pointer min-h-[36px] select-none
                  ${isThisAdding
                    ? "border-orange bg-orange/10 text-orange"
                    : "border-gray-200 text-gray-600 hover:border-orange hover:bg-orange/5 hover:text-orange active:scale-95"
                  }
                  disabled:opacity-50 disabled:cursor-default
                `}
              >
                <span>{p.name}</span>
                <span className="text-[11px] text-gray-400 font-normal tabular-nums">
                  S/ {p.price.toFixed(2)}
                </span>
                <span
                  className={`w-5 h-5 flex items-center justify-center rounded-full transition-colors shrink-0 ${
                    isThisAdding ? "bg-orange" : "bg-gray-100"
                  }`}
                >
                  {isThisAdding ? (
                    <span className="w-2.5 h-2.5 border-[1.5px] border-white border-t-transparent rounded-full animate-spin block" />
                  ) : (
                    <FaPlus className="text-[8px] text-gray-500" />
                  )}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
