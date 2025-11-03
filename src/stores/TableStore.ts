import { create } from "zustand";
import type { Table } from "../models/Table.model";

interface TableStatus {
  table: Table;
  setTable: (table: Table) => void;

  isEdit: boolean;
  setIsEdit: (isEdit: boolean) => void;
}

export const useTableStore = create<TableStatus>((set) => ({
  table: {} as Table,
  setTable: (table: Table) => set({table}),

  isEdit: false,
  setIsEdit: (isEdit: boolean) => set({isEdit})
}))
