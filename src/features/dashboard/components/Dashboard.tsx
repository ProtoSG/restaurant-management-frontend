import { useMemo } from "react";
import {
  StatCard,
  BalanceChart,
  EarningsCard,
  TopProductsCard,
  RecentTransactionsCard,
  ShiftSummaryCard,
} from ".";
import { FiDollarSign, FiShoppingBag, FiTrendingUp, FiActivity } from "react-icons/fi";
import { useAllDashboardData } from "../hooks/useAnalytics";
import { useAuth } from "@/features/auth";
import type { TopProduct } from "./TopProductsCard";
import type { Transaction } from "./RecentTransactionsCard";

function formatCurrency(value: number | undefined): string {
  return `S/ ${(value ?? 0).toFixed(2)}`;
}

function formatSparkline(data: number[] | undefined): Array<{ value: number }> {
  if (!data || !Array.isArray(data)) {
    return [];
  }
  return data.map(val => ({ value: val }));
}

export function Dashboard() {
  const { user } = useAuth();
  const {
    dashboardOverview,
    dailyBalance,
    earningsSummary,
    topProducts,
    tableTransfers,
    weeklySales,
    error
  } = useAllDashboardData();

  const dashboardData = dashboardOverview?.data;
  const dailyBalanceData = dailyBalance?.data;
  const earningsData = earningsSummary?.data;
  const topProductsData = topProducts?.data;
  const transfersData = tableTransfers?.data;
  const weeklyData = weeklySales?.data;

  const defaultSparkline = [
    { value: 400 }, { value: 500 }, { value: 450 }, { value: 600 },
    { value: 550 }, { value: 700 }, { value: 680 }
  ];

  const statCardTrendData = useMemo(() => {
    if (dashboardData?.dailySales?.sparkline && dashboardData.dailySales.sparkline.length > 0) {
      return formatSparkline(dashboardData.dailySales.sparkline);
    }
    return defaultSparkline;
  }, [dashboardData]);

  const occupiedTablesSparkline = useMemo(() => {
    if (dashboardData?.occupiedTables?.sparkline && dashboardData.occupiedTables.sparkline.length > 0) {
      return formatSparkline(dashboardData.occupiedTables.sparkline);
    }
    return [
      { value: 5 }, { value: 7 }, { value: 6 }, { value: 9 },
      { value: 8 }, { value: 10 }, { value: 8 }
    ];
  }, [dashboardData]);

  const profitsSparkline = useMemo(() => {
    if (dashboardData?.profits?.sparkline && dashboardData.profits.sparkline.length > 0) {
      return formatSparkline(dashboardData.profits.sparkline);
    }
    return defaultSparkline;
  }, [dashboardData]);

  const averageTicketSparkline = useMemo(() => {
    if (dashboardData?.averageTicket?.sparkline && dashboardData.averageTicket.sparkline.length > 0) {
      return formatSparkline(dashboardData.averageTicket.sparkline);
    }
    return [
      { value: 300 }, { value: 380 }, { value: 420 }, { value: 460 },
      { value: 490 }, { value: 520 }, { value: 540 }
    ];
  }, [dashboardData]);

  const balanceData = useMemo(() => {
    if (dailyBalanceData?.items && dailyBalanceData.items.length > 0) {
      return dailyBalanceData.items.map(item => ({
        time: item.label,
        value: item.totalSales
      }));
    }
    return [];
  }, [dailyBalanceData]);

  const topProductsList = useMemo((): TopProduct[] => {
    if (topProductsData?.products && topProductsData.products.length > 0) {
      return topProductsData.products.map((p: { productId: number; productName: string; categoryName: string; quantity: number; total: number }) => ({
        id: p.productId,
        name: p.productName,
        category: p.categoryName ?? 'General',
        sales: p.quantity ?? 0,
        revenue: p.total ?? 0
      }));
    }
    return [
      { id: 1, name: "Lomo Saltado", category: "Plato Principal", sales: 45, revenue: 675.00 },
      { id: 2, name: "Ceviche Mixto", category: "Entrada", sales: 38, revenue: 570.00 },
      { id: 3, name: "Ají de Gallina", category: "Plato Principal", sales: 32, revenue: 448.00 },
      { id: 4, name: "Chicharrón", category: "Entrada", sales: 28, revenue: 336.00 },
      { id: 5, name: "Pisco Sour", category: "Bebida", sales: 52, revenue: 364.00 },
    ];
  }, [topProductsData]);

  const recentTransactions = useMemo((): Transaction[] => {
    if (transfersData?.transfers && transfersData.transfers.length > 0) {
      return transfersData.transfers.slice(0, 5).map((t, idx) => ({
        id: idx,
        from: `Mesa ${t.fromTable.tableNumber}`,
        amount: t.orderTotal,
        time: new Date(t.transferDate).toLocaleString('es-PE', {
          hour: '2-digit',
          minute: '2-digit',
          day: 'numeric',
          month: 'numeric'
        }),
        change: 0
      }));
    }
    return [
      { id: 1, from: "Mesa 5", amount: 125.50, time: "Hoy, 14:22", change: 2.45 },
      { id: 2, from: "Mesa 12", amount: -85.00, time: "Hoy, 13:54", change: -4.75 },
      { id: 3, from: "Mesa 3", amount: 210.75, time: "Hoy, 12:18", change: 2.45 },
      { id: 4, from: "Mesa 8", amount: 95.25, time: "Hoy, 11:45", change: 1.20 },
      { id: 5, from: "Delivery #124", amount: 156.00, time: "Hoy, 10:32", change: 3.15 },
    ];
  }, [transfersData]);

  const displayName = user?.username ?? 'Usuario';

  if (error) {
    return (
      <div className="flex-1 overflow-y-auto">
        <div className="mb-5 lg:mb-8">
          <h1 className="text-2xl lg:text-4xl font-bold text-gray-900 mb-1">Hola, {displayName}!</h1>
          <p className="text-gray-600">Explora la información y actividad de tu restaurante</p>
        </div>
        <div className="bg-red/10 border border-red/30 rounded-lg p-4 text-background">
          Error al cargar los datos del dashboard: {error.message}
        </div>
      </div>
    );
  }

  const dailySalesValue = dashboardData?.dailySales?.value ?? 0;
  const dailySalesChange = dashboardData?.dailySales?.changePercentage ?? 0;
  
  const occupiedTablesValue = dashboardData?.occupiedTables?.value ?? 0;
  const totalTables = dashboardData?.occupiedTables?.totalTables ?? 0;
  const occupiedTablesChange = dashboardData?.occupiedTables?.changePercentage ?? 0;
  
  const profitsValue = dashboardData?.profits?.value ?? 0;
  const profitsChange = dashboardData?.profits?.changePercentage ?? 0;
  
  const averageTicketValue = dashboardData?.averageTicket?.value ?? 0;
  const averageTicketChange = dashboardData?.averageTicket?.changePercentage ?? 0;
  
  const balance = dailyBalanceData?.totalBalance ?? 0;
  const rate = dailyBalanceData?.changePercentage ?? 0;
  
  const totalEarnings = earningsData?.currentPeriod?.total ?? weeklyData?.totalSales ?? 0;
  const profitPercentage = earningsData?.profitMargin ?? 100;
  const comparisonText = earningsData?.comparisonMessage
    || (earningsData?.currentPeriod?.trend === 'up'
      ? `Ventas ${Math.abs(earningsData.currentPeriod.changePercentage).toFixed(1)}% más que el período anterior`
      : earningsData?.currentPeriod?.trend === 'down'
      ? `Ventas ${Math.abs(earningsData?.currentPeriod?.changePercentage ?? 0).toFixed(1)}% menos que el período anterior`
      : 'Ventas estables respecto al período anterior');

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="mb-5 lg:mb-8">
        <h1 className="text-2xl lg:text-4xl font-bold text-gray-900 mb-1">Hola, {displayName}!</h1>
        <p className="text-sm lg:text-base text-gray-600">Explora la información y actividad de tu restaurante</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <StatCard
          title="Ventas del día"
          value={formatCurrency(dailySalesValue)}
          icon={<FiDollarSign size={24} />}
          trend={dailySalesChange}
          trendData={statCardTrendData}
        />
        
        <StatCard
          title="Mesas ocupadas"
          value={`${occupiedTablesValue}/${totalTables}`}
          icon={<FiShoppingBag size={24} />}
          trend={occupiedTablesChange}
          trendData={occupiedTablesSparkline}
        />
        
        <StatCard
          title="Ganancias"
          value={formatCurrency(profitsValue)}
          icon={<FiTrendingUp size={24} />}
          trend={profitsChange}
          trendData={profitsSparkline}
        />
        
        <StatCard
          title="Ticket Promedio"
          value={formatCurrency(averageTicketValue)}
          icon={<FiActivity size={24} />}
          trend={averageTicketChange}
          className="lg:col-span-1"
          trendData={averageTicketSparkline}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <div className="lg:col-span-2">
          <BalanceChart
            data={balanceData}
            rate={rate}
            balance={balance}
          />
        </div>

        <div className="lg:col-span-1">
          <EarningsCard
            totalEarnings={totalEarnings}
            profitPercentage={profitPercentage}
            comparisonText={comparisonText}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <TopProductsCard products={topProductsList} />
        </div>

        <div className="lg:col-span-1">
          <RecentTransactionsCard transactions={recentTransactions} />
        </div>

        <div className="lg:col-span-1">
          <ShiftSummaryCard
            userName={displayName}
            role={user?.role}
            dailySales={dailySalesValue}
            occupiedTables={occupiedTablesValue}
            totalTables={totalTables}
          />
        </div>
      </div>
    </div>
  );
}
