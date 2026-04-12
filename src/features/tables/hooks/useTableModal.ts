import { useCallback, useState } from "react";
import type { Table } from "../types/Table";

export function useTableModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [selectedTable, setSelectedTable] = useState<Table | null>(null);

  const openCreate = useCallback(() => {
    setSelectedTable(null);
    setIsEdit(false);
    setIsOpen(true);
  }, []);

  const openEdit = useCallback((table: Table) => {
    setSelectedTable(table);
    setIsEdit(true);
    setIsOpen(true);
  }, []);

  const close = useCallback(() => {
    setIsOpen(false);
    setIsEdit(false);
    setSelectedTable(null);
  }, []);

  return {
    isOpen,
    isEdit,
    selectedTable,
    openCreate,
    openEdit,
    close,
  };
}
