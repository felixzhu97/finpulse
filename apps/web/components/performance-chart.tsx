"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@fintech/ui";
import { Button } from "@fintech/ui";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

const data = [
  { date: "1月", value: 10000000, benchmark: 9800000 },
  { date: "2月", value: 10500000, benchmark: 10000000 },
  { date: "3月", value: 10200000, benchmark: 10100000 },
  { date: "4月", value: 11200000, benchmark: 10400000 },
  { date: "5月", value: 11800000, benchmark: 10600000 },
  { date: "6月", value: 11500000, benchmark: 10800000 },
  { date: "7月", value: 12100000, benchmark: 11000000 },
  { date: "8月", value: 12400000, benchmark: 11200000 },
  { date: "9月", value: 12000000, benchmark: 11100000 },
  { date: "10月", value: 12300000, benchmark: 11300000 },
  { date: "11月", value: 12600000, benchmark: 11500000 },
  { date: "12月", value: 12847382, benchmark: 11700000 },
];

const timeRanges = ["1周", "1月", "3月", "6月", "1年", "全部"];

export function PerformanceChart() {
  const [activeRange, setActiveRange] = useState("1年");

  return (
    <Card className="bg-card border-border glass">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div>
          <CardTitle className="text-lg font-semibold">投资组合表现</CardTitle>
          <p className="text-sm text-muted-foreground">对比基准指数</p>
        </div>
        <div className="flex items-center gap-1 p-1 bg-secondary/50 rounded-lg">
          {timeRanges.map((range) => (
            <Button
              key={range}
              variant={activeRange === range ? "default" : "ghost"}
              size="sm"
              onClick={() => setActiveRange(range)}
              className={
                activeRange === range
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }
            >
              {range}
            </Button>
          ))}
        </div>
      </CardHeader>
      <CardContent className="pt-4">
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={data}
              margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
            >
              <defs>
                <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                  <stop
                    offset="5%"
                    stopColor="oklch(0.65 0.2 250)"
                    stopOpacity={0.4}
                  />
                  <stop
                    offset="95%"
                    stopColor="oklch(0.65 0.2 250)"
                    stopOpacity={0}
                  />
                </linearGradient>
                <linearGradient id="colorBenchmark" x1="0" y1="0" x2="0" y2="1">
                  <stop
                    offset="5%"
                    stopColor="oklch(0.7 0.22 160)"
                    stopOpacity={0.3}
                  />
                  <stop
                    offset="95%"
                    stopColor="oklch(0.7 0.22 160)"
                    stopOpacity={0}
                  />
                </linearGradient>
              </defs>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="oklch(0.25 0.02 260)"
              />
              <XAxis
                dataKey="date"
                axisLine={false}
                tickLine={false}
                tick={{ fill: "oklch(0.6 0.02 260)", fontSize: 12 }}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fill: "oklch(0.6 0.02 260)", fontSize: 12 }}
                tickFormatter={(value) => `¥${(value / 1000000).toFixed(0)}M`}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "oklch(0.14 0.015 260)",
                  border: "1px solid oklch(0.25 0.02 260)",
                  borderRadius: "8px",
                  color: "oklch(0.95 0.01 260)",
                }}
                formatter={(value: number) => [
                  `¥${value.toLocaleString()}`,
                  "",
                ]}
              />
              <Area
                type="monotone"
                dataKey="benchmark"
                stroke="oklch(0.7 0.22 160)"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#colorBenchmark)"
                name="基准指数"
              />
              <Area
                type="monotone"
                dataKey="value"
                stroke="oklch(0.65 0.2 250)"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#colorValue)"
                name="投资组合"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
        <div className="flex items-center justify-center gap-6 mt-4 pt-4 border-t border-border">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-primary" />
            <span className="text-sm text-muted-foreground">投资组合</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-accent" />
            <span className="text-sm text-muted-foreground">基准指数</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
