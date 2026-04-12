export enum OrderStatus {
  CREATED = "CREATED",
  IN_PROGRESS = "IN_PROGRESS",
  READY = "READY",
  PARTIALLY_PAID = "PARTIALLY_PAID",
  PAID = "PAID",
  CANCELLED = "CANCELLED"
}

export const OrderStatusLabels: Record<OrderStatus, string> = {
  [OrderStatus.CREATED]: "Creado",
  [OrderStatus.IN_PROGRESS]: "En Progreso",
  [OrderStatus.READY]: "Listo",
  [OrderStatus.PARTIALLY_PAID]: "Parcialmente Pagado",
  [OrderStatus.PAID]: "Pagado",
  [OrderStatus.CANCELLED]: "Cancelado"
};
