import { useCallback, useState } from "react";
import {
  ActivityIndicator,
  Dimensions,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { BarChart } from "react-native-chart-kit";
import { MetricCard } from "@/src/components/ui/MetricCard";
import { useRiskMetrics } from "@/src/hooks";
import { portfolioApi } from "@/src/api";
import { useEffect } from "react";
import { useTheme } from "@/src/theme";
import { useTranslation } from "@/src/i18n";

export default function InsightsScreen() {
  const { colors } = useTheme();
  const { t } = useTranslation();
  const { metrics, loading, error, refresh } = useRiskMetrics();
  const [highRatio, setHighRatio] = useState(0);
  const [topConcentration, setTopConcentration] = useState(0);
  const [localLoading, setLocalLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    let active = true;
    const load = async () => {
      const risk = await portfolioApi.getRiskSummary();
      if (!active) return;
      setHighRatio(risk.highRatio);
      setTopConcentration(risk.topHoldingsConcentration);
      setLocalLoading(false);
    };
    load();
    return () => {
      active = false;
    };
  }, []);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await refresh();
    const risk = await portfolioApi.getRiskSummary();
    setHighRatio(risk.highRatio);
    setTopConcentration(risk.topHoldingsConcentration);
    setRefreshing(false);
  }, [refresh]);

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

  const width = Dimensions.get("window").width - 32;

  if (error && !metrics && !localLoading) {
    return (
      <View style={[styles.centered, { backgroundColor: colors.background }]}>
        <Text style={[styles.errorText, { color: colors.error }]}>
          {t("insights.unableToLoad")}
        </Text>
        <Text style={[styles.retryText, { color: colors.primary }]} onPress={onRefresh}>
          {t("insights.tapToRetry")}
        </Text>
      </View>
    );
  }

  const hasApiMetrics =
    metrics &&
    (metrics.volatility != null ||
      metrics.sharpe_ratio != null ||
      metrics.var != null ||
      metrics.beta != null);

  return (
    <ScrollView
      style={[styles.screen, { backgroundColor: colors.background }]}
      contentContainerStyle={styles.content}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          tintColor={colors.primary}
        />
      }
    >
      {loading && !metrics && localLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="small" color={colors.textSecondary} />
        </View>
      ) : (
        <View style={styles.block}>
          <MetricCard
            label={t("insights.highRiskExposure")}
            value={`${highRiskPercent}%`}
            helper={highRiskText}
            tone={highRatio > 0.4 ? "negative" : "default"}
          />
          <MetricCard
            label={t("insights.top5HoldingsConcentration")}
            value={`${concentrationPercent}%`}
            helper={concentrationText}
            tone={topConcentration > 0.5 ? "negative" : "default"}
          />
          {hasApiMetrics ? (
            <View style={styles.apiSection}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>{t("insights.riskMetricsApi")}</Text>
              {metrics.volatility != null && (
                <MetricCard
                  label={t("insights.volatility")}
                  value={metrics.volatility.toFixed(4)}
                  helper={t("insights.volatilityHelper")}
                />
              )}
              {metrics.sharpe_ratio != null && (
                <MetricCard
                  label={t("insights.sharpeRatio")}
                  value={metrics.sharpe_ratio.toFixed(2)}
                  helper={t("insights.sharpeRatioHelper")}
                />
              )}
              {metrics.var != null && (
                <MetricCard
                  label={t("insights.var")}
                  value={metrics.var.toFixed(2)}
                  helper={t("insights.varHelper")}
                />
              )}
              {metrics.beta != null && (
                <MetricCard
                  label={t("insights.beta")}
                  value={metrics.beta.toFixed(2)}
                  helper={t("insights.betaHelper")}
                />
              )}
            </View>
          ) : null}
          <View style={[styles.chartCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
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
              width={width}
              height={200}
              fromZero
              yAxisLabel=""
              yAxisSuffix="%"
              chartConfig={{
                backgroundGradientFrom: colors.background,
                backgroundGradientTo: colors.background,
                color: () => colors.primary,
                labelColor: () => colors.textSecondary,
                decimalPlaces: 1,
                propsForBackgroundLines: {
                  strokeWidth: 0,
                },
              }}
              withInnerLines={false}
              showBarTops={false}
              style={styles.barChart}
            />
          </View>
          <View style={[styles.summaryCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={[styles.summaryTitle, { color: colors.text }]}>{t("insights.summary")}</Text>
            <Text style={[styles.summaryBody, { color: colors.textSecondary }]}>
              {t("insights.summaryBody")}
            </Text>
          </View>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  content: {
    padding: 16,
    paddingBottom: 32,
  },
  block: {
    gap: 16,
  },
  loadingContainer: {
    flex: 1,
    minHeight: 300,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 60,
  },
  centered: {
    flex: 1,
    minHeight: 200,
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  errorText: {
    textAlign: "center",
  },
  retryText: {
    marginTop: 12,
  },
  apiSection: {
    gap: 12,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 4,
  },
  chartCard: {
    borderRadius: 12,
    borderWidth: StyleSheet.hairlineWidth,
    paddingVertical: 8,
    overflow: "hidden",
    width: "100%",
  },
  barChart: {
    marginLeft: -16,
  },
  summaryCard: {
    padding: 12,
    borderRadius: 12,
    borderWidth: StyleSheet.hairlineWidth,
  },
  summaryTitle: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 8,
  },
  summaryBody: {
    fontSize: 13,
    lineHeight: 18,
  },
});
