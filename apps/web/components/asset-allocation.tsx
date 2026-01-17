"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@fintech/ui";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";

const data = [
  { name: "股票", value: 45, color: "oklch(0.65 0.2 250)" },
  { name: "债券", value: 25, color: "oklch(0.7 0.22 160)" },
  { name: "基金", value: 15, color: "oklch(0.75 0.18 80)" },
  { name: "现金", value: 10, color: "oklch(0.7 0.15 300)" },
  { name: "其他", value: 5, color: "oklch(0.6 0.02 260)" },
];

export function AssetAllocation() {
  return (
    <Card className="bg-card border-border glass h-full">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-semibold">资产配置</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[200px] relative">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={85}
                paddingAngle={3}
                dataKey="value"
                strokeWidth={0}
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: "oklch(0.14 0.015 260)",
                  border: "1px solid oklch(0.25 0.02 260)",
                  borderRadius: "8px",
                  color: "oklch(0.95 0.01 260)",
                }}
                formatter={(value: number) => [`${value}%`, ""]}
              />
            </PieChart>
          </ResponsiveContainer>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <p className="text-2xl font-bold">¥12.8M</p>
              <p className="text-xs text-muted-foreground">总资产</p>
            </div>
          </div>
        </div>
        <div className="mt-4 space-y-2">
          {data.map((item, index) => (
            <div key={index} className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: item.color }}
                />
                <span className="text-sm text-muted-foreground">
                  {item.name}
                </span>
              </div>
              <span className="text-sm font-medium">{item.value}%</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
