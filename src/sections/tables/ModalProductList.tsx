import { useEffect } from "react";
import { Modal, TitelModal } from "../../components/UI";
import { useProductListModal } from "../../hooks/useModal";
import { useProductListModalStore } from "../../stores/ModalStore";
import { useCategories } from "../../hooks/useCategories";
import { useCategoryStore } from "../../stores/CategoryStore";
import type { Category } from "../../models/Category.model";
import { ListProducts } from "../../components/tables";

export function ModalProductList() {
  const { isOpen, setOpen } = useProductListModalStore();
  const dialogRef = useProductListModal(isOpen);
  
  const { categories, isLoading, error } = useCategories();

  const { category, setCategory } = useCategoryStore();

  useEffect(() => {
    setCategory(categories[0])
  }, [categories, setCategory])

  const handleChangeCategory = (category: Category) => {
    setCategory(category);
  }

  return (
    <Modal 
      dialogRef={dialogRef}
      setOpen={setOpen}
    >
      <TitelModal>Lista de Productos</TitelModal>
      <ul className="flex gap-6 justify-center">
        {isLoading ? <p>Cargando categorias...</p>
          :error ? <p>Error al cargar las categorias</p>
          : categories.map((c) => (
          <button 
            key={c.id}
            onClick={() => handleChangeCategory(c)}
            className={`
              font-semibold border-b-4 cursor-pointer transition-colors
              ${c.id === category?.id ? "border-orange" : "border-transparent"}
            `}
          >
            {c.name}
          </button>
        ))}
      </ul>
      <ListProducts />
    </Modal>
  )
}

