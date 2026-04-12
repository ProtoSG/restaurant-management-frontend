import { useCallback, useState } from "react";
import type { Table } from "../types/Table";

export function useSelectedTable() {
  const [selectedTable, setSelectedTable] = useState<Table | null>(null);

  const selectTable = useCallback((table: Table) => {
    setSelectedTable(table);
  }, []);

  const clearSelection = useCallback(() => {
    setSelectedTable(null);
  }, []);

  return {
    selectedTable,
    selectTable,
    clearSelection,
  };
}
