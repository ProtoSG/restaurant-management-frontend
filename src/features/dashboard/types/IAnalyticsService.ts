import type {
  DashboardOverview,
  BalanceIntraday,
  DailyBalance,
  EarningsSummary,
  TopProductsResponse,
  TableTransfersResponse,
  DailySalesByPayment,
  WeeklySales,
  CategoryProducts,
  RecentPaidOrdersResponse
} from "./Analytics";

export interface IAnalyticsService {
  getDashboardOverview(date?: string): Promise<DashboardOverview>;
  getBalanceIntraday(date?: string): Promise<BalanceIntraday>;
  getDailyBalance(startDate?: string, endDate?: string): Promise<DailyBalance>;
  getEarningsSummary(period: string, date?: string): Promise<EarningsSummary>;
  getTopProducts(limit: number, startDate?: string, endDate?: string): Promise<TopProductsResponse>;
  getTableTransfers(date?: string, limit?: number): Promise<TableTransfersResponse>;
  getDailySalesByPayment(date?: string): Promise<DailySalesByPayment>;
  getWeeklySales(startDate?: string, endDate?: string): Promise<WeeklySales>;
  getTopProductsByCategory(categoryId: number, limit?: number, startDate?: string, endDate?: string): Promise<CategoryProducts>;
  getRecentPaidOrders(date?: string, limit?: number): Promise<RecentPaidOrdersResponse>;
}
