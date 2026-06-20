import { useRef, useState } from "react";
import { useCategories, useProducts, useProductModal, useProductFilters } from "@/features/menu";
import { ModalProductForm, ListProducts } from "@/features/menu";
import { ModalCategoryForm } from "./components/ModalCategoryForm";
import { HeaderSection, FilterTabs } from "@/shared/components";
import { useAuth } from "@/features/auth";
import type { Category } from "./types/Category";
import { MdAdd } from "react-icons/md";
import { MdEdit } from "react-icons/md";

export function Menu() {
  const filters = useProductFilters();
  const products = useProducts(filters.selectedCategory);
  const modal = useProductModal();
  const {
    categories,
    createCategory,
    updateCategory,
    deleteCategory,
    isCreating,
    isUpdating,
    isDeleting,
  } = useCategories();
  const { user } = useAuth();
  const isAdmin = user?.role === 'ADMIN';

  const [catModalOpen, setCatModalOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const catSourceRef = useRef<HTMLElement | null>(null);

  const openCreateCategory = (src: HTMLElement) => {
    catSourceRef.current = src;
    setSelectedCategory(null);
    setCatModalOpen(true);
  };

  const openEditCategory = (cat: Category, src: HTMLElement) => {
    catSourceRef.current = src;
    setSelectedCategory(cat);
    setCatModalOpen(true);
  };

  const filterTabs = categories.map((category) => ({
    id: category.id,
    label: category.name,
  }));

  return (
    <>
      <main className="flex flex-col gap-8 min-w-0 w-full p-6">
        <HeaderSection
          title="Gestión de Productos"
          subTitle="Administra todos los productos del menú organizados por categoría"
          buttonLabel="Agregar Producto"
          buttonFunction={(src) => modal.openCreate(src)}
          buttonHide={!isAdmin}
        />

        <div className="flex flex-col gap-3">
          <FilterTabs
            tabs={filterTabs}
            selected={filters.selectedCategory}
            onSelect={(id) => filters.setSelectedCategory(typeof id === 'number' ? id : null)}
          />

          {isAdmin && (
            <div className="flex flex-wrap gap-2">
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={(e) => openEditCategory(cat, e.currentTarget as HTMLElement)}
                  className="flex items-center gap-1 text-xs font-medium text-gray-500 hover:text-orange border border-gray-200 hover:border-orange rounded-full px-2.5 py-1 transition-colors cursor-pointer"
                >
                  <MdEdit size={11} />
                  {cat.name}
                </button>
              ))}
              <button
                onClick={(e) => openCreateCategory(e.currentTarget as HTMLElement)}
                className="flex items-center gap-1 text-xs font-medium text-gray-500 hover:text-green border border-dashed border-gray-300 hover:border-green rounded-full px-2.5 py-1 transition-colors cursor-pointer"
              >
                <MdAdd size={11} />
                Nueva
              </button>
            </div>
          )}
        </div>

        <ListProducts
          products={products.products}
          isLoading={products.isLoading}
          onEdit={(product, src) => modal.openEdit(product, src)}
          onToggleActive={products.toggleProductActive}
          isAdmin={isAdmin}
          page={products.page}
          totalPages={products.pagination.totalPages}
          onPageChange={products.goToPage}
        />
      </main>

      <ModalProductForm
        modal={modal}
        productsHook={products}
      />

      <ModalCategoryForm
        isOpen={catModalOpen}
        onClose={() => setCatModalOpen(false)}
        sourceRef={catSourceRef}
        selected={selectedCategory}
        onCreate={createCategory}
        onUpdate={updateCategory}
        onDelete={deleteCategory}
        isSaving={isCreating || isUpdating}
        isDeleting={isDeleting}
      />
    </>
  );
}
