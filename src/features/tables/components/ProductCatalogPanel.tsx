import { useState, useEffect } from "react";
import { useCategories, useSelectedCategory, type Category } from "@/features/menu";
import { useSelectedTable } from "@/features/tables";
import { ListProducts } from "./ListProducts";

interface Props {
  selectedCategory: ReturnType<typeof useSelectedCategory>;
  selectedTable: ReturnType<typeof useSelectedTable>;
  orderId?: number;
}

export function ProductCatalogPanel({ selectedCategory, selectedTable, orderId }: Props) {
  const [searchTerm, setSearchTerm] = useState("");
  const { categories, isLoading, error } = useCategories();

  useEffect(() => {
    if (categories.length > 0 && !selectedCategory.selectedCategory) {
      selectedCategory.selectCategory(categories[0]);
    }
  }, [categories, selectedCategory]);

  const handleChangeCategory = (category: Category) => {
    selectedCategory.selectCategory(category);
    setSearchTerm("");
  };

  return (
    <div className="flex flex-col lg:flex-row flex-1 min-h-0 lg:gap-4">
      {/* Categorías: fila horizontal con scroll en mobile, columna lateral fija en
          desktop. El degradado en el borde derecho (solo mobile, apagado en lg: donde
          pasa a columna vertical) es la señal de que hay más categorías para
          deslizar — sin él, la última se ve cortada en seco en vez de invitar a
          scrollear (mismo criterio abajo en QuickAddItems.tsx). */}
      <div
        className="overflow-x-auto lg:overflow-x-visible lg:overflow-y-auto py-1 lg:py-0 shrink-0 lg:w-[160px] lg:border-r lg:border-gray-100 lg:pr-3
          [mask-image:linear-gradient(to_right,black_85%,transparent_100%)] lg:[mask-image:none]
          [-webkit-mask-image:linear-gradient(to_right,black_85%,transparent_100%)] lg:[-webkit-mask-image:none]"
      >
        <ul className="flex lg:flex-col gap-1 min-w-max lg:min-w-0 pr-6 lg:pr-0">
          {isLoading ? <p className="text-sm text-gray-400">Cargando…</p>
            : error ? <p className="text-sm text-red">Error al cargar las categorías</p>
            : categories.map((c) => (
            <button
              key={c.id}
              onClick={() => handleChangeCategory(c)}
              className={`
                min-h-[44px] px-4 py-2 rounded-lg text-sm font-medium cursor-pointer whitespace-nowrap transition-all lg:w-full lg:text-left
                ${c.id === selectedCategory.selectedCategory?.id
                  ? "bg-orange text-white"
                  : "text-gray-600 hover:bg-gray-100 active:bg-gray-200"}
              `}
            >
              {c.name}
            </button>
          ))}
        </ul>
      </div>

      <div className="flex flex-col flex-1 min-h-0 min-w-0">
        <ListProducts
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          selectedTable={selectedTable}
          selectedCategory={selectedCategory}
          orderId={orderId}
        />
      </div>
    </div>
  );
}
