import { useQuery } from "react-query";
import { AnalyticsServiceImpl } from "../services/AnalyticsServiceImpl";
import type {
  DashboardOverview,
  BalanceIntraday,
  DailyBalance,
  EarningsSummary,
  TopProductsResponse,
  TableTransfersResponse,
  DailySalesByPayment,
  WeeklySales,
  CategoryProducts
} from "../types/Analytics";

const analyticsService = new AnalyticsServiceImpl();

function toLocalDateString(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function getTodayDate(): string {
  return toLocalDateString(new Date());
}

function getWeekDates(): { startDate: string; endDate: string } {
  const today = new Date();
  const startDate = new Date(today);
  startDate.setDate(startDate.getDate() - 6);
  return {
    startDate: toLocalDateString(startDate),
    endDate: toLocalDateString(today)
  };
}

function getMonthDates(): { startDate: string; endDate: string } {
  const today = new Date();
  const startDate = new Date(today);
  startDate.setDate(startDate.getDate() - 29);
  return {
    startDate: toLocalDateString(startDate),
    endDate: toLocalDateString(today)
  };
}

export function useDashboardOverview(date?: string) {
  const queryDate = date || getTodayDate();
  
  return useQuery<DashboardOverview, Error>({
    queryKey: ['analytics', 'dashboard-overview', queryDate],
    queryFn: () => analyticsService.getDashboardOverview(queryDate),
    staleTime: 30000,
    refetchInterval: 30000
  });
}

export function useBalanceIntraday(date?: string) {
  const queryDate = date || getTodayDate();
  
  return useQuery<BalanceIntraday, Error>({
    queryKey: ['analytics', 'balance-intraday', queryDate],
    queryFn: () => analyticsService.getBalanceIntraday(queryDate),
    staleTime: 30000,
    refetchInterval: 30000
  });
}

export function useEarningsSummary(period: string = 'daily', date?: string) {
  const queryDate = date || getTodayDate();
  
  return useQuery<EarningsSummary, Error>({
    queryKey: ['analytics', 'earnings-summary', period, queryDate],
    queryFn: () => analyticsService.getEarningsSummary(period, queryDate),
    staleTime: 60000
  });
}

export function useTopProducts(limit: number = 5) {
  const { startDate, endDate } = getWeekDates();
  
  return useQuery<TopProductsResponse, Error>({
    queryKey: ['analytics', 'top-products', limit, startDate, endDate],
    queryFn: () => analyticsService.getTopProducts(limit, startDate, endDate),
    staleTime: 60000
  });
}

export function useTableTransfers(date?: string, limit: number = 10) {
  const queryDate = date || getTodayDate();
  
  return useQuery<TableTransfersResponse, Error>({
    queryKey: ['analytics', 'table-transfers', queryDate, limit],
    queryFn: () => analyticsService.getTableTransfers(queryDate, limit),
    staleTime: 30000
  });
}

export function useDailySalesByPayment(date?: string) {
  const queryDate = date || getTodayDate();
  
  return useQuery<DailySalesByPayment, Error>({
    queryKey: ['analytics', 'daily-sales-by-payment', queryDate],
    queryFn: () => analyticsService.getDailySalesByPayment(queryDate),
    staleTime: 30000
  });
}

export function useWeeklySales() {
  const { startDate, endDate } = getWeekDates();
  
  return useQuery<WeeklySales, Error>({
    queryKey: ['analytics', 'weekly-sales', startDate, endDate],
    queryFn: () => analyticsService.getWeeklySales(startDate, endDate),
    staleTime: 60000
  });
}

export function useDailyBalance(startDate?: string, endDate?: string) {
  const { startDate: defaultStart, endDate: defaultEnd } = getMonthDates();
  const start = startDate || defaultStart;
  const end = endDate || defaultEnd;

  return useQuery<DailyBalance, Error>({
    queryKey: ['analytics', 'daily-balance', start, end],
    queryFn: () => analyticsService.getDailyBalance(start, end),
    staleTime: 60000
  });
}

export function useTopProductsByCategory(categoryId: number, limit: number = 5) {
  const { startDate, endDate } = getWeekDates();
  
  return useQuery<CategoryProducts, Error>({
    queryKey: ['analytics', 'top-products-by-category', categoryId, limit, startDate, endDate],
    queryFn: () => analyticsService.getTopProductsByCategory(categoryId, limit, startDate, endDate),
    staleTime: 60000,
    enabled: !!categoryId
  });
}

export function useAllDashboardData() {
  const today = getTodayDate();

  const dashboardOverview = useDashboardOverview(today);
  const dailyBalance = useDailyBalance();
  const earningsSummary = useEarningsSummary('daily', today);
  const topProducts = useTopProducts(5);
  const tableTransfers = useTableTransfers(today, 10);
  const dailySalesByPayment = useDailySalesByPayment(today);
  const weeklySales = useWeeklySales();

  const hasAnyError =
    dashboardOverview.error ||
    dailyBalance.error ||
    earningsSummary.error ||
    topProducts.error ||
    tableTransfers.error ||
    dailySalesByPayment.error ||
    weeklySales.error;

  const hasData =
    dashboardOverview.data ||
    dailyBalance.data ||
    earningsSummary.data ||
    topProducts.data ||
    tableTransfers.data ||
    dailySalesByPayment.data ||
    weeklySales.data;

  const isLoading =
    dashboardOverview.isLoading ||
    dailyBalance.isLoading ||
    earningsSummary.isLoading ||
    topProducts.isLoading ||
    tableTransfers.isLoading ||
    dailySalesByPayment.isLoading ||
    weeklySales.isLoading;

  return {
    dashboardOverview,
    dailyBalance,
    earningsSummary,
    topProducts,
    tableTransfers,
    dailySalesByPayment,
    weeklySales,
    isLoading,
    error: hasAnyError && hasData ? hasAnyError : null
  };
}
