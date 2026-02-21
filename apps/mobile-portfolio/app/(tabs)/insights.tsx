import { useCallback, useState } from "react";
import { ActivityIndicator, Dimensions, Platform } from "react-native";
import { BarChart } from "react-native-chart-kit";
import { MetricCard } from "@/src/presentation/components/ui/MetricCard";
import { RiskMetricDetailDrawer } from "@/src/presentation/components/insights";
import { useComputedVar, useRiskMetrics, useRiskSummary } from "@/src/presentation/hooks";
import { useTheme } from "@/src/presentation/theme";
import { useTranslation } from "@/src/presentation/i18n";
import {
  InsightsScrollView,
  InsightsBlock,
  InsightsSection,
  InsightsSectionHeader,
  OverviewGrid,
  OverviewCard,
  MetricsGrid,
  MetricCardWrap,
  InsightsChartCard,
  InsightsSummaryCard,
  SummaryBody,
  InsightsErrorText,
  InsightsRetryText,
  InsightsCentered,
  InsightsLoadingContainer,
} from "@/src/presentation/theme/primitives";

export default function InsightsScreen() {
  const { colors } = useTheme();
  const { t } = useTranslation();
  const { metrics, loading, error, refresh } = useRiskMetrics();
  const { summary, loading: summaryLoading, error: summaryError, refresh: refreshSummary } = useRiskSummary();
  const { computedVar, loading: varLoading, error: varError, compute: computeVar } = useComputedVar();
  const [detailDrawerVisible, setDetailDrawerVisible] = useState(false);
  const [selectedMetric, setSelectedMetric] = useState<{ key: string; value: number } | null>(null);

  const handleRefresh = useCallback(async () => {
    await Promise.all([refresh(), refreshSummary(), computeVar()]);
  }, [refresh, refreshSummary, computeVar]);

  const highRatio = summary?.highRatio ?? 0;
  const topConcentration = summary?.topHoldingsConcentration ?? 0;

  const highRiskPercent = (highRatio * 100).toFixed(1);
  const concentrationPercent = (topConcentration * 100).toFixed(1);

  const highRiskText =
    highRatio > 0.4
      ? t("insights.highExposureText")
      : t("insights.moderateExposureText");

  const concentrationText =
    topConcentration > 0.5
      ? t("insights.highConcentrationText")
      : t("insights.balancedConcentrationText");

  const screenWidth = Dimensions.get("window").width;
  const chartWidth = screenWidth - 80;

  const hasError = (error || summaryError || varError) && !metrics && !summary && !computedVar;

  if (hasError) {
    return (
      <InsightsCentered>
        <InsightsErrorText>{t("insights.unableToLoad")}</InsightsErrorText>
        <InsightsRetryText onPress={handleRefresh}>{t("insights.tapToRetry")}</InsightsRetryText>
      </InsightsCentered>
    );
  }

  const hasApiMetrics =
    metrics &&
    (metrics.volatility != null ||
      metrics.sharpe_ratio != null ||
      metrics.var != null ||
      metrics.beta != null);

  return (
    <InsightsScrollView
      contentContainerStyle={{ padding: 20, paddingBottom: 40 }}
    >
      {(loading && !metrics) || (summaryLoading && !summary) || (varLoading && !computedVar) ? (
        <InsightsLoadingContainer>
          <ActivityIndicator size="small" color={colors.textSecondary} />
        </InsightsLoadingContainer>
      ) : (
        <InsightsBlock>
          <InsightsSection>
            <InsightsSectionHeader>{t("insights.overview")}</InsightsSectionHeader>
            <OverviewGrid>
              <OverviewCard>
                <MetricCard
                  label={t("insights.highRiskExposure")}
                  value={`${highRiskPercent}%`}
                  tone={highRatio > 0.4 ? "negative" : "default"}
                />
              </OverviewCard>
              <OverviewCard>
                <MetricCard
                  label={t("insights.top5HoldingsConcentration")}
                  value={`${concentrationPercent}%`}
                  tone={topConcentration > 0.5 ? "negative" : "default"}
                />
              </OverviewCard>
            </OverviewGrid>
          </InsightsSection>

          {(computedVar?.var != null || hasApiMetrics) ? (
            <InsightsSection>
              <InsightsSectionHeader>{t("insights.riskMetricsApi")}</InsightsSectionHeader>
              <MetricsGrid>
                {computedVar?.var != null && (
                  <MetricCardWrap>
                    <MetricCard
                      label={t("insights.computedVar")}
                      value={computedVar.var.toFixed(4)}
                      onInfoPress={() => {
                        setSelectedMetric({ key: "computedVar", value: computedVar.var! });
                        setDetailDrawerVisible(true);
                      }}
                    />
                  </MetricCardWrap>
                )}
                {[
                  { key: "volatility", val: metrics?.volatility, fmt: (v: number) => v.toFixed(4) },
                  { key: "sharpeRatio", val: metrics?.sharpe_ratio, fmt: (v: number) => v.toFixed(2) },
                  { key: "var", val: metrics?.var, fmt: (v: number) => v.toFixed(2) },
                  { key: "beta", val: metrics?.beta, fmt: (v: number) => v.toFixed(2) },
                ]
                  .filter((m) => m.val != null)
                  .map((m) => (
                    <MetricCardWrap key={m.key}>
                      <MetricCard
                        label={t(`insights.${m.key}`)}
                        value={m.fmt(m.val!)}
                        onInfoPress={() => {
                          setSelectedMetric({ key: m.key, value: m.val! });
                          setDetailDrawerVisible(true);
                        }}
                      />
                    </MetricCardWrap>
                  ))}
              </MetricsGrid>
            </InsightsSection>
          ) : null}
          <InsightsSection>
            <InsightsSectionHeader>{t("insights.riskOverview")}</InsightsSectionHeader>
            <InsightsChartCard
              style={
                Platform.OS === "ios"
                  ? {
                      shadowColor: "#000",
                      shadowOffset: { width: 0, height: 2 },
                      shadowOpacity: 0.1,
                      shadowRadius: 8,
                    }
                  : { elevation: 2 }
              }
            >
            <BarChart
              data={{
                labels: ["High risk", "Top 5"],
                datasets: [
                  {
                    data: [
                      Number(highRiskPercent),
                      Number(concentrationPercent),
                    ],
                  },
                ],
              }}
              width={chartWidth}
              height={220}
              fromZero
              yAxisLabel=""
              yAxisSuffix="%"
              chartConfig={{
                backgroundGradientFrom: colors.card,
                backgroundGradientFromOpacity: 0,
                backgroundGradientTo: colors.card,
                backgroundGradientToOpacity: 0,
                color: (opacity = 1) => {
                  if (Platform.OS === "ios") {
                    return `rgba(0, 122, 255, ${opacity})`;
                  }
                  return colors.primary;
                },
                labelColor: (opacity = 1) => {
                  const textColor = colors.textSecondary;
                  if (typeof textColor === "string" && textColor.startsWith("rgba")) {
                    return textColor;
                  }
                  return `rgba(142, 142, 147, ${opacity})`;
                },
                decimalPlaces: 1,
                barPercentage: 0.6,
                propsForBackgroundLines: {
                  strokeWidth: 0,
                },
                propsForLabels: {
                  fontSize: 12,
                  fontWeight: "500",
                },
              }}
              withInnerLines={false}
              showBarTops={false}
              style={{ marginLeft: -8, marginRight: -8, backgroundColor: "transparent" }}
              verticalLabelRotation={0}
            />
            </InsightsChartCard>
          </InsightsSection>
          <InsightsSection>
            <InsightsSectionHeader>{t("insights.summary")}</InsightsSectionHeader>
            <InsightsSummaryCard style={Platform.OS === "ios" ? { shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 8 } : { elevation: 2 }}>
              <SummaryBody>{t("insights.summaryBody")}</SummaryBody>
            </InsightsSummaryCard>
          </InsightsSection>
        </InsightsBlock>
      )}
      <RiskMetricDetailDrawer
        visible={detailDrawerVisible}
        metricKey={selectedMetric?.key ?? null}
        metricValue={selectedMetric?.value ?? null}
        onClose={() => {
          setDetailDrawerVisible(false);
          setSelectedMetric(null);
        }}
      />
    </InsightsScrollView>
  );
}
