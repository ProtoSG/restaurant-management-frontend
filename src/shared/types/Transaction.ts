import type { PaymentMethod } from "../enums/PaymentMethod";
import type { TransactionStatus } from "../enums/TransactionStatus";

export interface Transaction {
  id: number;
  orderId?: number;
  userId?: number;
  userName?: string;
  total: number;
  paymentMethod: PaymentMethod;
  status: TransactionStatus;
  transactionDate: string;
}

export interface TransactionResponse {
  id: number;
  orderId?: number;
  userId?: number;
  userName?: string;
  total: number;
  paymentMethod: PaymentMethod;
  status: TransactionStatus;
  transactionDate: string;
}
