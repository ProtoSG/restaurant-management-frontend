import type { ReactNode } from "react";

interface Props {
  title: string;
  value: string;
  icon: ReactNode;
  trend?: number;
  trendData?: Array<{ value: number }>;
  bgColor?: string;
  className?: string;
}

function Sparkline({ data, positive }: { data: Array<{ value: number }>; positive: boolean }) {
  if (data.length < 2) return null;

  const values = data.map(d => d.value);
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;

  const W = 100;
  const H = 32;
  const step = W / (data.length - 1);

  const points = values
    .map((v, i) => `${i * step},${H - ((v - min) / range) * H}`)
    .join(" ");

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      preserveAspectRatio="none"
      className="w-full h-full"
      aria-hidden="true"
    >
      <polyline
        points={points}
        fill="none"
        stroke={positive ? "var(--color-green)" : "var(--color-red)"}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function StatCard({ title, value, icon, trend, trendData, bgColor = "bg-white", className = "" }: Props) {
  const isPositive = (trend ?? 0) > 0;
  const safeTrendData = trendData && trendData.length > 0 ? trendData : [];

  return (
    <div className={`${bgColor} rounded-2xl p-6 shadow-sm border border-gray-100 ${className}`}>
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <p className="text-sm text-gray-600 mb-1">{title ?? ''}</p>
          <p className="text-3xl font-bold text-gray-900">{value ?? 'S/ 0.00'}</p>
          {trend !== undefined && (
            <div className="flex items-center gap-1 mt-2">
              <span className={`text-sm font-semibold ${isPositive ? 'text-green' : 'text-red'}`}>
                {isPositive ? '+' : ''}{Number(trend).toFixed(2)}%
              </span>
            </div>
          )}
        </div>
        <div className="text-gray-500 bg-gray-50 p-3 rounded-xl">
          {icon}
        </div>
      </div>
      {safeTrendData.length > 0 && (
        <div className="h-8 -mb-2">
          <Sparkline data={safeTrendData} positive={isPositive} />
        </div>
      )}
    </div>
  );
}
