import { useEffect, useState } from "react";
import { Modal, TitleModal } from "@/shared/components";
import { useModal } from "@/shared/hooks/useModal";
import { useCategories, useSelectedCategory, type Category } from "@/features/menu";
import { useSelectedTable, useProductListModal } from "@/features/tables";
import { ListProducts } from "../ListProducts";

interface Props {
  productListModal: ReturnType<typeof useProductListModal>;
  selectedCategory: ReturnType<typeof useSelectedCategory>;
  selectedTable: ReturnType<typeof useSelectedTable>;
  orderId?: number;
}

export function ModalProductList({ productListModal, selectedCategory, selectedTable, orderId }: Props) {
  const [searchTerm, setSearchTerm] = useState("");
  const dialogRef = useModal(productListModal.isOpen);

  const { categories, isLoading, error } = useCategories();

  useEffect(() => {
    if (productListModal.isOpen && categories.length > 0 && !selectedCategory.selectedCategory) {
      selectedCategory.selectCategory(categories[0]);
    }
  }, [productListModal.isOpen, categories, selectedCategory]);

  const handleChangeCategory = (category: Category) => {
    selectedCategory.selectCategory(category);
    setSearchTerm("");
  }

  return (
    <Modal
      dialogRef={dialogRef}
      setOpen={productListModal.close}
      className="w-full h-[82dvh] lg:w-[620px] lg:h-[620px] overflow-hidden"
    >
      <TitleModal>Carta</TitleModal>

      {/* Categorías — scroll horizontal, no se encoge */}
      <div className="overflow-x-auto -mx-6 px-6 py-1 shrink-0">
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
    </Modal>
  )
}
