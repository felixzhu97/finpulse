import { useCallback, useEffect, useState } from "react";
import {
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { ScrollView } from "react-native-gesture-handler";
import {
  NativeLineChart,
  NativeDemoCard,
  NativeCandleChart,
  NativeAmericanLineChart,
  NativeBaselineChart,
  NativeHistogramChart,
  NativeLineOnlyChart,
} from "@/src/components/native";
import { PortfolioSummary } from "@/src/components/portfolio/PortfolioSummary";
import {
  getPortfolio,
  getAssetAllocationByAccountType,
  getPortfolioHistory,
  invalidatePortfolioCache,
} from "@/src/services/portfolioService";
import { MetricCard } from "@/src/components/ui/MetricCard";
import { AssetAllocationChart } from "@/src/components/portfolio/AssetAllocationChart";
import { NetWorthLineChart } from "@/src/components/portfolio/NetWorthLineChart";
import { ProfessionalStockChart } from "@/src/components/charts/ProfessionalStockChart";
import type {
  Account,
  Portfolio,
  PortfolioHistoryPoint,
} from "@/src/types/portfolio";

export default function DashboardScreen() {
  const [portfolio, setPortfolio] = useState<Portfolio | null>(null);
  const [allocation, setAllocation] = useState<
    { type: Account["type"]; value: number }[]
  >([]);
  const [history, setHistory] = useState<PortfolioHistoryPoint[]>([]);
  const [chartScrollLock, setChartScrollLock] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [loaded, setLoaded] = useState(false);

  const base = Date.now() - 5 * 24 * 60 * 60 * 1000;

  const stockLinePoints = [
    { timestamp: base + 1 * 24 * 60 * 60 * 1000, value: 102.4 },
    { timestamp: base + 2 * 24 * 60 * 60 * 1000, value: 101.8 },
    { timestamp: base + 3 * 24 * 60 * 60 * 1000, value: 103.2 },
    { timestamp: base + 4 * 24 * 60 * 60 * 1000, value: 104.6 },
    { timestamp: base + 5 * 24 * 60 * 60 * 1000, value: 103.9 },
  ];

  const stockCandlePoints = [
    {
      timestamp: base + 1 * 24 * 60 * 60 * 1000,
      open: 102.4,
      high: 105.2,
      low: 101.8,
      close: 103.5,
    },
    {
      timestamp: base + 2 * 24 * 60 * 60 * 1000,
      open: 103.5,
      high: 104.1,
      low: 100.9,
      close: 101.2,
    },
    {
      timestamp: base + 3 * 24 * 60 * 60 * 1000,
      open: 101.2,
      high: 104.8,
      low: 100.5,
      close: 104.3,
    },
    {
      timestamp: base + 4 * 24 * 60 * 60 * 1000,
      open: 104.3,
      high: 106.0,
      low: 103.6,
      close: 105.8,
    },
    {
      timestamp: base + 5 * 24 * 60 * 60 * 1000,
      open: 105.8,
      high: 107.2,
      low: 104.9,
      close: 106.4,
    },
  ];

  const lineData =
    history.length > 0
      ? history.map((p) => p.value)
      : stockLinePoints.map((p) => p.value);
  const ohlcData = stockCandlePoints.flatMap((c) => [
    c.open,
    c.high,
    c.low,
    c.close,
  ]);
  const baselineVal =
    lineData.length > 0
      ? lineData.reduce((a, b) => a + b, 0) / lineData.length
      : 102;

  const load = useCallback(async () => {
    const p = await getPortfolio();
    const a = await getAssetAllocationByAccountType();
    const h = await getPortfolioHistory();
    setPortfolio(p);
    setAllocation(a);
    setHistory(h);
    setLoaded(true);
  }, []);

  useEffect(() => {
    let active = true;
    const run = async () => {
      await load();
      if (!active) return;
    };
    run();
    return () => {
      active = false;
    };
  }, [load]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    invalidatePortfolioCache();
    await load();
    setRefreshing(false);
  }, [load]);

  if (!portfolio) {
    return (
      <View style={styles.centered}>
        <Text>
          {loaded
            ? "Unable to load portfolio. Start backend (pnpm dev:api), then run pnpm generate-seed-data to seed the database."
            : "Loading portfolio..."}
        </Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={styles.content}
      scrollEnabled={!chartScrollLock}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      <PortfolioSummary portfolio={portfolio} />
      <Text style={styles.sectionTitle}>Native demo card (iOS/Android view)</Text>
      <NativeDemoCard
        title="Native demo card (iOS/Android)"
        style={styles.nativeCard}
      />
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
          <Text style={styles.chartCardTitle}>
            Native line chart (Metal / OpenGL ES)
          </Text>
          <NativeLineChart
            data={lineData}
            timestamps={
              history.length > 0
                ? history.map((p) => new Date(p.date).getTime())
                : stockLinePoints.map((p) => p.timestamp)
            }
            style={styles.nativeChart}
            
            onInteractionStart={() => setChartScrollLock(true)}
            onInteractionEnd={() => setChartScrollLock(false)}
          />
        </View>
        <View style={styles.chartCard}>
          <Text style={styles.chartCardTitle}>
            Native charts (scroll horizontally for history)
          </Text>
          <Text style={styles.chartDarkLabel}>K-line (Candlestick)</Text>
          <NativeCandleChart data={ohlcData}  style={styles.nativeChart} />
          <Text style={styles.chartDarkLabel}>Line</Text>
          <NativeLineOnlyChart data={lineData}  style={styles.nativeChart} />
          <Text style={styles.chartDarkLabel}>American line (OHLC)</Text>
          <NativeAmericanLineChart data={ohlcData}  style={styles.nativeChart} />
          <Text style={styles.chartDarkLabel}>Baseline</Text>
          <NativeBaselineChart
            data={lineData}
            baselineValue={baselineVal}
            
            style={styles.nativeChart}
          />
          <Text style={styles.chartDarkLabel}>Histogram</Text>
          <NativeHistogramChart data={lineData}  style={styles.nativeChart} />
        </View>
        <Text style={[styles.subsectionTitle, styles.subsectionTitleSpaced]}>
          Sample professional stock chart
        </Text>
        <ProfessionalStockChart
          linePoints={stockLinePoints}
          candlePoints={stockCandlePoints}
        />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  centered: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#f3f4f6",
  },
  screen: {
    flex: 1,
    backgroundColor: "#f3f4f6",
  },
  content: {
    padding: 16,
    paddingBottom: 32,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#111827",
    marginTop: 24,
    marginBottom: 8,
  },
  nativeCard: {
    height: 80,
    marginBottom: 24,
    borderRadius: 12,
  },
  block: {
    marginTop: 0,
    gap: 12,
  },
  subsectionTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#111827",
    marginBottom: 4,
  },
  subsectionTitleSpaced: {
    marginTop: 12,
  },
  chartLabel: {
    fontSize: 12,
    fontWeight: "500",
    color: "#6b7280",
    marginTop: 8,
    marginBottom: 2,
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
  chartDarkLabel: {
    fontSize: 12,
    fontWeight: "500",
    color: "rgba(255,255,255,0.7)",
    marginTop: 8,
    marginBottom: 2,
  },
  nativeChart: {
    height: 200,
    marginBottom: 12,
  },
});
