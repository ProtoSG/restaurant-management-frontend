import { useState } from "react";
import { MdEdit, MdInventory, MdMoreVert, MdToggleOff, MdToggleOn } from "react-icons/md";
import { SkeletonCard, EmptyState, Pagination } from "@/shared/components";
import type { Product } from "../types/Product";

interface Props {
  products: Product[];
  isLoading: boolean;
  onEdit: (product: Product, source: HTMLElement) => void;
  onToggleActive: (id: number) => Promise<void>;
  isAdmin?: boolean;
  page?: number;
  totalPages?: number;
  onPageChange?: (page: number) => void;
}

export function ListProducts({ products, isLoading, onEdit, onToggleActive, isAdmin = false, page = 0, totalPages = 1, onPageChange }: Props) {
  const [menuProduct, setMenuProduct] = useState<Product | null>(null);
  const [menuPos, setMenuPos] = useState<{ top: number; right: number } | null>(null);

  const openMenu = (product: Product, btn: HTMLElement) => {
    const rect = btn.getBoundingClientRect();
    setMenuPos({
      top: rect.bottom + 6,
      right: window.innerWidth - rect.right,
    });
    setMenuProduct(product);
  };

  const closeMenu = () => {
    setMenuProduct(null);
    setMenuPos(null);
  };

  const parsedProducts = products.map((product) => ({
    ...product,
    active: product.active ?? true,
  }));

  if (isLoading) return <SkeletonCard count={4} />;

  if (parsedProducts.length === 0) {
    return (
      <EmptyState
        message="No hay productos"
        icon={<MdInventory className="text-4xl text-gray-300" />}
      />
    );
  }

  return (
    <>
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50">
              <th className="text-left px-4 py-3 font-semibold text-gray-600">Nombre</th>
              <th className="text-left px-4 py-3 font-semibold text-gray-600 hidden sm:table-cell">Categoría</th>
              <th className="text-center px-4 py-3 font-semibold text-gray-600">Precio</th>
              {isAdmin && (
                <>
                  <th className="text-center px-4 py-3 font-semibold text-gray-600 hidden sm:table-cell">Activo</th>
                  <th className="text-center px-4 py-3 font-semibold text-gray-600 hidden sm:table-cell">Acciones</th>
                  <th className="sm:hidden" />
                </>
              )}
            </tr>
          </thead>
          <tbody>
            {parsedProducts.map((p) => (
              <tr
                key={p.id}
                className={`border-b border-gray-50 last:border-0 transition-colors ${
                  !p.active ? "opacity-50" : "hover:bg-gray-50/50"
                }`}
              >
                <td className="px-4 py-3">
                  <span className="font-medium text-gray-900">{p.name}</span>
                </td>
                <td className="px-4 py-3 hidden sm:table-cell">
                  <span className="text-xs text-gray-500">{p.categoryName ?? p.categoryId}</span>
                </td>
                <td className="px-4 py-3 text-center">
                  <span className="font-semibold text-gray-700 tabular-nums text-nowrap">S/ {p.price.toFixed(2)}</span>
                </td>
                {isAdmin && (
                  <>
                    {/* Desktop: toggle + edit inline */}
                    <td className="px-4 py-3 text-center hidden sm:table-cell">
                      <label className="relative inline-block w-[42px] h-5 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={p.active}
                          onChange={() => onToggleActive(p.id)}
                          className="opacity-0 w-0 h-0 peer"
                          aria-label={`${p.active ? 'Desactivar' : 'Activar'} ${p.name}`}
                        />
                        <span className="absolute inset-0 bg-gray-300 rounded-full transition-all duration-300
                                        before:content-[''] before:absolute before:h-[14px] before:w-[14px]
                                        before:left-[3px] before:bottom-[3px] before:bg-white before:rounded-full
                                        before:transition-all before:duration-300
                                        peer-checked:bg-green peer-checked:before:translate-x-[22px]
                                        peer-disabled:opacity-50" />
                      </label>
                    </td>
                    <td className="px-4 py-3 hidden sm:table-cell">
                      <div className="flex items-center justify-center">
                        <button
                          onClick={(e) => onEdit(p, e.currentTarget as HTMLElement)}
                          className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500 hover:text-orange transition-colors cursor-pointer"
                          title="Editar producto"
                        >
                          <MdEdit size={16} />
                        </button>
                      </div>
                    </td>

                    {/* Mobile: 3-dot button */}
                    <td className="px-4 py-3 sm:hidden">
                      <div className="flex justify-center">
                        <button
                          onClick={(e) => openMenu(p, e.currentTarget as HTMLElement)}
                          className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 transition-colors cursor-pointer"
                          aria-label="Acciones"
                        >
                          <MdMoreVert size={18} />
                        </button>
                      </div>
                    </td>
                  </>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {onPageChange && totalPages > 1 && (
        <Pagination
          currentPage={page}
          totalPages={totalPages}
          onPageChange={onPageChange}
        />
      )}

      {/* Mobile action menu */}
      {isAdmin && menuProduct && menuPos && (
        <>
          <div className="fixed inset-0 z-40" onClick={closeMenu} />
          <div
            className="fixed z-50 bg-white rounded-2xl overflow-hidden w-52 animate-[modal-in_0.15s_ease-out] shadow-[0_8px_32px_rgba(0,0,0,0.15)]"
            style={{ top: menuPos.top, right: menuPos.right }}
          >
            <div className="px-4 py-2.5 border-b border-gray-100">
              <p className="text-xs text-gray-400 font-medium uppercase tracking-wide">Acciones</p>
              <p className="text-sm font-semibold text-gray-900 truncate mt-0.5">{menuProduct.name}</p>
            </div>
            <button
              onClick={(e) => { onEdit(menuProduct, e.currentTarget as HTMLElement); closeMenu(); }}
              className="w-full flex items-center gap-3 px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 transition-colors cursor-pointer border-b border-gray-50"
            >
              <MdEdit size={16} className="text-orange shrink-0" />
              Editar producto
            </button>
            <button
              onClick={() => { onToggleActive(menuProduct.id); closeMenu(); }}
              className="w-full flex items-center gap-3 px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 transition-colors cursor-pointer"
            >
              {menuProduct.active
                ? <MdToggleOff size={20} className="text-gray-400 shrink-0" />
                : <MdToggleOn  size={20} className="text-green shrink-0" />}
              {menuProduct.active ? "Desactivar" : "Activar"} producto
            </button>
          </div>
        </>
      )}
    </>
  );
}
