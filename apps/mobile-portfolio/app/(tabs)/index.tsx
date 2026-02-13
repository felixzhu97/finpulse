import { useState } from "react";
import { ActivityIndicator, RefreshControl } from "react-native";
import { ScrollView } from "react-native-gesture-handler";
import { NativeLineChart } from "@/src/presentation/components/native";
import { PortfolioSummary } from "@/src/presentation/components/portfolio/PortfolioSummary";
import { MetricCard } from "@/src/presentation/components/ui/MetricCard";
import { AssetAllocationChart } from "@/src/presentation/components/portfolio/AssetAllocationChart";
import { NetWorthLineChart } from "@/src/presentation/components/portfolio/NetWorthLineChart";
import { usePortfolio, useRefreshControl } from "@/src/presentation/hooks";
import { useTheme } from "@/src/presentation/theme";
import { useTranslation } from "@/src/presentation/i18n";
import {
  ScreenRoot,
  ContentPadding,
  CenteredContainer,
  ErrorText,
  RetryText,
  SectionTitle,
  BlockWithGap,
  ChartCard,
  ChartCardTitle,
} from "@/src/presentation/theme/primitives";
import styled from "styled-components/native";

const StyledScrollView = styled(ScrollView)`
  flex: 1;
  background-color: ${(p) => p.theme.colors.background};
`;

const NativeChartWrapper = styled.View`
  height: 200px;
  margin-bottom: 12px;
`;

export default function DashboardScreen() {
  const { isDark, colors } = useTheme();
  const { t } = useTranslation();
  const {
    portfolio,
    allocation,
    history,
    loading,
    refresh,
  } = usePortfolio();
  const chartTheme = isDark ? "dark" : "light";
  const [chartScrollLock, setChartScrollLock] = useState(false);
  const { refreshing, onRefresh } = useRefreshControl(refresh);

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
      <ScreenRoot>
        <CenteredContainer>
          {loading ? (
            <ActivityIndicator size="small" color={colors.textSecondary} />
          ) : (
            <>
              <ErrorText>{t("dashboard.unableToLoad")}</ErrorText>
              <RetryText onPress={refresh}>{t("dashboard.tapToRetry")}</RetryText>
            </>
          )}
        </CenteredContainer>
      </ScreenRoot>
    );
  }

  return (
    <StyledScrollView
      contentContainerStyle={{ padding: 16, paddingBottom: 32 }}
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
      <BlockWithGap>
        <SectionTitle>{t("dashboard.netWorthTrend")}</SectionTitle>
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
        <ChartCard>
          <ChartCardTitle>{t("dashboard.netWorthNativeChart")}</ChartCardTitle>
          <NativeChartWrapper>
            <NativeLineChart
              data={lineData}
              theme={chartTheme}
              timestamps={lineTimestamps}
              style={{ flex: 1 }}
              onInteractionStart={() => setChartScrollLock(true)}
              onInteractionEnd={() => setChartScrollLock(false)}
            />
          </NativeChartWrapper>
        </ChartCard>
      </BlockWithGap>
    </StyledScrollView>
  );
}
