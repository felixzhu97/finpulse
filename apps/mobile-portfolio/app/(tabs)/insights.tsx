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

export default function InsightsScreen() {
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
      ? "High exposure to high-risk assets."
      : "High-risk exposure is moderate.";

  const concentrationText =
    topConcentration > 0.5
      ? "Portfolio is highly concentrated in top holdings."
      : "Portfolio concentration looks balanced.";

  const width = Dimensions.get("window").width - 32;

  if (error && !metrics && !localLoading) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>
          Unable to load analytics. Start the backend and try again.
        </Text>
        <Text style={styles.retryText} onPress={onRefresh}>
          Tap to retry
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
      style={styles.screen}
      contentContainerStyle={styles.content}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          tintColor="#fff"
        />
      }
    >
      {loading && !metrics && localLoading ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color="#0A84FF" />
          <Text style={styles.loadingText}>Loading insights...</Text>
        </View>
      ) : (
        <View style={styles.block}>
          <MetricCard
            label="High-risk exposure"
            value={`${highRiskPercent}%`}
            helper={highRiskText}
            tone={highRatio > 0.4 ? "negative" : "default"}
          />
          <MetricCard
            label="Top 5 holdings concentration"
            value={`${concentrationPercent}%`}
            helper={concentrationText}
            tone={topConcentration > 0.5 ? "negative" : "default"}
          />
          {hasApiMetrics ? (
            <View style={styles.apiSection}>
              <Text style={styles.sectionTitle}>Risk metrics (API)</Text>
              {metrics.volatility != null && (
                <MetricCard
                  label="Volatility"
                  value={metrics.volatility.toFixed(4)}
                  helper="Annualized volatility"
                />
              )}
              {metrics.sharpe_ratio != null && (
                <MetricCard
                  label="Sharpe ratio"
                  value={metrics.sharpe_ratio.toFixed(2)}
                  helper="Risk-adjusted return"
                />
              )}
              {metrics.var != null && (
                <MetricCard
                  label="VaR"
                  value={metrics.var.toFixed(2)}
                  helper="Value at risk"
                />
              )}
              {metrics.beta != null && (
                <MetricCard
                  label="Beta"
                  value={metrics.beta.toFixed(2)}
                  helper="Market sensitivity"
                />
              )}
            </View>
          ) : null}
          <View style={styles.chartCard}>
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
                backgroundGradientFrom: "#000000",
                backgroundGradientTo: "#000000",
                color: () => "#6366f1",
                labelColor: () => "rgba(255,255,255,0.7)",
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
          <View style={styles.summaryCard}>
            <Text style={styles.summaryTitle}>Summary</Text>
            <Text style={styles.summaryBody}>
              Portfolio risk and concentration from holdings. When available,
              server risk metrics (volatility, Sharpe, VaR, beta) are shown
              above.
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
    backgroundColor: "#000000",
  },
  content: {
    padding: 16,
    paddingBottom: 32,
  },
  block: {
    gap: 16,
  },
  centered: {
    flex: 1,
    minHeight: 200,
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  loadingText: {
    color: "rgba(255,255,255,0.7)",
    marginTop: 12,
  },
  errorText: {
    color: "#f87171",
    textAlign: "center",
  },
  retryText: {
    color: "#0A84FF",
    marginTop: 12,
  },
  apiSection: {
    gap: 12,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "rgba(255,255,255,0.9)",
    marginBottom: 4,
  },
  chartCard: {
    borderRadius: 12,
    backgroundColor: "#000000",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
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
    backgroundColor: "#000000",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
  },
  summaryTitle: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 8,
    color: "rgba(255,255,255,0.9)",
  },
  summaryBody: {
    fontSize: 13,
    color: "rgba(255,255,255,0.6)",
    lineHeight: 18,
  },
});
