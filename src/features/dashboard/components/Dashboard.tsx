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

export function Dashboard() {
  const { user } = useAuth();
  const {
    dashboardOverview,
    dailyBalance,
    earningsSummary,
    topProducts,
    recentPaidOrders,
    weeklySales,
    error
  } = useAllDashboardData();

  const dashboardData = dashboardOverview?.data;
  const dailyBalanceData = dailyBalance?.data;
  const earningsData = earningsSummary?.data;
  const topProductsData = topProducts?.data;
  const paidOrdersData = recentPaidOrders?.data;
  const weeklyData = weeklySales?.data;

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
    if (!topProductsData?.products) return [];
    return topProductsData.products.map((p: { productId: number; productName: string; categoryName: string; quantity: number; total: number }) => ({
      id: p.productId,
      name: p.productName,
      category: p.categoryName ?? 'General',
      sales: p.quantity ?? 0,
      revenue: p.total ?? 0
    }));
  }, [topProductsData]);

  const recentTransactions = useMemo((): Transaction[] => {
    if (paidOrdersData?.orders && paidOrdersData.orders.length > 0) {
      return paidOrdersData.orders.slice(0, 5).map((o, idx) => {
        let label: string;
        if (o.orderType === 'DINE_IN' && o.tableNumber) {
          label = `Mesa ${o.tableNumber}`;
        } else if (o.orderType === 'DELIVERY' && o.customerName) {
          label = `Delivery - ${o.customerName}`;
        } else if (o.customerName) {
          label = o.customerName;
        } else {
          label = o.orderCode;
        }
        return {
          id: o.transactionId ?? idx,
          from: label,
          amount: o.total,
          time: new Date(o.paidAt).toLocaleString('es-PE', {
            hour: '2-digit',
            minute: '2-digit',
            day: 'numeric',
            month: 'numeric'
          }),
          change: 0,
          paymentMethod: o.paymentMethod,
          orderId: o.orderId
        };
      });
    }
    return [];
  }, [paidOrdersData]);

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

  const occupiedTablesValue = dashboardData?.occupiedTables?.value ?? 0;
  const totalTables = dashboardData?.occupiedTables?.totalTables ?? 0;

  const profitsValue = dashboardData?.profits?.value ?? 0;

  const averageTicketValue = dashboardData?.averageTicket?.value ?? 0;

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
    <div className="flex flex-col min-h-full p-6 gap-5 lg:gap-6">
      <div className="shrink-0">
        <h1 className="text-2xl lg:text-4xl font-bold text-gray-900 mb-1">Hola, {displayName}!</h1>
        <p className="text-sm lg:text-base text-gray-600">Explora la información y actividad de tu restaurante</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 shrink-0">
        <StatCard
          title="Ventas del día"
          value={formatCurrency(dailySalesValue)}
          icon={<FiDollarSign size={24} />}
        />
        
        <StatCard
          title="Mesas ocupadas"
          value={`${occupiedTablesValue}/${totalTables}`}
          icon={<FiShoppingBag size={24} />}
        />
        
        <StatCard
          title="Ganancias"
          value={formatCurrency(profitsValue)}
          icon={<FiTrendingUp size={24} />}
        />
        
        <StatCard
          title="Ticket Promedio"
          value={formatCurrency(averageTicketValue)}
          icon={<FiActivity size={24} />}
          className="lg:col-span-1"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 shrink-0">
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 auto-rows-fr">
        <div className="lg:col-span-1 min-h-[20rem]">
          <TopProductsCard products={topProductsList} />
        </div>

        <div className="lg:col-span-1 min-h-[20rem]">
          <RecentTransactionsCard transactions={recentTransactions} />
        </div>

        <div className="lg:col-span-1 min-h-[20rem]">
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
