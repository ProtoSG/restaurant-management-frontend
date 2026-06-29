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
    <>
      <div className="overflow-x-auto py-1 shrink-0">
        <ul className="flex gap-1 min-w-max">
          {isLoading ? <p className="text-sm text-gray-400">Cargando…</p>
            : error ? <p className="text-sm text-red">Error al cargar las categorías</p>
            : categories.map((c) => (
            <button
              key={c.id}
              onClick={() => handleChangeCategory(c)}
              className={`
                min-h-[36px] px-4 py-2 rounded-lg text-sm font-medium cursor-pointer whitespace-nowrap transition-all
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

      <ListProducts
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        selectedTable={selectedTable}
        selectedCategory={selectedCategory}
        orderId={orderId}
      />
    </>
  );
}
