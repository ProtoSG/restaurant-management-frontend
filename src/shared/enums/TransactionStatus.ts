export enum TransactionStatus {
  PENDING = "PENDING",
  COMPLETED = "COMPLETED",
  FAILED = "FAILED"
}

export const TransactionStatusLabels: Record<TransactionStatus, string> = {
  [TransactionStatus.PENDING]: "Pendiente",
  [TransactionStatus.COMPLETED]: "Completado",
  [TransactionStatus.FAILED]: "Fallido"
};
