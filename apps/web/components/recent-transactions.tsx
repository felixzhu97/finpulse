"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@fintech/ui";
import { Button } from "@fintech/ui";
import { Badge } from "@fintech/ui";
import { ArrowUpRight, ArrowDownLeft, MoreHorizontal } from "lucide-react";

const transactions = [
  {
    type: "buy",
    symbol: "NVDA",
    name: "英伟达",
    amount: "100股",
    price: "¥62,847",
    time: "今天 14:32",
    status: "completed",
  },
  {
    type: "sell",
    symbol: "AAPL",
    name: "苹果公司",
    amount: "50股",
    price: "¥65,234",
    time: "今天 11:15",
    status: "completed",
  },
  {
    type: "buy",
    symbol: "TSLA",
    name: "特斯拉",
    amount: "30股",
    price: "¥53,456",
    time: "昨天 15:47",
    status: "completed",
  },
  {
    type: "sell",
    symbol: "MSFT",
    name: "微软",
    amount: "20股",
    price: "¥54,238",
    time: "昨天 10:23",
    status: "completed",
  },
  {
    type: "buy",
    symbol: "BABA",
    name: "阿里巴巴",
    amount: "200股",
    price: "¥112,567",
    time: "01/15",
    status: "pending",
  },
];

export function RecentTransactions() {
  return (
    <Card className="bg-card border-border glass">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-lg font-semibold">最近交易</CardTitle>
        <Button variant="ghost" size="sm" className="text-primary">
          查看全部
        </Button>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {transactions.map((tx, index) => (
            <div
              key={index}
              className="flex items-center justify-between p-3 rounded-lg bg-secondary/30 hover:bg-secondary/50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                    tx.type === "buy" ? "bg-accent/10" : "bg-destructive/10"
                  }`}
                >
                  {tx.type === "buy" ? (
                    <ArrowUpRight className="w-5 h-5 text-accent" />
                  ) : (
                    <ArrowDownLeft className="w-5 h-5 text-destructive" />
                  )}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <p className="font-semibold text-sm">{tx.symbol}</p>
                    <Badge
                      variant={tx.type === "buy" ? "default" : "destructive"}
                      className={`text-xs ${
                        tx.type === "buy"
                          ? "bg-accent/10 text-accent hover:bg-accent/20"
                          : "bg-destructive/10 text-destructive hover:bg-destructive/20"
                      }`}
                    >
                      {tx.type === "buy" ? "买入" : "卖出"}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {tx.name} · {tx.amount}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-semibold text-sm">{tx.price}</p>
                <p className="text-xs text-muted-foreground">{tx.time}</p>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="ml-2 text-muted-foreground"
              >
                <MoreHorizontal className="w-4 h-4" />
              </Button>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
