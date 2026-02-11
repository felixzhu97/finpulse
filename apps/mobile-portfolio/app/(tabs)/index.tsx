import { useCallback, useState } from "react";
import {
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useTheme } from "@react-navigation/native";
import { ScrollView } from "react-native-gesture-handler";
import { NativeLineChart } from "@/src/components/native";
import { PortfolioSummary } from "@/src/components/portfolio/PortfolioSummary";
import { MetricCard } from "@/src/components/ui/MetricCard";
import { AssetAllocationChart } from "@/src/components/portfolio/AssetAllocationChart";
import { NetWorthLineChart } from "@/src/components/portfolio/NetWorthLineChart";
import { usePortfolio } from "@/src/hooks/usePortfolio";

export default function DashboardScreen() {
  const { dark } = useTheme();
  const {
    portfolio,
    allocation,
    history,
    loading,
    error,
    refresh,
  } = usePortfolio();
  const chartTheme = dark ? "dark" : "light";
  const [chartScrollLock, setChartScrollLock] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await refresh();
    setRefreshing(false);
  }, [refresh]);

  const base = Date.now() - 5 * 24 * 60 * 60 * 1000;
  const fallbackTimestamps = [
    base + 1 * 24 * 60 * 60 * 1000,
    base + 2 * 24 * 60 * 60 * 1000,
    base + 3 * 24 * 60 * 60 * 1000,
    base + 4 * 24 * 60 * 60 * 1000,
    base + 5 * 24 * 60 * 60 * 1000,
  ];
  const fallbackValues = [102.4, 101.8, 103.2, 104.6, 103.9];

  const lineData =
    history.length > 0 ? history.map((p) => p.value) : fallbackValues;
  const lineTimestamps =
    history.length > 0
      ? history.map((p) => new Date(p.date).getTime())
      : fallbackTimestamps;

  if (!portfolio) {
    return (
      <View style={styles.centered}>
        <Text style={styles.loadingText}>
          {loading
            ? "Loading portfolio..."
            : "Unable to load portfolio. Start the backend and seed data, then retry."}
        </Text>
        {!loading && (
          <Text style={styles.retryText} onPress={refresh}>
            Tap to retry
          </Text>
        )}
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={styles.content}
      scrollEnabled={!chartScrollLock}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#fff"
          />
        }
    >
      <PortfolioSummary portfolio={portfolio} />
      <View style={styles.block}>
        <Text style={styles.subsectionTitle}>Net worth trend</Text>
        <NetWorthLineChart points={history} />
        <MetricCard
          label="Accounts"
          value={String(portfolio.accounts.length)}
          helper="Total accounts in this portfolio"
        />
        <AssetAllocationChart
          items={allocation.map((item) => ({
            label: item.type,
            value: item.value,
          }))}
        />
        <View style={styles.chartCard}>
          <Text style={styles.chartCardTitle}>Net worth (native chart)</Text>
          <NativeLineChart
            data={lineData}
            theme={chartTheme}
            timestamps={lineTimestamps}
            style={styles.nativeChart}
            onInteractionStart={() => setChartScrollLock(true)}
            onInteractionEnd={() => setChartScrollLock(false)}
          />
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  centered: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#000000",
  },
  screen: {
    flex: 1,
    backgroundColor: "#000000",
  },
  content: {
    padding: 16,
    paddingBottom: 32,
  },
  block: {
    marginTop: 0,
    gap: 12,
  },
  subsectionTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "rgba(255,255,255,0.9)",
    marginBottom: 4,
  },
  loadingText: {
    color: "rgba(255,255,255,0.9)",
    textAlign: "center",
  },
  retryText: {
    color: "#0A84FF",
    marginTop: 12,
  },
  chartCard: {
    backgroundColor: "#000",
    borderRadius: 12,
    padding: 12,
    marginTop: 12,
    overflow: "hidden",
  },
  chartCardTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "rgba(255,255,255,0.9)",
    marginBottom: 8,
  },
  nativeChart: {
    height: 200,
    marginBottom: 12,
  },
});
