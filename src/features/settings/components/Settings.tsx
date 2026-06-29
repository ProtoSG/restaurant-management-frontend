import { useState, useEffect } from "react";
import { FaShoppingBag, FaBolt, FaChevronDown } from "react-icons/fa";
import { MdCheck } from "react-icons/md";
import { useTakeawaySurcharge, useUpdateTakeawaySurcharge } from "@/shared/hooks/useTakeawaySurcharge";
import { useQuickAddProducts, useUpdateQuickAddProducts } from "@/shared/hooks/useQuickAddProducts";
import { useAvailableProducts, useCategories } from "@/features/menu";

interface SettingsSectionProps {
  title: string;
  description: string;
  children: React.ReactNode;
}

function SettingsSection({ title, description, children }: SettingsSectionProps) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-100">
        <h2 className="font-semibold text-gray-900">{title}</h2>
        <p className="text-sm text-gray-400 mt-0.5">{description}</p>
      </div>
      <div className="px-6 py-5 flex flex-col gap-5">{children}</div>
    </div>
  );
}

interface SettingsRowProps {
  icon: React.ReactNode;
  label: string;
  description: string;
  children: React.ReactNode;
}

function SettingsRow({ icon, label, description, children }: SettingsRowProps) {
  return (
    <div className="flex items-start gap-4 flex-wrap sm:flex-nowrap">
      <div className="w-9 h-9 rounded-xl bg-orange/10 flex items-center justify-center text-orange shrink-0 mt-0.5">
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-medium text-sm text-gray-900">{label}</p>
        <p className="text-xs text-gray-400 mt-0.5">{description}</p>
      </div>
      <div className="w-full sm:w-auto flex items-center gap-2 shrink-0">{children}</div>
    </div>
  );
}

interface Category { id: number; name: string; }
interface ProductRow { id: number; name: string; price: number; }

function QuickProductCategories({
  productsByCategory,
  selectedIds,
  onToggle,
}: {
  productsByCategory: { cat: Category; products: ProductRow[] }[];
  selectedIds: number[];
  onToggle: (id: number) => void;
}) {
  const [openIds, setOpenIds] = useState<number[]>([]);

  const toggle = (id: number) =>
    setOpenIds((prev) => prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]);

  return (
    <div className="flex flex-col gap-2">
      {productsByCategory.map(({ cat, products }) => {
        const isOpen = openIds.includes(cat.id);
        const checkedCount = products.filter((p) => selectedIds.includes(p.id)).length;
        return (
          <div key={cat.id} className="rounded-xl border border-gray-100 overflow-hidden">
            <button
              onClick={() => toggle(cat.id)}
              className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors cursor-pointer select-none"
            >
              <FaBolt className="text-orange text-[10px] shrink-0" />
              <span className="flex-1 text-sm font-medium text-gray-700 text-left">{cat.name}</span>
              {checkedCount > 0 && (
                <span className="text-xs font-semibold text-orange bg-orange/10 px-2 py-0.5 rounded-full">
                  {checkedCount}
                </span>
              )}
              <FaChevronDown
                className={`text-gray-400 text-[10px] transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
              />
            </button>

            {isOpen && (
              <div className="border-t border-gray-100">
                {products.map((p, i) => (
                  <label
                    key={p.id}
                    className={`flex items-center gap-3 px-4 py-2.5 cursor-pointer hover:bg-gray-50 transition-colors select-none ${
                      i !== 0 ? "border-t border-gray-100" : ""
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={selectedIds.includes(p.id)}
                      onChange={() => onToggle(p.id)}
                      className="w-4 h-4 accent-orange cursor-pointer"
                    />
                    <span className="flex-1 text-sm text-gray-900">{p.name}</span>
                    <span className="text-xs text-gray-400 tabular-nums">S/ {p.price.toFixed(2)}</span>
                  </label>
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

export function Settings() {
  const currentSurcharge = useTakeawaySurcharge();
  const updateMutation = useUpdateTakeawaySurcharge();

  const [surchargeInput, setSurchargeInput] = useState("");
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setSurchargeInput(currentSurcharge.toFixed(2));
  }, [currentSurcharge]);

  const handleSaveSurcharge = async () => {
    const value = parseFloat(surchargeInput);
    if (isNaN(value) || value < 0) return;
    await updateMutation.mutateAsync(value);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const isDirty = parseFloat(surchargeInput) !== currentSurcharge;

  // QuickAdd
  const savedQuickIds = useQuickAddProducts();
  const updateQuickMutation = useUpdateQuickAddProducts();
  const { products: allProducts } = useAvailableProducts();
  const { categories } = useCategories();
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [quickSaved, setQuickSaved] = useState(false);

  useEffect(() => {
    setSelectedIds(savedQuickIds);
  }, [savedQuickIds]);

  const toggleProduct = (id: number) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
    setQuickSaved(false);
  };

  const handleSaveQuick = async () => {
    await updateQuickMutation.mutateAsync(selectedIds);
    setQuickSaved(true);
    setTimeout(() => setQuickSaved(false), 2000);
  };

  const isQuickDirty = JSON.stringify(selectedIds) !== JSON.stringify(savedQuickIds);

  const productsByCategory = categories
    .map((cat) => ({
      cat,
      products: allProducts.filter((p) => p.categoryId === cat.id),
    }))
    .filter((g) => g.products.length > 0);

  return (
    <div className="flex flex-col gap-6 max-w-2xl p-6">
      <div>
        <h1 className="text-xl font-bold text-gray-900">Configuración</h1>
        <p className="text-sm text-gray-400 mt-1">Ajusta los parámetros del sistema</p>
      </div>

      <SettingsSection
        title="Precios y Recargos"
        description="Configura los recargos que se aplican automáticamente según el tipo de pedido"
      >
        <SettingsRow
          icon={<FaShoppingBag className="text-sm" />}
          label="Recargo por llevar"
          description="Monto adicional por item marcado como para llevar (S/ por unidad)"
        >
          <div className="flex items-center gap-2">
            <div className="flex items-center border-2 border-gray-200 rounded-xl overflow-hidden focus-within:border-orange transition-colors">
              <span className="px-3 text-sm font-medium text-gray-400 border-r border-gray-200 bg-gray-50 h-full flex items-center py-2.5">
                S/
              </span>
              <input
                type="number"
                min="0"
                step="0.50"
                value={surchargeInput}
                onChange={e => { setSurchargeInput(e.target.value); setSaved(false); }}
                onKeyDown={e => e.key === "Enter" && isDirty && handleSaveSurcharge()}
                className="w-24 px-3 py-2.5 text-sm font-semibold text-gray-900 focus:outline-none bg-white"
              />
            </div>
            <button
              onClick={handleSaveSurcharge}
              disabled={!isDirty || updateMutation.isPending}
              className={`flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed ${
                saved ? "bg-green text-white" : "bg-gray-900 text-white hover:bg-gray-700"
              }`}
            >
              {saved ? <><MdCheck className="text-base" />Guardado</> : updateMutation.isPending ? "Guardando..." : "Guardar"}
            </button>
          </div>
        </SettingsRow>
      </SettingsSection>

      <SettingsSection
        title="Acceso Rápido en Pedidos"
        description="Productos que aparecen como atajos al agregar items a un pedido"
      >
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-400">
              {selectedIds.length === 0 ? "Ningún producto seleccionado" : `${selectedIds.length} producto${selectedIds.length > 1 ? "s" : ""} seleccionado${selectedIds.length > 1 ? "s" : ""}`}
            </span>
            <button
              onClick={handleSaveQuick}
              disabled={!isQuickDirty || updateQuickMutation.isPending}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed ${
                quickSaved ? "bg-green text-white" : "bg-gray-900 text-white hover:bg-gray-700"
              }`}
            >
              {quickSaved ? <><MdCheck className="text-base" />Guardado</> : updateQuickMutation.isPending ? "Guardando..." : "Guardar"}
            </button>
          </div>

          <QuickProductCategories
            productsByCategory={productsByCategory}
            selectedIds={selectedIds}
            onToggle={toggleProduct}
          />
        </div>
      </SettingsSection>
    </div>
  );
}
