import { View, Text } from "react-native";
import type { Portfolio } from "../types/portfolio";
import { MetricCard } from "./MetricCard";

interface PortfolioSummaryProps {
  portfolio: Portfolio;
}

function formatCurrency(value: number, currency: string) {
  return `${currency} ${value.toLocaleString(undefined, {
    maximumFractionDigits: 0,
  })}`;
}

function formatSignedPercent(value: number) {
  const percent = value * 100;
  const formatted = percent.toFixed(2);
  if (percent > 0) {
    return `+${formatted}%`;
  }
  if (percent < 0) {
    return `${formatted}%`;
  }
  return "0.00%";
}

export function PortfolioSummary({ portfolio }: PortfolioSummaryProps) {
  const { summary } = portfolio;
  const currency = portfolio.baseCurrency;

  const dayChangeRate =
    summary.totalAssets === 0 ? 0 : summary.todayChange / summary.totalAssets;
  const weekChangeRate =
    summary.totalAssets === 0 ? 0 : summary.weekChange / summary.totalAssets;

  return (
    <View
      style={{
        gap: 12,
      }}
    >
      <MetricCard
        label="Net worth"
        value={formatCurrency(summary.netWorth, currency)}
        helper={`Assets ${formatCurrency(summary.totalAssets, currency)} · Liabilities ${formatCurrency(summary.totalLiabilities, currency)}`}
      />
      <View
        style={{
          flexDirection: "row",
          gap: 12,
        }}
      >
        <View style={{ flex: 1 }}>
          <MetricCard
            label="Today"
            value={formatCurrency(summary.todayChange, currency)}
            helper={formatSignedPercent(dayChangeRate)}
            tone={summary.todayChange >= 0 ? "positive" : "negative"}
          />
        </View>
        <View style={{ flex: 1 }}>
          <MetricCard
            label="This week"
            value={formatCurrency(summary.weekChange, currency)}
            helper={formatSignedPercent(weekChangeRate)}
            tone={summary.weekChange >= 0 ? "positive" : "negative"}
          />
        </View>
      </View>
    </View>
  );
}

