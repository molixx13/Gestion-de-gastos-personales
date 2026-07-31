"use client";

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";
import type { CategorySummary } from "@/types";
import { formatCurrency } from "@/lib/utils";

interface CategoryChartProps {
  data: CategorySummary[];
}

const CustomTooltip = ({ active, payload }: any) => {
  if (!active || !payload?.length) return null;
  const item = payload[0].payload;
  return (
    <div className="bg-white border border-gray-200 rounded-lg p-3 shadow-lg text-sm">
      <p className="font-semibold text-gray-900">
        {item.category.icon} {item.category.name}
      </p>
      <p className="text-gray-600 mt-1">{formatCurrency(item.total)}</p>
      <p className="text-gray-400 text-xs">{item.percentage.toFixed(1)}% del total</p>
    </div>
  );
};

export function CategoryChart({ data }: CategoryChartProps) {
  if (data.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500">
        <p>No hay datos de gastos para este mes</p>
      </div>
    );
  }

  return (
    <div className="w-full">
      <ResponsiveContainer width="100%" height={280}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={100}
            paddingAngle={3}
            dataKey="total"
            nameKey="category.name"
          >
            {data.map((entry) => (
              <Cell key={entry.category.id} fill={entry.category.color} />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
          <Legend
            formatter={(value: string) => (
              <span className="text-sm text-gray-600">{value}</span>
            )}
          />
        </PieChart>
      </ResponsiveContainer>

      <div className="mt-4 space-y-2">
        {data.map((item) => (
          <div
            key={item.category.id}
            className="flex items-center gap-3 text-sm"
          >
            <div
              className="w-3 h-3 rounded-full flex-shrink-0"
              style={{ backgroundColor: item.category.color }}
            />
            <span className="flex-1 text-gray-700 truncate">
              {item.category.icon} {item.category.name}
            </span>
            <span className="font-medium text-gray-900">
              {formatCurrency(item.total)}
            </span>
            <span className="text-gray-400 w-10 text-right">
              {item.percentage.toFixed(0)}%
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
