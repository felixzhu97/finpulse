"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@fintech/ui";
import { Button } from "@fintech/ui";
import {
  ArrowUpRight,
  ArrowDownLeft,
  RefreshCw,
  FileText,
  Download,
  Send,
} from "lucide-react";

const actions = [
  {
    icon: ArrowUpRight,
    label: "买入",
    color: "bg-accent/10 text-accent hover:bg-accent/20",
  },
  {
    icon: ArrowDownLeft,
    label: "卖出",
    color: "bg-destructive/10 text-destructive hover:bg-destructive/20",
  },
  {
    icon: RefreshCw,
    label: "调仓",
    color: "bg-primary/10 text-primary hover:bg-primary/20",
  },
  {
    icon: Send,
    label: "转账",
    color: "bg-chart-3/10 text-chart-3 hover:bg-chart-3/20",
  },
  {
    icon: FileText,
    label: "报表",
    color: "bg-chart-5/10 text-chart-5 hover:bg-chart-5/20",
  },
  {
    icon: Download,
    label: "导出",
    color: "bg-muted text-muted-foreground hover:bg-muted/80",
  },
];

export function QuickActions() {
  return (
    <Card className="bg-card border-border glass h-full">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-semibold">快捷操作</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-2">
          {actions.map((action, index) => (
            <Button
              key={index}
              variant="ghost"
              className={`h-auto py-4 flex flex-col items-center gap-2 ${action.color} transition-all duration-200`}
            >
              <action.icon className="w-5 h-5" />
              <span className="text-xs font-medium">{action.label}</span>
            </Button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
