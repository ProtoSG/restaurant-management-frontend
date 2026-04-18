import z from "zod";
import { OrderType } from "@/shared/enums/OrderType";

export const createOrderRequestSchema = z.object({
  tableId: z.string().optional(),
  type: z.nativeEnum(OrderType, {
    message: "El tipo de orden es obligatorio"
  }),
  customerName: z.string().optional()
});

export type CreateOrderRequest = z.infer<typeof createOrderRequestSchema>;

export type CreateOrderFormData = {
  tableId: string;
  type: OrderType | "";
  customerName: string;
};