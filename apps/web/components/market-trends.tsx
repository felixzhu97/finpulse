"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@fintech/ui";
import { ArrowUpRight, ArrowDownRight } from "lucide-react";
import { Sparklines, SparklinesLine } from "react-sparklines";

const markets = [
  {
    name: "上证指数",
    code: "SH000001",
    price: "3,254.68",
    change: "+1.24%",
    trend: "up",
    data: [30, 32, 35, 33, 38, 40, 42, 45, 43, 48],
  },
  {
    name: "深证成指",
    code: "SZ399001",
    price: "10,847.32",
    change: "+0.87%",
    trend: "up",
    data: [40, 38, 42, 45, 43, 47, 50, 48, 52, 55],
  },
  {
    name: "创业板指",
    code: "SZ399006",
    price: "2,156.47",
    change: "-0.32%",
    trend: "down",
    data: [50, 48, 52, 49, 47, 45, 48, 46, 44, 42],
  },
  {
    name: "恒生指数",
    code: "HK.HSI",
    price: "17,432.56",
    change: "+2.15%",
    trend: "up",
    data: [35, 38, 40, 42, 45, 48, 50, 53, 56, 58],
  },
  {
    name: "纳斯达克",
    code: "NASDAQ",
    price: "16,742.89",
    change: "+0.56%",
    trend: "up",
    data: [60, 62, 58, 65, 63, 68, 70, 72, 69, 74],
  },
];

export function MarketTrends() {
  return (
    <Card className="bg-card border-border glass h-full">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-semibold">市场行情</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {markets.map((market, index) => (
          <div
            key={index}
            className="flex items-center justify-between p-3 rounded-lg bg-secondary/30 hover:bg-secondary/50 transition-colors cursor-pointer"
          >
            <div className="flex-1">
              <p className="font-medium text-sm">{market.name}</p>
              <p className="text-xs text-muted-foreground">{market.code}</p>
            </div>
            <div className="w-20 h-8 mx-4">
              <Sparklines data={market.data} width={80} height={32}>
                <SparklinesLine
                  color={
                    market.trend === "up"
                      ? "oklch(0.7 0.22 160)"
                      : "oklch(0.6 0.2 25)"
                  }
                  style={{ strokeWidth: 2, fill: "none" }}
                />
              </Sparklines>
            </div>
            <div className="text-right">
              <p className="font-semibold text-sm">{market.price}</p>
              <div
                className={`flex items-center justify-end gap-0.5 text-xs font-medium ${
                  market.trend === "up" ? "text-accent" : "text-destructive"
                }`}
              >
                {market.trend === "up" ? (
                  <ArrowUpRight className="w-3 h-3" />
                ) : (
                  <ArrowDownRight className="w-3 h-3" />
                )}
                {market.change}
              </div>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
