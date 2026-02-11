import { useCallback, useState } from "react";
import {
  ActivityIndicator,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useTheme as useNavTheme } from "@react-navigation/native";
import { ScrollView } from "react-native-gesture-handler";
import { NativeLineChart } from "@/src/components/native";
import { PortfolioSummary } from "@/src/components/portfolio/PortfolioSummary";
import { MetricCard } from "@/src/components/ui/MetricCard";
import { AssetAllocationChart } from "@/src/components/portfolio/AssetAllocationChart";
import { NetWorthLineChart } from "@/src/components/portfolio/NetWorthLineChart";
import { usePortfolio } from "@/src/hooks/usePortfolio";
import { useTheme } from "@/src/theme";
import { useTranslation } from "@/src/i18n";

export default function DashboardScreen() {
  const { isDark, colors } = useTheme();
  const { t } = useTranslation();
  const {
    portfolio,
    allocation,
    history,
    loading,
    error,
    refresh,
  } = usePortfolio();
  const chartTheme = isDark ? "dark" : "light";
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
      <View style={[styles.centered, { backgroundColor: colors.background }]}>
        {loading ? (
          <ActivityIndicator size="small" color={colors.textSecondary} />
        ) : (
          <>
            <Text style={[styles.errorText, { color: colors.textSecondary }]}>
              {t("dashboard.unableToLoad")}
            </Text>
            <Text style={[styles.retryText, { color: colors.primary }]} onPress={refresh}>
              {t("dashboard.tapToRetry")}
            </Text>
          </>
        )}
      </View>
    );
  }

  return (
    <ScrollView
      style={[styles.screen, { backgroundColor: colors.background }]}
      contentContainerStyle={styles.content}
      scrollEnabled={!chartScrollLock}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.primary}
          />
        }
    >
      <PortfolioSummary portfolio={portfolio} />
      <View style={styles.block}>
        <Text style={[styles.subsectionTitle, { color: colors.text }]}>{t("dashboard.netWorthTrend")}</Text>
        <NetWorthLineChart points={history} />
        <MetricCard
          label={t("dashboard.accounts")}
          value={String(portfolio.accounts.length)}
          helper={t("dashboard.accountsHelper")}
        />
        <AssetAllocationChart
          items={allocation.map((item) => ({
            label: item.type,
            value: item.value,
          }))}
        />
        <View style={[styles.chartCard, { backgroundColor: colors.card }]}>
          <Text style={[styles.chartCardTitle, { color: colors.text }]}>{t("dashboard.netWorthNativeChart")}</Text>
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
  },
  screen: {
    flex: 1,
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
    marginBottom: 4,
  },
  errorText: {
    textAlign: "center",
    fontSize: 15,
    marginBottom: 8,
  },
  retryText: {
    marginTop: 12,
    fontSize: 15,
    fontWeight: "500",
  },
  chartCard: {
    borderRadius: 12,
    padding: 12,
    marginTop: 12,
    overflow: "hidden",
  },
  chartCardTitle: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 8,
  },
  nativeChart: {
    height: 200,
    marginBottom: 12,
  },
});
