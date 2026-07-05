import type { ReactNode } from "react";

interface Props {
  title: string;
  value: string;
  icon: ReactNode;
  bgColor?: string;
  className?: string;
}

export function StatCard({ title, value, icon, bgColor = "bg-white", className = "" }: Props) {
  return (
    <div className={`${bgColor} rounded-2xl p-6 shadow-[12px_12px_5px_1px] shadow-teal ${className}`}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm text-gray-600 font-semibold mb-1">{title ?? ''}</p>
          <p className="text-3xl font-bold text-foreground-dark text-nowrap">{value ?? 'S/ 0.00'}</p>
        </div>
        <div className="text-gray-800 bg-gray-50/30 p-3 rounded-xl">
          {icon}
        </div>
      </div>
    </div>
  );
}
