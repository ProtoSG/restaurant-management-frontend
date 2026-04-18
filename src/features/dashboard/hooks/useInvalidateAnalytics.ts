import { useQueryClient } from "react-query";

export function useInvalidateAnalytics() {
  const queryClient = useQueryClient();

  const invalidateAllAnalytics = () => {
    queryClient.invalidateQueries({ queryKey: ['analytics'] });
  };

  const invalidateDashboardOverview = () => {
    queryClient.invalidateQueries({ queryKey: ['analytics', 'dashboard-overview'] });
  };

  const invalidateBalanceIntraday = () => {
    queryClient.invalidateQueries({ queryKey: ['analytics', 'balance-intraday'] });
  };

  const invalidateEarningsSummary = () => {
    queryClient.invalidateQueries({ queryKey: ['analytics', 'earnings-summary'] });
  };

  const invalidateTopProducts = () => {
    queryClient.invalidateQueries({ queryKey: ['analytics', 'top-products'] });
  };

  const invalidateTableTransfers = () => {
    queryClient.invalidateQueries({ queryKey: ['analytics', 'table-transfers'] });
  };

  const invalidateDailySalesByPayment = () => {
    queryClient.invalidateQueries({ queryKey: ['analytics', 'daily-sales-by-payment'] });
  };

  const invalidateWeeklySales = () => {
    queryClient.invalidateQueries({ queryKey: ['analytics', 'weekly-sales'] });
  };

  return {
    invalidateAllAnalytics,
    invalidateDashboardOverview,
    invalidateBalanceIntraday,
    invalidateEarningsSummary,
    invalidateTopProducts,
    invalidateTableTransfers,
    invalidateDailySalesByPayment,
    invalidateWeeklySales
  };
}
