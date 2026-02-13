import type { Portfolio } from "@/src/domain/entities/portfolio";
import { formatCurrency, formatSignedPercent } from "@/src/presentation/utils";
import { MetricCard } from "../ui/MetricCard";
import { BlockRow, BlockRowHalf, BlockHalf } from "@/src/presentation/theme/primitives";

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
    <BlockRow>
      <MetricCard
        label="Net worth"
        value={formatCurrency(summary.netWorth, currency)}
        helper={`Assets ${formatCurrency(summary.totalAssets, currency)} · Liabilities ${formatCurrency(summary.totalLiabilities, currency)}`}
      />
      <BlockRowHalf>
        <BlockHalf>
          <MetricCard
            label="Today"
            value={formatCurrency(summary.todayChange, currency)}
            helper={formatSignedPercent(dayChangeRate)}
            tone={summary.todayChange >= 0 ? "positive" : "negative"}
          />
        </BlockHalf>
        <BlockHalf>
          <MetricCard
            label="This week"
            value={formatCurrency(summary.weekChange, currency)}
            helper={formatSignedPercent(weekChangeRate)}
            tone={summary.weekChange >= 0 ? "positive" : "negative"}
          />
        </BlockHalf>
      </BlockRowHalf>
    </BlockRow>
  );
}
