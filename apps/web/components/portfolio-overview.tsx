"use client";

import {
  ArrowUpRight,
  ArrowDownRight,
  TrendingUp,
  Wallet,
  Target,
  Activity,
} from "lucide-react";
import { Card } from "@fintech/ui";

const stats = [
  {
    title: "总资产净值",
    value: "¥12,847,382",
    change: "+12.5%",
    trend: "up",
    icon: Wallet,
    color: "primary",
  },
  {
    title: "今日收益",
    value: "¥128,473",
    change: "+2.34%",
    trend: "up",
    icon: TrendingUp,
    color: "accent",
  },
  {
    title: "累计收益率",
    value: "34.82%",
    change: "+5.2%",
    trend: "up",
    icon: Target,
    color: "chart-3",
  },
  {
    title: "活跃交易",
    value: "47",
    change: "-3",
    trend: "down",
    icon: Activity,
    color: "chart-5",
  },
];

export function PortfolioOverview() {
  return (
    <div className="grid grid-cols-4 gap-4">
      {stats.map((stat, index) => (
        <Card
          key={index}
          className="p-5 bg-card border-border hover:border-primary/50 transition-all duration-300 group cursor-pointer glass glow-border"
        >
          <div className="flex items-start justify-between">
            <div className="space-y-3">
              <p className="text-sm text-muted-foreground font-medium">
                {stat.title}
              </p>
              <p className="text-2xl font-bold tracking-tight">{stat.value}</p>
              <div
                className={`inline-flex items-center gap-1 text-sm font-medium ${
                  stat.trend === "up" ? "text-accent" : "text-destructive"
                }`}
              >
                {stat.trend === "up" ? (
                  <ArrowUpRight className="w-4 h-4" />
                ) : (
                  <ArrowDownRight className="w-4 h-4" />
                )}
                {stat.change}
                <span className="text-muted-foreground ml-1">本月</span>
              </div>
            </div>
            <div
              className={`w-12 h-12 rounded-xl bg-${stat.color}/10 flex items-center justify-center group-hover:scale-110 transition-transform`}
            >
              <stat.icon
                className={`w-6 h-6 text-${stat.color}`}
                style={{ color: `var(--${stat.color})` }}
              />
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}
