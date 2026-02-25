import { useMemo, useState, useCallback } from "react";
import { ActivityIndicator, RefreshControl } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { ScrollView } from "react-native-gesture-handler";
import { NativeLineChart } from "@/src/presentation/components/native";
import { PortfolioSummary } from "@/src/presentation/components/portfolio/PortfolioSummary";
import { MetricCard } from "@/src/presentation/components/ui/MetricCard";
import { AssetAllocationChart } from "@/src/presentation/components/portfolio/AssetAllocationChart";
import { NetWorthLineChart } from "@/src/presentation/components/portfolio/NetWorthLineChart";
import { usePortfolio } from "@/src/presentation/hooks";
import { useTheme } from "@/src/presentation/theme";
import { formatScreenDateLong, getCurrencySymbol } from "@/src/presentation/utils";
import { useTranslation } from "@/src/presentation/i18n";
import {
  ScreenRoot,
  CenteredContainer,
  ErrorText,
  RetryText,
  SectionTitle,
  BlockWithGap,
  ChartCard,
  ChartCardTitle,
  SafeAreaScreen,
  ScreenHeader,
  HeaderTitleBlock,
  ScreenTitle,
  ScreenDate,
} from "@/src/presentation/theme/primitives";
import styled from "@emotion/native";

const StyledScrollView = styled(ScrollView)`
  flex: 1;
  background-color: ${(p) => p.theme.colors.background};
`;

const ContentWrap = styled.View`
  padding-horizontal: 16px;
  padding-bottom: 40px;
`;

const Section = styled.View`
  margin-top: 32px;
`;

const SectionHeader = styled.View`
  margin-bottom: 12px;
`;

const NativeChartWrapper = styled.View`
  height: 200px;
  margin-bottom: 12px;
`;

const CARD_RADIUS = 16;

export default function DashboardScreen() {
  const { isDark, colors } = useTheme();
  const { t } = useTranslation();
  const { portfolio, allocation, history, loading, refresh } = usePortfolio();
  const chartTheme = isDark ? "dark" : "light";
  const [chartScrollLock, setChartScrollLock] = useState(false);

  const onRefresh = useCallback(() => {
    refresh();
  }, [refresh]);

  const fallbackTimestamps = useMemo(() => {
    const base = Date.now() - 5 * 24 * 60 * 60 * 1000;
    return [base + 864e5, base + 2 * 864e5, base + 3 * 864e5, base + 4 * 864e5, base + 5 * 864e5];
  }, []);
  const fallbackValues = useMemo(() => [102.4, 101.8, 103.2, 104.6, 103.9], []);

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
    <SafeAreaView style={{ flex: 1 }} edges={["top"]}>
      <SafeAreaScreen>
      <ScreenHeader>
        <HeaderTitleBlock>
          <ScreenTitle>{t("dashboard.title")}</ScreenTitle>
          <ScreenDate>{formatScreenDateLong(new Date())}</ScreenDate>
        </HeaderTitleBlock>
      </ScreenHeader>
      <StyledScrollView
        contentContainerStyle={{ paddingBottom: 40 }}
        scrollEnabled={!chartScrollLock}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={loading}
            onRefresh={onRefresh}
            tintColor={colors.accent}
          />
        }
      >
        <ContentWrap>
          <Section>
            <SectionHeader>
              <SectionTitle>{t("dashboard.overview")}</SectionTitle>
            </SectionHeader>
            <PortfolioSummary portfolio={portfolio} />
          </Section>
          <Section>
            <SectionHeader>
              <SectionTitle>{t("dashboard.netWorthTrend")}</SectionTitle>
            </SectionHeader>
            <BlockWithGap>
              <NetWorthLineChart points={history} baseCurrency={portfolio.baseCurrency} />
              <MetricCard
                label={t("dashboard.accounts")}
                value={String(portfolio.accounts.length)}
                helper={t("dashboard.accountsHelper")}
              />
            </BlockWithGap>
          </Section>
          <Section>
            <SectionHeader>
              <SectionTitle>{t("dashboard.allocation")}</SectionTitle>
            </SectionHeader>
            <AssetAllocationChart
              items={allocation.map((item) => ({
                label: item.type,
                value: item.value,
              }))}
            />
          </Section>
          <Section>
            <ChartCard style={{ borderRadius: CARD_RADIUS, padding: 20 }}>
              <ChartCardTitle>{t("dashboard.netWorthNativeChart")}</ChartCardTitle>
              <NativeChartWrapper>
                <NativeLineChart
                  data={lineData}
                  theme={chartTheme}
                  timestamps={lineTimestamps}
                  currencySymbol={getCurrencySymbol(portfolio.baseCurrency)}
                  style={{ flex: 1 }}
                  onInteractionStart={() => setChartScrollLock(true)}
                  onInteractionEnd={() => setChartScrollLock(false)}
                />
              </NativeChartWrapper>
            </ChartCard>
          </Section>
        </ContentWrap>
      </StyledScrollView>
      </SafeAreaScreen>
    </SafeAreaView>
  );
}
