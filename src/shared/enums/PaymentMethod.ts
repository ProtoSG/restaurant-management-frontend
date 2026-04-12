export enum PaymentMethod {
  CASH = "CASH",
  YAPE = "YAPE",
  CREDITCARD = "CREDITCARD"
}

export const PaymentMethodLabels: Record<PaymentMethod, string> = {
  [PaymentMethod.CASH]: "Efectivo",
  [PaymentMethod.YAPE]: "Yape",
  [PaymentMethod.CREDITCARD]: "Tarjeta de Crédito"
};
