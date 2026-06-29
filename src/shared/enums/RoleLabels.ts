import type { RoleName } from "@/features/auth/types/Login";

export const ROLE_LABELS: Record<RoleName, string> = {
  ADMIN:   "Administrador",
  CASHIER: "Cajero",
  WAITER:  "Mesero",
  CHEF:    "Cocinero",
};

export const ROLE_COLORS: Record<RoleName, string> = {
  ADMIN:   "bg-red/20 text-red border border-red/30",
  CASHIER: "bg-orange/20 text-orange border border-orange/30",
  WAITER:  "bg-green/20 text-green border border-green/30",
  CHEF:    "bg-blue-500/20 text-blue-300 border border-blue-400/30",
};
