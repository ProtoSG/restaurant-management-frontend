export interface TopProduct {
  id: number;
  name: string;
  category: string;
  sales: number;
  revenue: number;
}

interface Props {
  products: TopProduct[];
}

export function TopProductsCard({ products }: Props) {
  const safeProducts = products ?? [];
  
  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
      <h3 className="text-lg font-bold text-gray-900 mb-4">Productos más vendidos</h3>
      
      {safeProducts.length === 0 ? (
        <p className="text-gray-500 text-center py-4">No hay productos disponibles</p>
      ) : (
        <div className="space-y-4">
          {safeProducts.map((product, index) => (
            <div key={product.id ?? index} className="flex items-center gap-4">
              <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gray-100 text-gray-600 font-semibold text-sm">
                {index + 1}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-gray-900 truncate">{product.name ?? 'Sin nombre'}</p>
                <p className="text-sm text-gray-500">{product.category ?? 'General'}</p>
              </div>
              <div className="text-right">
                <p className="font-semibold text-gray-900">S/ {Number(product.revenue ?? 0).toFixed(2)}</p>
                <p className="text-sm text-gray-500">{Number(product.sales ?? 0)} vendidos</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
