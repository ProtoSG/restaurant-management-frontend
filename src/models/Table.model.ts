import z from "zod";
import type { TableStatus } from "../enums/Table.enum";

export interface TableResponse {
  id: number;
  number: string;
  status: TableStatus;
}

export interface Table {
  id: number;
  number: string;
  status: TableStatus;
}

const baseTableSchema = z.object({
  number: z.string().min(1, "El numero de la mesa es obligatoria")
})

export const createTableRequestSchema = baseTableSchema.extend({})

export const updateTableRequestSchema = baseTableSchema.extend({})

export type CreateTableRequest = z.infer<typeof createTableRequestSchema>
export type UpdateTableRequest = z.infer<typeof createTableRequestSchema>
