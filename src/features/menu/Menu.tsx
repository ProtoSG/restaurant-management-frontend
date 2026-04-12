import { useCategories, useProducts, useProductModal, useProductFilters } from "@/features/menu";
import { ModalProductForm, ListProducts } from "@/features/menu";
import { HeaderSection } from "@/shared/components";

export function Menu() {
  const products = useProducts();
  const modal = useProductModal();
  const filters = useProductFilters(products.products);
  const { categories } = useCategories();

  return (
    <>
      <main className="flex flex-col gap-8 min-w-0 w-full">
        <HeaderSection
          title="Gestión de Productos"
          subTitle="Administra todos los productos del menú organizados por categoría"
          buttonLabel="Agregar Producto"
          buttonFunction={modal.openCreate}
        />

        <div className="flex flex-wrap gap-3">
          <button
            onClick={filters.clearFilter}
            className={`
              px-5 py-2.5 rounded-lg font-medium transition-all cursor-pointer
              ${filters.selectedCategory === null
                ? 'bg-green text-white shadow-md'
                : 'bg-white border-2 border-gray-300 text-gray-700 hover:border-green'
              }
            `}
          >
            Todas las categorías ({products.products.length})
          </button>
          {categories.map((category) => {
            const count = filters.getCountByCategory(category.id);
            return (
              <button
                key={category.id}
                onClick={() => filters.setSelectedCategory(category.id)}
                className={`
                  px-5 py-2.5 rounded-lg font-medium transition-all cursor-pointer
                  ${filters.selectedCategory === category.id
                    ? 'bg-green text-white shadow-md'
                    : 'bg-white border-2 border-gray-300 text-gray-700 hover:border-green'
                  }
                `}
              >
                {category.name} ({count})
              </button>
            );
          })}
        </div> 

        <ListProducts
          products={filters.filteredProducts}
          isLoading={products.isLoading}
          onEdit={modal.openEdit}
          onToggleActive={products.toggleProductActive}
        />
      </main>

      <ModalProductForm 
        modal={modal}
        productsHook={products}
      />
    </>
  );
}
