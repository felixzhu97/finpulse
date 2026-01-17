"use client";

import { useState } from "react";
import { cn } from "@fintech/utils";
import {
  LayoutDashboard,
  TrendingUp,
  Wallet,
  PieChart,
  Bell,
  Settings,
  HelpCircle,
  ChevronLeft,
  ChevronRight,
  LineChart,
  Shield,
  CreditCard,
  Users,
  FileText,
  Zap,
} from "lucide-react";

const menuItems = [
  { icon: LayoutDashboard, label: "仪表盘", active: true },
  { icon: TrendingUp, label: "市场行情" },
  { icon: Wallet, label: "投资组合" },
  { icon: PieChart, label: "资产配置" },
  { icon: LineChart, label: "数据分析" },
  { icon: Shield, label: "风险管理" },
  { icon: CreditCard, label: "交易记录" },
  { icon: Users, label: "客户管理" },
  { icon: FileText, label: "报表中心" },
];

const bottomItems = [
  { icon: Bell, label: "通知中心" },
  { icon: Settings, label: "系统设置" },
  { icon: HelpCircle, label: "帮助文档" },
];

export function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside
      className={cn(
        "fixed left-0 top-0 h-screen bg-sidebar border-r border-sidebar-border flex flex-col transition-all duration-300 z-50",
        collapsed ? "w-20" : "w-64"
      )}
    >
      {/* Logo */}
      <div className="h-16 flex items-center px-4 border-b border-sidebar-border">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center animate-pulse-glow">
            <Zap className="w-6 h-6 text-primary-foreground" />
          </div>
          {!collapsed && (
            <span className="text-xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              FinPulse
            </span>
          )}
        </div>
      </div>

      {/* Main Menu */}
      <nav className="flex-1 py-6 px-3 overflow-y-auto">
        <div className="space-y-1">
          {menuItems.map((item, index) => (
            <button
              key={index}
              className={cn(
                "w-full flex items-center gap-3 px-3 py-3 rounded-lg transition-all duration-200 group",
                item.active
                  ? "bg-primary/10 text-primary glow-border"
                  : "text-muted-foreground hover:bg-secondary hover:text-foreground"
              )}
            >
              <item.icon
                className={cn(
                  "w-5 h-5 flex-shrink-0 transition-transform group-hover:scale-110",
                  item.active && "text-primary"
                )}
              />
              {!collapsed && (
                <span className="font-medium truncate">{item.label}</span>
              )}
              {item.active && !collapsed && (
                <div className="ml-auto w-2 h-2 rounded-full bg-primary animate-pulse" />
              )}
            </button>
          ))}
        </div>
      </nav>

      {/* Bottom Menu */}
      <div className="py-4 px-3 border-t border-sidebar-border">
        <div className="space-y-1">
          {bottomItems.map((item, index) => (
            <button
              key={index}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-muted-foreground hover:bg-secondary hover:text-foreground transition-all duration-200"
            >
              <item.icon className="w-5 h-5 flex-shrink-0" />
              {!collapsed && <span className="font-medium">{item.label}</span>}
            </button>
          ))}
        </div>
      </div>

      {/* Collapse Toggle */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="absolute -right-3 top-20 w-6 h-6 rounded-full bg-card border border-border flex items-center justify-center hover:bg-secondary transition-colors"
      >
        {collapsed ? (
          <ChevronRight className="w-4 h-4" />
        ) : (
          <ChevronLeft className="w-4 h-4" />
        )}
      </button>
    </aside>
  );
}
