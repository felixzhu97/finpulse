"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@fintech/ui";
import { Progress } from "@fintech/ui";
import { AlertTriangle, Shield, TrendingUp, Activity } from "lucide-react";

const riskMetrics = [
  {
    name: "波动率",
    value: 18.5,
    max: 30,
    status: "medium",
    icon: Activity,
  },
  {
    name: "夏普比率",
    value: 1.85,
    max: 3,
    status: "good",
    icon: TrendingUp,
  },
  {
    name: "最大回撤",
    value: 12.3,
    max: 25,
    status: "good",
    icon: AlertTriangle,
  },
  {
    name: "VaR (95%)",
    value: 5.2,
    max: 10,
    status: "medium",
    icon: Shield,
  },
];

const getStatusColor = (status: string) => {
  switch (status) {
    case "good":
      return "bg-accent";
    case "medium":
      return "bg-chart-3";
    case "bad":
      return "bg-destructive";
    default:
      return "bg-muted";
  }
};

const getStatusText = (status: string) => {
  switch (status) {
    case "good":
      return "优秀";
    case "medium":
      return "正常";
    case "bad":
      return "警告";
    default:
      return "未知";
  }
};

export function RiskAnalysis() {
  return (
    <Card className="bg-card border-border glass h-full">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold">风险分析</CardTitle>
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-accent/10">
            <Shield className="w-4 h-4 text-accent" />
            <span className="text-xs font-medium text-accent">低风险</span>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {riskMetrics.map((metric, index) => (
          <div key={index} className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <metric.icon className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm font-medium">{metric.name}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold">
                  {metric.name === "夏普比率"
                    ? metric.value.toFixed(2)
                    : `${metric.value}%`}
                </span>
                <span
                  className={`text-xs px-2 py-0.5 rounded-full ${
                    metric.status === "good"
                      ? "bg-accent/10 text-accent"
                      : metric.status === "medium"
                      ? "bg-chart-3/10 text-chart-3"
                      : "bg-destructive/10 text-destructive"
                  }`}
                >
                  {getStatusText(metric.status)}
                </span>
              </div>
            </div>
            <Progress
              value={(metric.value / metric.max) * 100}
              className="h-2 bg-secondary"
            />
          </div>
        ))}

        <div className="pt-4 border-t border-border">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">综合风险评分</span>
            <div className="flex items-center gap-2">
              <span className="text-2xl font-bold text-accent">82</span>
              <span className="text-muted-foreground">/100</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
