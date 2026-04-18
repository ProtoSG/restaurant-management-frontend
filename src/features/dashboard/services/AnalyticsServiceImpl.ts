import type { AxiosInstance } from "axios";
import defaultApiClient from "@/shared/utils/apiClient";
import type { IAnalyticsService } from "../types/IAnalyticsService";
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
} from "../types/Analytics";
import {
  DashboardOverviewAdapter,
  BalanceIntradayAdapter,
  DailyBalanceAdapter,
  EarningsSummaryAdapter,
  TopProductsAdapter,
  TableTransfersAdapter,
  DailySalesByPaymentAdapter,
  WeeklySalesAdapter,
  CategoryProductsAdapter,
  RecentPaidOrdersAdapter
} from "../adapters/AnalyticsAdapter";

export class AnalyticsServiceImpl implements IAnalyticsService {
  constructor(
    private readonly apiClient: AxiosInstance = defaultApiClient
  ) {}

  async getDashboardOverview(date?: string): Promise<DashboardOverview> {
    const params = date ? { date } : {};
    const { data } = await this.apiClient.get('/analytics/dashboard-overview', { params });
    return DashboardOverviewAdapter(data);
  }

  async getBalanceIntraday(date?: string): Promise<BalanceIntraday> {
    const params = date ? { date } : {};
    const { data } = await this.apiClient.get('/analytics/balance-intraday', { params });
    return BalanceIntradayAdapter(data);
  }

  async getDailyBalance(startDate?: string, endDate?: string): Promise<DailyBalance> {
    const params: Record<string, string> = {};
    if (startDate) params.startDate = startDate;
    if (endDate) params.endDate = endDate;
    const { data } = await this.apiClient.get('/analytics/balance-daily', { params });
    return DailyBalanceAdapter(data);
  }

  async getEarningsSummary(period: string, date?: string): Promise<EarningsSummary> {
    const params: Record<string, string> = { period };
    if (date) params.date = date;
    const { data } = await this.apiClient.get('/analytics/earnings-summary', { params });
    return EarningsSummaryAdapter(data);
  }

  async getTopProducts(limit: number, startDate?: string, endDate?: string): Promise<TopProductsResponse> {
    const params: Record<string, string | number> = { limit };
    if (startDate) params.startDate = startDate;
    if (endDate) params.endDate = endDate;
    const { data } = await this.apiClient.get('/analytics/products/top-with-period', { params });
    return TopProductsAdapter(data);
  }

  async getTableTransfers(date?: string, limit?: number): Promise<TableTransfersResponse> {
    const params: Record<string, string | number> = {};
    if (date) params.date = date;
    if (limit) params.limit = limit;
    const { data } = await this.apiClient.get('/analytics/table-transfers', { params });
    return TableTransfersAdapter(data);
  }

  async getDailySalesByPayment(date?: string): Promise<DailySalesByPayment> {
    const params = date ? { date } : {};
    const { data } = await this.apiClient.get('/analytics/daily-sales-by-payment', { params });
    return DailySalesByPaymentAdapter(data);
  }

  async getWeeklySales(startDate?: string, endDate?: string): Promise<WeeklySales> {
    const params: Record<string, string> = {};
    if (startDate) params.startDate = startDate;
    if (endDate) params.endDate = endDate;
    const { data } = await this.apiClient.get('/analytics/weekly-sales', { params });
    return WeeklySalesAdapter(data);
  }

  async getTopProductsByCategory(categoryId: number, limit?: number, startDate?: string, endDate?: string): Promise<CategoryProducts> {
    const params: Record<string, string | number> = { categoryId };
    if (limit) params.limit = limit;
    if (startDate) params.startDate = startDate;
    if (endDate) params.endDate = endDate;
    const { data } = await this.apiClient.get('/analytics/products/top-by-category', { params });
    return CategoryProductsAdapter(data);
  }

  async getRecentPaidOrders(date?: string, limit?: number): Promise<RecentPaidOrdersResponse> {
    const params: Record<string, string | number> = {};
    if (date) params.date = date;
    if (limit) params.limit = limit;
    const { data } = await this.apiClient.get('/analytics/recent-paid-orders', { params });
    return RecentPaidOrdersAdapter(data);
  }
}
