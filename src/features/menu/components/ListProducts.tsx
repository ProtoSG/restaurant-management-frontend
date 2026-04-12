import { MdEdit } from "react-icons/md";
import DataTable, { Media } from 'react-data-table-component';
import type { Product } from "../types/Product";

interface Props {
  products: Product[];
  isLoading: boolean;
  onEdit: (product: Product) => void;
  onToggleActive: (id: number, currentActive: boolean) => Promise<void>;
}

export function ListProducts({ products, isLoading, onEdit, onToggleActive }: Props) {
  const formatPrice = (price: number): string => {
    return `S/ ${price.toFixed(2)}`;
  };

  const parsedProducts = products.map((product) => ({
    ...product,
    active: product.active ?? true,
  }));

  const columns = [
    {
      name: "ID",
      selector: (row: Product) => row.id,
      width: "70px",
      sortable: true,
    },
    {
      name: "Nombre",
      selector: (row: Product) => row.name,
    },
    {
      name: "Categoría",
      selector: (row: Product) => row.categoryId,
      width: "120px",
      hide: Media.MD
    },
    {
      name: "Precio",
      selector: (row: Product) => row.price,
      cell: (row: Product) => formatPrice(row.price),
      sortable: true,
      width: "120px",
      center: true
    },
    {
      name: "Activo",
      hide: Media.MD,
      cell: (row: Product) => (
        <label className="relative inline-block w-[50px] h-6 cursor-pointer">
          <input
            type="checkbox"
            checked={row.active ?? true}
            onChange={() => onToggleActive(row.id, row.active ?? true)}
            className="opacity-0 w-0 h-0 peer"
            aria-label={`${row.active ? 'Desactivar' : 'Activar'} ${row.name}`}
          />
          <span className="absolute top-0 left-0 right-0 bottom-0 bg-gray-300 rounded-full transition-all duration-400 
                         before:content-[''] before:absolute before:h-[18px] before:w-[18px] before:left-[3px] before:bottom-[3px] 
                         before:bg-white before:rounded-full before:transition-all before:duration-400
                         peer-checked:bg-green-500 peer-checked:before:translate-x-[26px]">
          </span>
        </label>
      ),
      width: "100px",
    },
    {
      name: "Editar",
      cell: (data: Product) => (
        <button
          className="bg-transparent border-none cursor-pointer text-gray-600 p-1 flex items-center justify-center 
                     transition-colors duration-200 hover:text-blue-500"
          onClick={() => onEdit(data)}
          title="Editar producto"
        >
          <MdEdit size={20} />
        </button>
      ),
      width: "80px",
    },
  ];

  return (
    <div className="overflow-x-auto w-full">
      <DataTable
        columns={columns}
        data={parsedProducts}
        pagination={true}
        progressPending={isLoading}
      />
    </div>
  );
}
