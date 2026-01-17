"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@fintech/ui";
import { Button } from "@fintech/ui";
import { Star, Plus, ArrowUpRight, ArrowDownRight } from "lucide-react";

const watchItems = [
  {
    symbol: "AAPL",
    name: "苹果公司",
    price: "182.52",
    change: "+2.34%",
    trend: "up",
  },
  {
    symbol: "TSLA",
    name: "特斯拉",
    price: "248.34",
    change: "-1.23%",
    trend: "down",
  },
  {
    symbol: "NVDA",
    name: "英伟达",
    price: "875.28",
    change: "+4.56%",
    trend: "up",
  },
  {
    symbol: "BABA",
    name: "阿里巴巴",
    price: "78.45",
    change: "+1.87%",
    trend: "up",
  },
  {
    symbol: "MSFT",
    name: "微软",
    price: "378.91",
    change: "+0.89%",
    trend: "up",
  },
];

export function WatchList() {
  return (
    <Card className="bg-card border-border glass h-full">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-lg font-semibold">自选股</CardTitle>
        <Button
          variant="ghost"
          size="sm"
          className="text-muted-foreground hover:text-primary"
        >
          <Plus className="w-4 h-4 mr-1" />
          添加
        </Button>
      </CardHeader>
      <CardContent className="space-y-2">
        {watchItems.map((item, index) => (
          <div
            key={index}
            className="flex items-center justify-between p-2.5 rounded-lg hover:bg-secondary/50 transition-colors cursor-pointer group"
          >
            <div className="flex items-center gap-3">
              <Star className="w-4 h-4 text-chart-3 fill-chart-3 opacity-50 group-hover:opacity-100 transition-opacity" />
              <div>
                <p className="font-semibold text-sm">{item.symbol}</p>
                <p className="text-xs text-muted-foreground">{item.name}</p>
              </div>
            </div>
            <div className="text-right">
              <p className="font-medium text-sm">${item.price}</p>
              <div
                className={`flex items-center justify-end gap-0.5 text-xs font-medium ${
                  item.trend === "up" ? "text-accent" : "text-destructive"
                }`}
              >
                {item.trend === "up" ? (
                  <ArrowUpRight className="w-3 h-3" />
                ) : (
                  <ArrowDownRight className="w-3 h-3" />
                )}
                {item.change}
              </div>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
