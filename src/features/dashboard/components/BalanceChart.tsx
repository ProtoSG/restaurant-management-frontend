import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

// Valores que coinciden con los tokens de index.css
const C = {
  green:   '#8a9e6f', // --color-green
  grid:    '#f0f0f0',
  axis:    '#e5e7eb',
  tick:    '#9ca3af',
  white:   '#ffffff',
} as const;

interface BalanceData {
  time: string;
  value: number;
}

interface Props {
  data: BalanceData[];
  rate: number;
  balance: number;
}

export function BalanceChart({ data, rate, balance }: Props) {
  const safeRate = rate ?? 0;
  const safeBalance = balance ?? 0;
  const safeData = data && data.length > 0 ? data : [];
  const isPositive = safeRate >= 0;

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <h3 className="text-lg font-bold text-gray-900">Ventas por día</h3>
          <span className="bg-green/15 text-background text-xs font-semibold px-2 py-1 rounded-full">
            Últimos 30 días
          </span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6 mb-6">
        <div>
          <p className="text-sm text-gray-500 mb-1">vs período anterior</p>
          <div className="flex items-baseline gap-2">
            <p className="text-2xl font-bold text-gray-900">{Math.abs(safeRate).toFixed(1)}%</p>
            <span className={`text-sm font-semibold ${isPositive ? 'text-green' : 'text-red'}`}>
              {isPositive ? '+' : ''}{safeRate.toFixed(1)}%
            </span>
          </div>
        </div>
        <div>
          <p className="text-sm text-gray-500 mb-1">Total (30 días)</p>
          <div className="flex items-baseline gap-2">
            <p className="text-2xl font-bold text-gray-900">S/ {safeBalance.toLocaleString()}</p>
          </div>
        </div>
      </div>

      <div className="h-48">
        {safeData.length === 0 ? (
          <div className="h-full flex items-center justify-center text-gray-400 text-sm">
            Sin ventas en el período
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={safeData}>
              <CartesianGrid strokeDasharray="3 3" stroke={C.grid} />
              <XAxis
                dataKey="time"
                tick={{ fill: C.tick, fontSize: 11 }}
                axisLine={{ stroke: C.axis }}
                interval="preserveStartEnd"
              />
              <YAxis
                tick={{ fill: C.tick, fontSize: 12 }}
                axisLine={{ stroke: C.axis }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: C.white,
                  border: `1px solid ${C.axis}`,
                  borderRadius: '8px',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                }}
                formatter={(value: number | undefined) => value ? [`S/ ${value.toLocaleString()}`, 'Ventas'] : ['S/ 0', 'Ventas']}
              />
              <Line
                type="monotone"
                dataKey="value"
                stroke={C.green}
                strokeWidth={2}
                dot={{ r: 3, fill: C.green }}
              />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}
