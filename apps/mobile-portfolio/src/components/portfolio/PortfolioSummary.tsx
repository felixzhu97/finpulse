import { StyleSheet, View } from "react-native";
import type { Portfolio } from "@/src/types/portfolio";
import { formatCurrency, formatSignedPercent } from "@/src/utils";
import { MetricCard } from "../ui/MetricCard";

interface PortfolioSummaryProps {
  portfolio: Portfolio;
}

export function PortfolioSummary({ portfolio }: PortfolioSummaryProps) {
  const { summary } = portfolio;
  const currency = portfolio.baseCurrency;

  const dayChangeRate =
    summary.totalAssets === 0 ? 0 : summary.todayChange / summary.totalAssets;
  const weekChangeRate =
    summary.totalAssets === 0 ? 0 : summary.weekChange / summary.totalAssets;

  return (
    <View style={styles.block}>
      <MetricCard
        label="Net worth"
        value={formatCurrency(summary.netWorth, currency)}
        helper={`Assets ${formatCurrency(summary.totalAssets, currency)} · Liabilities ${formatCurrency(summary.totalLiabilities, currency)}`}
      />
      <View style={styles.row}>
        <View style={styles.half}>
          <MetricCard
            label="Today"
            value={formatCurrency(summary.todayChange, currency)}
            helper={formatSignedPercent(dayChangeRate)}
            tone={summary.todayChange >= 0 ? "positive" : "negative"}
          />
        </View>
        <View style={styles.half}>
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

const styles = StyleSheet.create({
  block: {
    gap: 12,
  },
  row: {
    flexDirection: "row",
    gap: 12,
  },
  half: {
    flex: 1,
  },
});
