import { useEffect, useState } from "react";
import { Text, View } from "react-native";
import { ScrollView } from "react-native-gesture-handler";
import { NativeLineChart, NativeDemoCard } from "@/src/components/native";
import { PortfolioSummary } from "@/src/components/PortfolioSummary";
import {
  getPortfolio,
  getAssetAllocationByAccountType,
  getPortfolioHistory,
} from "@/src/services/portfolioService";
import { MetricCard } from "@/src/components/MetricCard";
import { AssetAllocationChart } from "@/src/components/AssetAllocationChart";
import { NetWorthLineChart } from "@/src/components/NetWorthLineChart";
import { ProfessionalStockChart } from "@/src/components/ProfessionalStockChart";
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

  useEffect(() => {
    let active = true;

    const load = async () => {
      const p = await getPortfolio();
      const a = await getAssetAllocationByAccountType();
      const h = await getPortfolioHistory();

      if (!active) {
        return;
      }

      setPortfolio(p);
      setAllocation(a);
      setHistory(h);
    };

    load();

    return () => {
      active = false;
    };
  }, []);

  if (!portfolio) {
    return (
      <View
        style={{
          flex: 1,
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#f3f4f6",
        }}
      >
        <Text>Loading portfolio...</Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: "#f3f4f6" }}
      contentContainerStyle={{ padding: 16, paddingBottom: 32 }}
      scrollEnabled={!chartScrollLock}
    >
      <PortfolioSummary portfolio={portfolio} />
      <Text
        style={{
          fontSize: 14,
          fontWeight: "600",
          color: "#111827",
          marginTop: 24,
          marginBottom: 8,
        }}
      >
        Native demo card (iOS/Android view)
      </Text>
      <NativeDemoCard
        title="Native demo card (iOS/Android)"
        style={{ height: 80, marginBottom: 24, borderRadius: 12 }}
      />
      <View style={{ marginTop: 0, gap: 12 }}>
        <Text
          style={{
            fontSize: 14,
            fontWeight: "600",
            color: "#111827",
            marginBottom: 4,
          }}
        >
          Net worth trend
        </Text>
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
        <Text
          style={{
            fontSize: 14,
            fontWeight: "600",
            color: "#111827",
            marginTop: 12,
            marginBottom: 4,
          }}
        >
          Native line chart (Metal / OpenGL ES)
        </Text>
        <NativeLineChart
          data={history.length > 0 ? history.map((p) => p.value) : stockLinePoints.map((p) => p.value)}
          timestamps={history.length > 0 ? history.map((p) => new Date(p.date).getTime()) : stockLinePoints.map((p) => p.timestamp)}
          style={{ height: 200, marginBottom: 12 }}
          onInteractionStart={() => setChartScrollLock(true)}
          onInteractionEnd={() => setChartScrollLock(false)}
        />
        <Text
          style={{
            fontSize: 14,
            fontWeight: "600",
            color: "#111827",
            marginTop: 12,
            marginBottom: 4,
          }}
        >
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

