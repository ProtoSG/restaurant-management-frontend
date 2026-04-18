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

// ─── Dashboard Overview ──────────────────────────────────────────────────────

interface DashboardApiResponse {
  date: string;
  dailySales: {
    amount: number;
    percentageChange: number;
    trend: string;
    sparklineData: number[];
  };
  occupiedTables: {
    occupied: number;
    total: number;
    percentageOccupancy: number;
    sparklineData: number[];
  };
  profits: {
    amount: number;
    percentageChange: number;
    trend: string;
    sparklineData: number[];
  };
  averageTicket: {
    amount: number;
    orderCount: number;
    percentageChange: number;
    trend: string;
    sparklineData: number[];
  };
}

export function DashboardOverviewAdapter(apiData: DashboardApiResponse): DashboardOverview {
  if (!apiData) return getDefaultDashboardOverview();
  return {
    dailySales: {
      value: Number(apiData.dailySales?.amount ?? 0),
      changePercentage: Number(apiData.dailySales?.percentageChange ?? 0),
      trend: (apiData.dailySales?.trend as 'up' | 'down' | 'neutral') ?? 'neutral',
      sparkline: apiData.dailySales?.sparklineData ?? []
    },
    occupiedTables: {
      value: apiData.occupiedTables?.occupied ?? 0,
      totalTables: apiData.occupiedTables?.total ?? 0,
      changePercentage: Number(apiData.occupiedTables?.percentageOccupancy ?? 0),
      trend: 'neutral' as const,
      sparkline: (apiData.occupiedTables?.sparklineData ?? []).map(Number)
    },
    profits: {
      value: Number(apiData.profits?.amount ?? 0),
      changePercentage: Number(apiData.profits?.percentageChange ?? 0),
      trend: (apiData.profits?.trend as 'up' | 'down' | 'neutral') ?? 'neutral',
      sparkline: apiData.profits?.sparklineData ?? []
    },
    averageTicket: {
      value: Number(apiData.averageTicket?.amount ?? 0),
      changePercentage: Number(apiData.averageTicket?.percentageChange ?? 0),
      trend: (apiData.averageTicket?.trend as 'up' | 'down' | 'neutral') ?? 'neutral',
      sparkline: apiData.averageTicket?.sparklineData ?? []
    }
  };
}

function getDefaultDashboardOverview(): DashboardOverview {
  return {
    dailySales: { value: 0, changePercentage: 0, trend: 'neutral', sparkline: [] },
    occupiedTables: { value: 0, totalTables: 0, changePercentage: 0, trend: 'neutral', sparkline: [] },
    profits: { value: 0, changePercentage: 0, trend: 'neutral', sparkline: [] },
    averageTicket: { value: 0, changePercentage: 0, trend: 'neutral', sparkline: [] }
  };
}

// ─── Balance Intraday ────────────────────────────────────────────────────────
// Backend fields: hour (e.g. "9am"), time (e.g. "09:00"),
//                 sales, cumulativeBalance, orderCount, conversionRate

interface BalanceIntradayApiResponse {
  date?: string;
  summary?: {
    rate?: number;
    rateChange?: number;
    balance?: number;
    balanceChange?: number;
    status?: string;
  };
  hourlyData?: {
    hour: string;
    time: string;
    sales: number;
    cumulativeBalance: number;
    orderCount: number;
    conversionRate: number;
  }[];
}

export function BalanceIntradayAdapter(apiData: BalanceIntradayApiResponse): BalanceIntraday {
  if (!apiData) return getDefaultBalanceIntraday();
  return {
    totalBalance: Number(apiData.summary?.balance ?? 0),
    conversionRate: Number(apiData.summary?.rate ?? 0),
    hourlyData: (apiData.hourlyData ?? []).map(item => ({
      time: item.time ?? item.hour ?? '',
      balance: Number(item.cumulativeBalance ?? 0),
      rate: Number(item.conversionRate ?? 0)
    }))
  };
}

function getDefaultBalanceIntraday(): BalanceIntraday {
  return { totalBalance: 0, conversionRate: 0, hourlyData: [] };
}

// ─── Earnings Summary ────────────────────────────────────────────────────────
// Backend fields: currentPeriod.totalRevenue, totalOrders, averageTicket
//                 comparison.revenueChange, ordersChange, ticketChange, message

interface EarningsApiResponse {
  period?: string;
  currentPeriod?: {
    totalRevenue?: number;
    totalOrders?: number;
    averageTicket?: number;
  };
  previousPeriod?: {
    totalRevenue?: number;
    totalOrders?: number;
    averageTicket?: number;
  };
  comparison?: {
    revenueChange?: number;
    ordersChange?: number;
    ticketChange?: number;
    message?: string;
  };
  profitMargin?: number;
  note?: string;
}

function toTrend(change: number | undefined): 'up' | 'down' | 'neutral' {
  if (change == null) return 'neutral';
  if (change > 0) return 'up';
  if (change < 0) return 'down';
  return 'neutral';
}

export function EarningsSummaryAdapter(apiData: EarningsApiResponse): EarningsSummary {
  if (!apiData) return getDefaultEarningsSummary();
  const revenueChange = Number(apiData.comparison?.revenueChange ?? 0);
  return {
    currentPeriod: {
      total: Number(apiData.currentPeriod?.totalRevenue ?? 0),
      count: apiData.currentPeriod?.totalOrders ?? 0,
      average: Number(apiData.currentPeriod?.averageTicket ?? 0),
      changePercentage: revenueChange,
      trend: toTrend(revenueChange)
    },
    previousPeriod: {
      total: Number(apiData.previousPeriod?.totalRevenue ?? 0),
      count: apiData.previousPeriod?.totalOrders ?? 0,
      average: Number(apiData.previousPeriod?.averageTicket ?? 0),
      changePercentage: 0,
      trend: 'neutral' as const
    },
    profitMargin: apiData.profitMargin ?? 100,
    comparisonMessage: apiData.comparison?.message ?? ''
  };
}

function getDefaultEarningsSummary(): EarningsSummary {
  return {
    currentPeriod: { total: 0, count: 0, average: 0, changePercentage: 0, trend: 'neutral' },
    previousPeriod: { total: 0, count: 0, average: 0, changePercentage: 0, trend: 'neutral' },
    profitMargin: 100,
    comparisonMessage: ''
  };
}

// ─── Top Products ────────────────────────────────────────────────────────────
// Backend fields: products[].productId, productName, categoryName,
//                 quantitySold, totalRevenue, averagePrice, rank

interface TopProductsApiResponse {
  period?: {
    startDate?: string;
    endDate?: string;
  };
  totalProducts?: number;
  products?: {
    rank: number;
    productId: number;
    productName: string;
    categoryName: string;
    quantitySold: number;
    totalRevenue: number;
    averagePrice: number;
  }[];
}

export function TopProductsAdapter(apiData: TopProductsApiResponse): TopProductsResponse {
  if (!apiData) return getDefaultTopProducts();
  return {
    products: (apiData.products ?? []).map(p => ({
      productId: p.productId ?? 0,
      productName: p.productName ?? '',
      categoryName: p.categoryName ?? '',
      quantity: Number(p.quantitySold ?? 0),
      total: Number(p.totalRevenue ?? 0)
    })),
    periodStart: apiData.period?.startDate ?? '',
    periodEnd: apiData.period?.endDate ?? ''
  };
}

function getDefaultTopProducts(): TopProductsResponse {
  return { products: [], periodStart: '', periodEnd: '' };
}

// ─── Table Transfers ─────────────────────────────────────────────────────────
// Backend fields: fromTable.number (String), orderAmount, user.name

interface TableTransfersApiResponse {
  date?: string;
  totalTransfers?: number;
  transfers?: {
    id: number;
    orderId: number;
    orderCode: string;
    fromTable: {
      id: number;
      number: string;
    };
    toTable: {
      id: number;
      number: string;
    };
    transferDate: string;
    orderAmount: number;
    user?: {
      id: number;
      name: string;
    };
  }[];
}

export function TableTransfersAdapter(apiData: TableTransfersApiResponse): TableTransfersResponse {
  if (!apiData) return getDefaultTableTransfers();
  return {
    transfers: (apiData.transfers ?? []).map(t => ({
      orderId: t.orderId ?? 0,
      orderCode: t.orderCode ?? '',
      fromTable: {
        id: t.fromTable?.id ?? 0,
        tableNumber: Number(t.fromTable?.number ?? 0)
      },
      toTable: {
        id: t.toTable?.id ?? 0,
        tableNumber: Number(t.toTable?.number ?? 0)
      },
      user: {
        id: t.user?.id ?? 0,
        name: t.user?.name ?? ''
      },
      transferDate: t.transferDate ?? '',
      orderTotal: Number(t.orderAmount ?? 0)
    }))
  };
}

function getDefaultTableTransfers(): TableTransfersResponse {
  return { transfers: [] };
}

// ─── Daily Sales By Payment ──────────────────────────────────────────────────
// Backend fields: paymentMethods[].method, amount, transactionCount, percentage

interface DailySalesByPaymentApiResponse {
  date?: string;
  totalSales?: number;
  totalTransactions?: number;
  paymentMethods?: {
    method: string;
    amount: number;
    transactionCount: number;
    percentage: number;
  }[];
}

export function DailySalesByPaymentAdapter(apiData: DailySalesByPaymentApiResponse): DailySalesByPayment {
  if (!apiData) return getDefaultDailySalesByPayment();
  return {
    date: apiData.date ?? '',
    payments: (apiData.paymentMethods ?? []).map(p => ({
      method: p.method ?? '',
      count: p.transactionCount ?? 0,
      total: Number(p.amount ?? 0),
      percentage: Number(p.percentage ?? 0)
    }))
  };
}

function getDefaultDailySalesByPayment(): DailySalesByPayment {
  return { date: '', payments: [] };
}

// ─── Weekly Sales ────────────────────────────────────────────────────────────
// Backend fields: currentWeek.totalSales, totalOrders, averageDailySales
//                 dailyBreakdown[].date, sales, transactions, percentageChange
//                 comparison.salesChange, ordersChange

interface WeeklySalesApiResponse {
  startDate?: string;
  endDate?: string;
  currentWeek?: {
    totalSales?: number;
    totalOrders?: number;
    averageDailySales?: number;
    dailyBreakdown?: {
      date: string;
      dayOfWeek: string;
      sales: number;
      transactions: number;
      percentageChange: number;
    }[];
  };
  previousWeek?: {
    totalSales?: number;
    totalOrders?: number;
    averageDailySales?: number;
  };
  comparison?: {
    salesChange?: number;
    ordersChange?: number;
  };
}

export function WeeklySalesAdapter(apiData: WeeklySalesApiResponse): WeeklySales {
  if (!apiData) return getDefaultWeeklySales();
  const salesChange = Number(apiData.comparison?.salesChange ?? 0);
  return {
    totalSales: Number(apiData.currentWeek?.totalSales ?? 0),
    comparisonPercentage: salesChange,
    trend: toTrend(salesChange),
    dailyBreakdown: (apiData.currentWeek?.dailyBreakdown ?? []).map(d => ({
      date: d.date ?? '',
      totalSales: Number(d.sales ?? 0),
      transactionCount: d.transactions ?? 0
    }))
  };
}

function getDefaultWeeklySales(): WeeklySales {
  return { totalSales: 0, comparisonPercentage: 0, trend: 'neutral', dailyBreakdown: [] };
}

// ─── Daily Balance ───────────────────────────────────────────────────────────

interface DailyBalanceApiResponse {
  startDate?: string;
  endDate?: string;
  totalBalance?: number;
  changePercentage?: number;
  items?: {
    date: string;
    label: string;
    totalSales: number;
  }[];
}

export function DailyBalanceAdapter(apiData: DailyBalanceApiResponse): DailyBalance {
  if (!apiData) return getDefaultDailyBalance();
  return {
    startDate: apiData.startDate ?? '',
    endDate: apiData.endDate ?? '',
    totalBalance: Number(apiData.totalBalance ?? 0),
    changePercentage: Number(apiData.changePercentage ?? 0),
    items: (apiData.items ?? []).map(item => ({
      date: item.date ?? '',
      label: item.label ?? '',
      totalSales: Number(item.totalSales ?? 0)
    }))
  };
}

function getDefaultDailyBalance(): DailyBalance {
  return { startDate: '', endDate: '', totalBalance: 0, changePercentage: 0, items: [] };
}

// ─── Category Products ───────────────────────────────────────────────────────

interface CategoryProductsApiResponse {
  categoryId?: number;
  categoryName?: string;
  products?: {
    productId: number;
    productName: string;
    categoryName: string;
    quantitySold: number;
    totalRevenue: number;
  }[];
}

export function CategoryProductsAdapter(apiData: CategoryProductsApiResponse): CategoryProducts {
  if (!apiData) return getDefaultCategoryProducts();
  return {
    categoryId: apiData.categoryId ?? 0,
    categoryName: apiData.categoryName ?? '',
    products: (apiData.products ?? []).map(p => ({
      productId: p.productId ?? 0,
      productName: p.productName ?? '',
      categoryName: p.categoryName ?? '',
      quantity: Number(p.quantitySold ?? 0),
      total: Number(p.totalRevenue ?? 0)
    }))
  };
}

function getDefaultCategoryProducts(): CategoryProducts {
  return { categoryId: 0, categoryName: '', products: [] };
}

// ─── Recent Paid Orders ──────────────────────────────────────────────────────

interface RecentPaidOrdersApiResponse {
  date?: string;
  totalTransactions?: number;
  orders?: {
    transactionId: number;
    orderId: number;
    orderCode: string;
    tableNumber: string | null;
    customerName: string | null;
    orderType: string;
    total: number;
    paymentMethod: string;
    paidAt: string;
    cashierName: string;
  }[];
}

export function RecentPaidOrdersAdapter(apiData: RecentPaidOrdersApiResponse): RecentPaidOrdersResponse {
  if (!apiData) return getDefaultRecentPaidOrders();
  return {
    date: apiData.date ?? '',
    totalTransactions: apiData.totalTransactions ?? 0,
    orders: (apiData.orders ?? []).map(o => ({
      transactionId: o.transactionId ?? 0,
      orderId: o.orderId ?? 0,
      orderCode: o.orderCode ?? '',
      tableNumber: o.tableNumber ?? null,
      customerName: o.customerName ?? null,
      orderType: o.orderType ?? 'DINE_IN',
      total: Number(o.total ?? 0),
      paymentMethod: o.paymentMethod ?? '',
      paidAt: o.paidAt ?? '',
      cashierName: o.cashierName ?? ''
    }))
  };
}

function getDefaultRecentPaidOrders(): RecentPaidOrdersResponse {
  return { date: '', totalTransactions: 0, orders: [] };
}
