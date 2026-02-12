import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Dimensions,
  Platform,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { BarChart } from "react-native-chart-kit";
import { MetricCard } from "@/src/presentation/components/ui/MetricCard";
import { RiskMetricDetailDrawer } from "@/src/presentation/components/insights";
import { useComputedVar } from "@/src/presentation/hooks/useComputedVar";
import { useRiskMetrics } from "@/src/presentation/hooks/useRiskMetrics";
import { container } from "@/src/application";
import { useTheme } from "@/src/presentation/theme";
import { useTranslation } from "@/src/presentation/i18n";

export default function InsightsScreen() {
  const { colors } = useTheme();
  const { t } = useTranslation();
  const { metrics, loading, error, refresh } = useRiskMetrics();
  const { computedVar, loading: varLoading, compute: computeVar } = useComputedVar();
  const [highRatio, setHighRatio] = useState(0);
  const [topConcentration, setTopConcentration] = useState(0);
  const [localLoading, setLocalLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [detailDrawerVisible, setDetailDrawerVisible] = useState(false);
  const [selectedMetric, setSelectedMetric] = useState<{ key: string; value: number } | null>(null);

  useEffect(() => {
    let active = true;
    const load = async () => {
      const portfolioRepository = container.getPortfolioRepository();
      const [risk] = await Promise.all([
        portfolioRepository.getRiskSummary(),
        computeVar(),
      ]);
      if (!active) return;
      setHighRatio(risk.highRatio);
      setTopConcentration(risk.topHoldingsConcentration);
      setLocalLoading(false);
    };
    load();
    return () => {
      active = false;
    };
  }, [computeVar]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    const portfolioRepository = container.getPortfolioRepository();
    await Promise.all([refresh(), computeVar()]);
    const risk = await portfolioRepository.getRiskSummary();
    setHighRatio(risk.highRatio);
    setTopConcentration(risk.topHoldingsConcentration);
    setRefreshing(false);
  }, [refresh, computeVar]);

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
          <View style={styles.overviewSection}>
            <Text style={[styles.sectionHeader, { color: colors.text }]}>
              {t("insights.overview")}
            </Text>
            <View style={styles.overviewGrid}>
              <View style={styles.overviewCard}>
                <MetricCard
                  label={t("insights.highRiskExposure")}
                  value={`${highRiskPercent}%`}
                  tone={highRatio > 0.4 ? "negative" : "default"}
                />
              </View>
              <View style={styles.overviewCard}>
                <MetricCard
                  label={t("insights.top5HoldingsConcentration")}
                  value={`${concentrationPercent}%`}
                  tone={topConcentration > 0.5 ? "negative" : "default"}
                />
              </View>
            </View>
          </View>

          {(computedVar?.var != null || hasApiMetrics) ? (
            <View style={styles.metricsSection}>
              <Text style={[styles.sectionHeader, { color: colors.text }]}>
                {t("insights.riskMetricsApi")}
              </Text>
              <View style={styles.metricsGrid}>
                {computedVar?.var != null && (
                  <View style={styles.metricCard}>
                    <MetricCard
                      label={t("insights.computedVar")}
                      value={computedVar.var.toFixed(4)}
                      onInfoPress={() => {
                        setSelectedMetric({ key: "computedVar", value: computedVar.var! });
                        setDetailDrawerVisible(true);
                      }}
                    />
                  </View>
                )}
                {[
                  { key: "volatility", val: metrics?.volatility, fmt: (v: number) => v.toFixed(4) },
                  { key: "sharpeRatio", val: metrics?.sharpe_ratio, fmt: (v: number) => v.toFixed(2) },
                  { key: "var", val: metrics?.var, fmt: (v: number) => v.toFixed(2) },
                  { key: "beta", val: metrics?.beta, fmt: (v: number) => v.toFixed(2) },
                ]
                  .filter((m) => m.val != null)
                  .map((m) => (
                    <View key={m.key} style={styles.metricCard}>
                      <MetricCard
                        label={t(`insights.${m.key}`)}
                        value={m.fmt(m.val!)}
                        onInfoPress={() => {
                          setSelectedMetric({ key: m.key, value: m.val! });
                          setDetailDrawerVisible(true);
                        }}
                      />
                    </View>
                  ))}
              </View>
            </View>
          ) : null}
          <View style={styles.chartSection}>
            <Text style={[styles.sectionHeader, { color: colors.text }]}>
              {t("insights.riskOverview")}
            </Text>
            <View style={[styles.chartCard, { backgroundColor: colors.card }]}>
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
                backgroundGradientTo: colors.card,
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
              style={styles.barChart}
              verticalLabelRotation={0}
            />
            </View>
          </View>
          <View style={styles.summarySection}>
            <Text style={[styles.sectionHeader, { color: colors.text }]}>
              {t("insights.summary")}
            </Text>
            <View style={[styles.summaryCard, { backgroundColor: colors.card }]}>
              <Text style={[styles.summaryBody, { color: colors.textSecondary }]}>
                {t("insights.summaryBody")}
              </Text>
            </View>
          </View>
        </View>
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
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  content: {
    padding: 20,
    paddingBottom: 40,
  },
  block: {
    gap: 24,
  },
  overviewSection: {
    gap: 12,
  },
  sectionHeader: {
    fontSize: 17,
    fontWeight: "600",
    letterSpacing: -0.3,
    marginBottom: 4,
  },
  overviewGrid: {
    flexDirection: "row",
    gap: 12,
    alignItems: "stretch",
  },
  overviewCard: {
    flex: 1,
  },
  metricsSection: {
    gap: 12,
  },
  metricsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    alignItems: "stretch",
  },
  metricCard: {
    width: "48%",
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
    fontSize: 17,
    fontWeight: "400",
  },
  retryText: {
    marginTop: 16,
    fontSize: 17,
    fontWeight: "500",
  },
  chartSection: {
    gap: 12,
  },
  chartCard: {
    borderRadius: 16,
    padding: 20,
    paddingBottom: 12,
    overflow: "hidden",
    width: "100%",
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  summarySection: {
    gap: 12,
  },
  barChart: {
    marginLeft: -8,
    marginRight: -8,
  },
  summaryCard: {
    padding: 20,
    borderRadius: 16,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  summaryBody: {
    fontSize: 15,
    lineHeight: 22,
    fontWeight: "400",
    letterSpacing: -0.2,
  },
});
