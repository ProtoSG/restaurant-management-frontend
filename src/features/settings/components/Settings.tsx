import { useState, useEffect } from "react";
import { FaShoppingBag } from "react-icons/fa";
import { MdCheck } from "react-icons/md";
import { useTakeawaySurcharge, useUpdateTakeawaySurcharge } from "@/shared/hooks/useTakeawaySurcharge";

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

  return (
    <div className="flex flex-col gap-6 max-w-2xl">
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
                saved
                  ? "bg-green text-white"
                  : "bg-gray-900 text-white hover:bg-gray-700"
              }`}
            >
              {saved ? (
                <>
                  <MdCheck className="text-base" />
                  Guardado
                </>
              ) : updateMutation.isPending ? (
                "Guardando..."
              ) : (
                "Guardar"
              )}
            </button>
          </div>
        </SettingsRow>
      </SettingsSection>
    </div>
  );
}
