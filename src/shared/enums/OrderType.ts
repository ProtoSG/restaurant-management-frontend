export enum OrderType {
  DINE_IN = "DINE_IN",
  TAKEAWAY = "TAKEAWAY",
  DELIVERY = "DELIVERY",
}

export const OrderTypeLabels: Record<OrderType, string> = {
  [OrderType.DINE_IN]: "Mesa",
  [OrderType.TAKEAWAY]: "Para Llevar",
  [OrderType.DELIVERY]: "Delivery"
};
