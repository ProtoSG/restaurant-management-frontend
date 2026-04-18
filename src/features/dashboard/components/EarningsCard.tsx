import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";

interface Props {
  totalEarnings: number;
  profitPercentage: number;
  comparisonText: string;
}

export function EarningsCard({ totalEarnings, profitPercentage, comparisonText }: Props) {
  const safeTotalEarnings = totalEarnings ?? 0;
  const safeProfitPercentage = profitPercentage ?? 0;
  const safeComparisonText = comparisonText ?? '';
  
  const data = [
    { name: 'Completed', value: safeProfitPercentage },
    { name: 'Remaining', value: 100 - safeProfitPercentage }
  ];

  const COLORS = ['#8a9e6f' /* --color-green */, '#e5e7eb' /* gray-200 */];

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
      <h3 className="text-lg font-bold text-gray-900 mb-4">Rentabilidad</h3>

      <div className="mb-2">
        <p className="text-sm text-gray-500 mb-1">Ventas del período</p>
        <p className="text-3xl font-bold text-gray-900">${safeTotalEarnings.toLocaleString()}</p>
      </div>
      
      <p className="text-sm text-gray-600 mb-6">{safeComparisonText}</p>

      <div className="relative flex items-center justify-center">
        <ResponsiveContainer width="100%" height={180}>
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              startAngle={180}
              endAngle={0}
              innerRadius={60}
              outerRadius={90}
              paddingAngle={0}
              dataKey="value"
            >
              {data.map((_, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index]} />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/4">
          <p className="text-4xl font-bold text-gray-900">{safeProfitPercentage}%</p>
        </div>
      </div>
    </div>
  );
}
