import { memo } from "react";
import type { Portfolio } from "@/src/lib/types/portfolio";
import { formatCurrency, formatSignedPercent } from "@/src/lib/utils";
import { useTranslation } from "@/src/lib/i18n";
import { MetricCard } from "../ui/MetricCard";
import { BlockRow, BlockRowHalf, BlockHalf } from "@/src/theme/primitives";

interface PortfolioSummaryProps {
  portfolio: Portfolio;
}

export const PortfolioSummary = memo(function PortfolioSummary({ portfolio }: PortfolioSummaryProps) {
  const { t } = useTranslation();
  const { summary } = portfolio;
  const currency = portfolio.baseCurrency;

  const dayChangeRate =
    summary.totalAssets === 0 ? 0 : summary.todayChange / summary.totalAssets;
  const weekChangeRate =
    summary.totalAssets === 0 ? 0 : summary.weekChange / summary.totalAssets;

  const netWorthHelper = t("dashboard.netWorthHelper", {
    assets: formatCurrency(summary.totalAssets, currency),
    liabilities: formatCurrency(summary.totalLiabilities, currency),
  });

  return (
    <BlockRow>
      <MetricCard
        label={t("dashboard.netWorth")}
        value={formatCurrency(summary.netWorth, currency)}
        helper={netWorthHelper}
      />
      <BlockRowHalf>
        <BlockHalf>
          <MetricCard
            label={t("dashboard.today")}
            value={formatCurrency(summary.todayChange, currency)}
            helper={formatSignedPercent(dayChangeRate)}
            tone={summary.todayChange >= 0 ? "positive" : "negative"}
          />
        </BlockHalf>
        <BlockHalf>
          <MetricCard
            label={t("dashboard.thisWeek")}
            value={formatCurrency(summary.weekChange, currency)}
            helper={formatSignedPercent(weekChangeRate)}
            tone={summary.weekChange >= 0 ? "positive" : "negative"}
          />
        </BlockHalf>
      </BlockRowHalf>
    </BlockRow>
  );
});
