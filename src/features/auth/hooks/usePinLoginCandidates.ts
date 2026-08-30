import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import { AuthServiceImpl } from "../services/AuthServiceImpl";

/** Lista pública de meseros/cajeros con PIN configurado — se muestra antes de cualquier login. */
export function usePinLoginCandidates() {
  const authService = useMemo(() => new AuthServiceImpl(), []);

  const { data, isLoading, error } = useQuery({
    queryKey: ["pin-login-candidates"],
    queryFn: () => authService.getPinLoginCandidates(),
    staleTime: 30 * 1000,
  });

  return { candidates: data ?? [], isLoading, error };
}
