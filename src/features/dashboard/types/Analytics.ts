export interface DailySalesMetric {
  value: number;
  changePercentage: number;
  trend: 'up' | 'down' | 'neutral';
  sparkline: number[];
}

export interface OccupiedTablesMetric {
  value: number;
  totalTables: number;
  changePercentage: number;
  trend: 'up' | 'down' | 'neutral';
  sparkline: number[];
}

export interface ProfitsMetric {
  value: number;
  changePercentage: number;
  trend: 'up' | 'down' | 'neutral';
  sparkline: number[];
}

export interface AverageTicketMetric {
  value: number;
  changePercentage: number;
  trend: 'up' | 'down' | 'neutral';
  sparkline: number[];
}

export interface DashboardOverview {
  dailySales: DailySalesMetric;
  occupiedTables: OccupiedTablesMetric;
  profits: ProfitsMetric;
  averageTicket: AverageTicketMetric;
}

export interface HourlyBalance {
  time: string;
  balance: number;
  rate: number;
}

export interface BalanceIntraday {
  totalBalance: number;
  conversionRate: number;
  hourlyData: HourlyBalance[];
}

export interface PeriodSummary {
  total: number;
  count: number;
  average: number;
  changePercentage: number;
  trend: 'up' | 'down' | 'neutral';
}

export interface EarningsSummary {
  currentPeriod: PeriodSummary;
  previousPeriod: PeriodSummary;
  profitMargin: number;
  comparisonMessage: string;
}

export interface ProductRanking {
  productId: number;
  productName: string;
  categoryName: string;
  quantity: number;
  total: number;
}

export interface TopProductsResponse {
  products: ProductRanking[];
  periodStart: string;
  periodEnd: string;
}

export interface TransferTableInfo {
  id: number;
  tableNumber: number;
}

export interface TransferUserInfo {
  id: number;
  name: string;
}

export interface TableTransfer {
  orderId: number;
  orderCode: string;
  fromTable: TransferTableInfo;
  toTable: TransferTableInfo;
  user: TransferUserInfo;
  transferDate: string;
  orderTotal: number;
}

export interface TableTransfersResponse {
  transfers: TableTransfer[];
}

export interface PaymentMethodBreakdown {
  method: string;
  count: number;
  total: number;
  percentage: number;
}

export interface DailySalesByPayment {
  date: string;
  payments: PaymentMethodBreakdown[];
}

export interface DailyBreakdown {
  date: string;
  totalSales: number;
  transactionCount: number;
}

export interface WeeklySales {
  totalSales: number;
  comparisonPercentage: number;
  trend: 'up' | 'down' | 'neutral';
  dailyBreakdown: DailyBreakdown[];
}

export interface DailyBalanceItem {
  date: string;
  label: string;
  totalSales: number;
}

export interface DailyBalance {
  startDate: string;
  endDate: string;
  totalBalance: number;
  changePercentage: number;
  items: DailyBalanceItem[];
}

export interface CategoryProducts {
  categoryId: number;
  categoryName: string;
  products: ProductRanking[];
}
