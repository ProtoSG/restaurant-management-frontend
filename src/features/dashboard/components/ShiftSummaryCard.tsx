import type { RoleName } from "@/features/auth/types/Login";

const ROLE_LABELS: Record<RoleName, string> = {
  ADMIN: "Administrador",
  CASHIER: "Cajero",
  WAITER: "Mesero",
  CHEF: "Cocinero",
};

interface Props {
  userName: string;
  role: RoleName | undefined;
  dailySales: number;
  occupiedTables: number;
  totalTables: number;
}

export function ShiftSummaryCard({ userName, role, dailySales, occupiedTables, totalTables }: Props) {
  const initial = userName.charAt(0).toUpperCase();
  const roleLabel = role ? ROLE_LABELS[role] : "—";
  const occupancyPct = totalTables > 0 ? Math.round((occupiedTables / totalTables) * 100) : 0;

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex flex-col gap-6">
      <div className="flex items-center gap-4">
        <div className="w-14 h-14 rounded-full bg-background flex items-center justify-center shrink-0">
          <span className="text-2xl font-bold text-foreground">{initial}</span>
        </div>
        <div className="min-w-0">
          <p className="font-bold text-gray-900 text-lg leading-tight truncate">{userName}</p>
          <span className="inline-block mt-1 text-xs font-semibold px-2.5 py-0.5 rounded-full bg-green/15 text-background">
            {roleLabel}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="bg-gray-50 rounded-xl p-4">
          <p className="text-xs text-gray-500 mb-1">Ventas hoy</p>
          <p className="text-xl font-bold text-gray-900 tabular-nums">
            S/ {dailySales.toFixed(2)}
          </p>
        </div>
        <div className="bg-gray-50 rounded-xl p-4">
          <p className="text-xs text-gray-500 mb-1">Ocupación</p>
          <p className="text-xl font-bold text-gray-900 tabular-nums">
            {occupiedTables}
            <span className="text-sm font-medium text-gray-400">/{totalTables}</span>
          </p>
          <div className="mt-2 h-1.5 rounded-full bg-gray-200">
            <div
              className="h-1.5 rounded-full bg-green transition-all duration-500"
              style={{ width: `${occupancyPct}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
