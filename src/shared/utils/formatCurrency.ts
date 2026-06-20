export function formatCurrency(value: number): string {
  return `S/ ${(value ?? 0).toFixed(2)}`;
}
