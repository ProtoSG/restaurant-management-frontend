import type { TableStatus } from "../enums/TableStatus";

export interface Table {
  id: number;
  number: string;
  status: TableStatus;
}

export interface TableResponse {
  id: number;
  number: string;
  status: TableStatus;
}
