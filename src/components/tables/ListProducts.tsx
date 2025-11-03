import { useState, useEffect } from "react";
import { useProductsByCategoryId } from "../../hooks/useProducts"
import { useCategoryStore } from "../../stores/CategoryStore";
import { useTableStore } from "../../stores/TableStore";
import { useAddItemToOrder } from "../../hooks/useTables";
import { GoDotFill } from "react-icons/go";
import { Button } from "../UI";
import { Variant } from "../../enums/VariantEnum";
import { FaSearch } from "react-icons/fa";

export function ListProducts() {
  const { category } = useCategoryStore();
  const { table } = useTableStore();
  const { products, isLoading, error } = useProductsByCategoryId(category?.id || 0);
  const addItemMutation = useAddItemToOrder();

  const [productPrices, setProductPrices] = useState<Record<number, number>>({});

  useEffect(() => {
    const initialPrices: Record<number, number> = {};
    products.forEach(product => {
      initialPrices[product.id] = product.price;
    });
    setProductPrices(initialPrices);
  }, [products]);

  const handlePriceChange = (productId: number, newPrice: string) => {
    const price = parseFloat(newPrice) || 0;
    setProductPrices(prev => ({
      ...prev,
      [productId]: price
    }));
  };

  const handleAddItem = async (productId: number) => {
    if (!table) return;

    try {
      await addItemMutation.mutateAsync({
        tableId: table.id,
        productId,
        quantity: 1
      });
    } catch (error) {
      console.error('Error al agregar item:', error);
    }
  };

  if (isLoading) return <p>Cargando productos...</p>;
  if (error) return <p>Error al cargar los productos</p>

  return (
    <div className="flex flex-col gap-6">
      <label className="flex flex-col gap-2">
        <p>Buscador: </p>
        <div className="flex gap-2 items-center border-2 rounded px-2 py-1">
          <FaSearch />
          <input
            type="text"
            placeholder="trio marino"
            className="w-full focus:outline-none"
          />
        </div>
      </label>
      <ul className="list-disc">
        {products.map((p) => (
          <li
            key={p.id}
            className="flex items-center gap-8 font-semibold"
          >
            <div className="flex items-center gap-2">
              <GoDotFill />
              <p className="text-wrap w-52">{p.name} </p>
            </div>
            <label>
              <span>S/. </span>
              <input 
                type="number" 
                value={productPrices[p.id]?.toFixed(2) || p.price.toFixed(2)} 
                onChange={(e) => handlePriceChange(p.id, e.target.value)}
                className="w-20 text-lg" 
                step="0.01"
                min="0"
              />
            </label>
            <Button 
              variant={Variant.GREEN}
              onClick={() => handleAddItem(p.id)}
              disabled={addItemMutation.isLoading}
            >
              {addItemMutation.isLoading ? 'Agregando...' : 'Agregar'}
            </Button>
          </li>
        ))}
      </ul>
    </div>
  )
}

