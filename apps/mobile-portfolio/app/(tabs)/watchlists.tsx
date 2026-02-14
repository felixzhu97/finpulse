import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useFocusEffect } from "@react-navigation/native";
import {
  ActivityIndicator,
  Animated,
  FlatList,
  Pressable,
  TextInput,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { SafeAreaView } from "react-native-safe-area-context";
import { AccountListItem } from "@/src/components/account/AccountListItem";
import { StockListItem } from "@/src/components/account/StockListItem";
import {
  StockDetailDrawer,
  type StockDetailItem,
} from "@/src/components/watchlist";
import { GlassView } from "@/src/components/ui/GlassView";
import { SortMenu, type SortOption } from "@/src/components/ui/SortMenu";
import { useSymbolDisplayData } from "@/src/hooks/useSymbolDisplayData";
import type { Account, Holding } from "@/src/lib/types/portfolio";
import { container } from "@/src/lib/services/DependencyContainer";
import { usePortfolio } from "@/src/hooks";
import { useAppDispatch } from "@/src/store";
import { setHistory, setSnapshot } from "@/src/store/quotesSlice";
import { useTheme } from "@/src/theme";
import { useTranslation } from "@/src/lib/i18n";
import {
  SafeAreaScreen,
  ScreenHeader,
  HeaderTitleBlock,
  ScreenTitle,
  ScreenDate,
  HeaderActions,
  IconButton,
  ListContainer,
  CenteredContainer,
  RetryButton,
  RetryButtonText,
  EmptyContainer,
  EmptyText,
  EmptySubtext,
  LoadingWrap,
} from "@/src/theme/primitives";
import styled from "styled-components/native";

const SearchBarContainer = styled(Animated.View)`
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  padding-horizontal: 16px;
  padding-top: 8px;
  padding-bottom: 8px;
`;

const SearchBarRow = styled.View`
  flex-direction: row;
  align-items: center;
  gap: 10px;
  padding: 6px;
`;

const SearchBarWrapper = styled.View`
  flex: 1;
  flex-direction: row;
  align-items: center;
  border-radius: 14px;
  padding-horizontal: 12px;
  padding-vertical: 10px;
  overflow: hidden;
`;

const SearchCloseBtn = styled.Pressable`
  width: 40px;
  height: 40px;
  border-radius: 20px;
  overflow: hidden;
`;

const ClearBtn = styled.Pressable`
  padding: 4px;
  margin-left: 8px;
`;

type ListRow =
  | { type: "stock"; holding: Holding; price: number; change: number }
  | { type: "account"; account: Account };

function formatHeaderDate(locale: string = "en-US") {
  return new Date().toLocaleDateString(locale, {
    month: "long",
    day: "numeric",
  });
}

function buildListRows(
  baseAccounts: Account[],
  quotes: Record<string, { price: number; change: number }>
): ListRow[] {
  const rows: ListRow[] = [];
  for (const account of baseAccounts) {
    const stockHoldings = account.holdings.filter((h) => h.symbol !== "CASH");
    if (stockHoldings.length > 0) {
      for (const h of stockHoldings) {
        const q = quotes[h.symbol.toUpperCase()];
        rows.push({
          type: "stock",
          holding: h,
          price: q?.price ?? h.price,
          change: q?.change ?? 0,
        });
      }
    } else {
      rows.push({ type: "account", account });
    }
  }
  return rows;
}

export default function WatchlistsScreen() {
  const dispatch = useAppDispatch();
  const { colors, isDark } = useTheme();
  const { t, i18n } = useTranslation();
  const { portfolio, history, loading, refresh } = usePortfolio();
  const baseAccounts = portfolio?.accounts ?? [];
  const historyValues = history.map((h) => h.value);
  const [detailItem, setDetailItem] = useState<StockDetailItem | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<SortOption>("name");
  const [showSearchBar, setShowSearchBar] = useState(false);
  const searchInputRef = useRef<TextInput>(null);
  const searchBarAnim = useRef(new Animated.Value(0)).current;

  const listSymbols = useMemo(
    () =>
      Array.from(
        new Set(
          baseAccounts.flatMap((a) =>
            a.holdings.map((h) => h.symbol).filter((s) => s !== "CASH")
          )
        )
      ),
    [baseAccounts]
  );

  const symbols = useMemo(
    () =>
      Array.from(
        new Set([...listSymbols, ...(detailItem ? [detailItem.symbol] : [])])
      ),
    [listSymbols, detailItem?.symbol]
  );

  const initialPrices = useMemo(
    () =>
      Object.fromEntries(
        baseAccounts.flatMap((a) =>
          a.holdings
            .filter((h) => h.symbol !== "CASH")
            .map((h) => [h.symbol.toUpperCase(), h.price])
        )
      ),
    [baseAccounts]
  );

  const { quoteMap, historyBySymbol, bySymbol } = useSymbolDisplayData(
    symbols,
    initialPrices
  );

  const baseRows = useMemo(
    () => buildListRows(baseAccounts, quoteMap),
    [baseAccounts, quoteMap]
  );

  const filteredAndSortedRows = useMemo(() => {
    let filtered = baseRows;
    if (searchQuery.trim()) {
      const query = searchQuery.trim().toUpperCase();
      filtered = filtered.filter((row) => {
        if (row.type === "stock") {
          return (
            row.holding.symbol.toUpperCase().includes(query) ||
            row.holding.name.toUpperCase().includes(query)
          );
        }
        return row.account.name.toUpperCase().includes(query);
      });
    }

    const stockRows = filtered.filter(
      (r): r is Extract<ListRow, { type: "stock" }> => r.type === "stock"
    );
    const accountRows = filtered.filter(
      (r): r is Extract<ListRow, { type: "account" }> => r.type === "account"
    );

    const sortedStocks = [...stockRows].sort((a, b) => {
      switch (sortBy) {
        case "name":
          return a.holding.symbol.localeCompare(b.holding.symbol);
        case "price":
          return b.price - a.price;
        case "change":
          return b.change - a.change;
        case "changePercent":
          const aPercent = a.price > 0 ? (a.change / a.price) * 100 : 0;
          const bPercent = b.price > 0 ? (b.change / b.price) * 100 : 0;
          return bPercent - aPercent;
        default:
          return 0;
      }
    });

    return [...sortedStocks, ...accountRows];
  }, [baseRows, searchQuery, sortBy]);

  const quotesUseCase = useMemo(() => container.getQuotesUseCase(), []);
  const fetchQuotesAndHistory = useCallback(async () => {
    if (symbols.length === 0) return;
    const [historyData, snapshot] = await Promise.all([
      Promise.all(symbols.map((s) => quotesUseCase.getHistory(s, 5))).then(
        (results) => {
          const history: Record<string, number[]> = {};
          symbols.forEach((s, i) => {
            history[s.toUpperCase()] = results[i];
          });
          return history;
        }
      ),
      quotesUseCase.execute(symbols),
    ]).catch(() => [{}, {}] as const);
    dispatch(setHistory(historyData ?? {}));
    dispatch(setSnapshot(snapshot ?? {}));
  }, [symbols.join(","), dispatch, quotesUseCase]);

  useEffect(() => {
    fetchQuotesAndHistory();
  }, [fetchQuotesAndHistory]);

  const handleRefresh = useCallback(async () => {
    await refresh();
    await fetchQuotesAndHistory();
  }, [refresh, fetchQuotesAndHistory]);

  const closeSearchBar = useCallback(() => {
    if (!showSearchBar) return;
    searchInputRef.current?.blur();
    setShowSearchBar(false);
    Animated.spring(searchBarAnim, {
      toValue: 0,
      useNativeDriver: true,
    }).start(() => {
      setSearchQuery("");
    });
  }, [showSearchBar, searchBarAnim]);

  const handleSearchPress = useCallback(() => {
    const nextShow = !showSearchBar;
    setShowSearchBar(nextShow);
    Animated.spring(searchBarAnim, {
      toValue: nextShow ? 1 : 0,
      useNativeDriver: true,
    }).start(() => {
      if (nextShow) {
        setTimeout(() => searchInputRef.current?.focus(), 100);
      } else {
        setSearchQuery("");
      }
    });
  }, [showSearchBar, searchBarAnim]);

  useEffect(() => {
    if (detailItem !== null && showSearchBar) {
      closeSearchBar();
    }
  }, [detailItem, showSearchBar, closeSearchBar]);

  useFocusEffect(
    useCallback(() => {
      void fetchQuotesAndHistory();
      return () => {
        if (showSearchBar) {
          searchInputRef.current?.blur();
          setShowSearchBar(false);
          searchBarAnim.setValue(0);
          setSearchQuery("");
        }
      };
    }, [fetchQuotesAndHistory, showSearchBar, searchBarAnim])
  );

  if (loading) {
    return (
      <SafeAreaView style={{ flex: 1 }} edges={["top"]}>
        <SafeAreaScreen>
          <StatusBar style={isDark ? "light" : "dark"} />
          <LoadingWrap>
            <ActivityIndicator size="small" color={colors.textSecondary} />
          </LoadingWrap>
        </SafeAreaScreen>
      </SafeAreaView>
    );
  }

  if (baseAccounts.length === 0) {
    return (
      <SafeAreaView style={{ flex: 1 }} edges={["top"]}>
        <SafeAreaScreen>
          <StatusBar style={isDark ? "light" : "dark"} />
          <ScreenHeader>
            <ScreenTitle>{t("watchlist.stocks")}</ScreenTitle>
          </ScreenHeader>
          <CenteredContainer>
            <EmptyText>{t("watchlist.startBackendFirst")}</EmptyText>
            <RetryButton onPress={handleRefresh}>
              <RetryButtonText>{t("common.retry")}</RetryButtonText>
            </RetryButton>
          </CenteredContainer>
        </SafeAreaScreen>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1 }} edges={["top"]}>
      <SafeAreaScreen>
        <StatusBar style={isDark ? "light" : "dark"} />
        <ScreenHeader>
          <HeaderTitleBlock>
            <ScreenTitle>{t("watchlist.stocks")}</ScreenTitle>
            <ScreenDate>{formatHeaderDate(i18n.language === "zh" ? "zh-CN" : "en-US")}</ScreenDate>
          </HeaderTitleBlock>
          <HeaderActions>
            <SortMenu
              currentSort={sortBy}
              onSelect={setSortBy}
              onOpen={closeSearchBar}
            />
            <IconButton onPress={handleSearchPress}>
              <MaterialIcons name="search" size={24} color={colors.text} />
            </IconButton>
          </HeaderActions>
        </ScreenHeader>
        <ListContainer>
        <FlatList
          data={filteredAndSortedRows}
          initialNumToRender={12}
          maxToRenderPerBatch={10}
          keyExtractor={(item) =>
            item.type === "stock" ? item.holding.id : item.account.id
          }
          renderItem={({ item }) =>
            item.type === "stock" ? (
              <StockListItem
                holding={item.holding}
                price={item.price}
                change={item.change}
                historyValues={historyBySymbol[item.holding.symbol.toUpperCase()]}
                onPress={() =>
                  setDetailItem({
                    symbol: item.holding.symbol,
                    name: item.holding.name,
                    price: item.price,
                    change: item.change,
                    historyValues:
                      historyBySymbol[item.holding.symbol.toUpperCase()],
                  })
                }
              />
            ) : (
              <AccountListItem
                account={item.account}
                historyValues={historyValues}
              />
            )
          }
          ListEmptyComponent={
            searchQuery.trim() ? (
              <EmptyContainer>
                <EmptyText>{t("watchlist.noStocksFound")}</EmptyText>
                <EmptySubtext>{t("watchlist.tryDifferentSearch")}</EmptySubtext>
              </EmptyContainer>
            ) : null
          }
        />
        </ListContainer>
      <SearchBarContainer
        style={{
          opacity: searchBarAnim,
          transform: [
            {
              translateY: searchBarAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [100, 0],
              }),
            },
          ],
        }}
        pointerEvents={showSearchBar ? "auto" : "none"}
      >
        <GlassView intensity={70} tint="dark" style={{ borderRadius: 20, overflow: "hidden", borderWidth: 1, borderColor: "rgba(255,255,255,0.12)" }}>
          <SearchBarRow>
            <GlassView intensity={50} tint="dark" style={{ flex: 1, flexDirection: "row", alignItems: "center", borderRadius: 14, paddingHorizontal: 12, paddingVertical: 10, overflow: "hidden" }}>
              <MaterialIcons name="search" size={20} color={colors.textSecondary} style={{ marginRight: 8 }} />
              <TextInput
                ref={searchInputRef}
                style={{ flex: 1, fontSize: 17, padding: 0, color: colors.text }}
                placeholder={t("watchlist.searchStocks")}
                placeholderTextColor={colors.textTertiary}
                value={searchQuery}
                onChangeText={setSearchQuery}
                autoCapitalize="none"
                autoCorrect={false}
                returnKeyType="search"
              />
              {searchQuery.length > 0 && (
                <ClearBtn onPress={() => setSearchQuery("")} hitSlop={8}>
                  <MaterialIcons name="close" size={18} color={colors.textSecondary} />
                </ClearBtn>
              )}
            </GlassView>
            <SearchCloseBtn onPress={handleSearchPress} hitSlop={8}>
              <GlassView intensity={60} tint="dark" style={{ flex: 1, width: "100%", height: "100%", borderRadius: 20, alignItems: "center", justifyContent: "center" }}>
                <MaterialIcons name="close" size={24} color={colors.text} />
              </GlassView>
            </SearchCloseBtn>
          </SearchBarRow>
        </GlassView>
      </SearchBarContainer>
      <StockDetailDrawer
        visible={detailItem !== null}
        item={detailItem}
        onClose={() => setDetailItem(null)}
        displayData={
          detailItem
            ? bySymbol[detailItem.symbol.toUpperCase()] ?? null
            : null
        }
      />
      </SafeAreaScreen>
    </SafeAreaView>
  );
}
