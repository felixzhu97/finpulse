import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import concat from "lodash/concat";
import filter from "lodash/filter";
import flow from "lodash/flow";
import get from "lodash/get";
import map from "lodash/map";
import orderBy from "lodash/orderBy";
import trim from "lodash/trim";
import uniq from "lodash/uniq";
import uniqBy from "lodash/uniqBy";
import zipObject from "lodash/zipObject";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useFocusEffect } from "@react-navigation/native";
import {
  ActivityIndicator,
  Animated,
  FlatList,
  TextInput,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  StockDetailDrawer,
  type StockDetailItem,
} from "@/src/presentation/components/watchlist";
import { WatchlistItemRow } from "@/src/presentation/components/watchlist/WatchlistItemRow";
import { GlassView } from "@/src/presentation/components/ui/GlassView";
import { SortMenu, type SortOption } from "@/src/presentation/components/ui/SortMenu";
import { useSymbolDisplayData } from "@/src/presentation/hooks/useSymbolDisplayData";
import type { Instrument } from "@/src/domain/entities/instrument";
import { container } from "@/src/application";
import { useWatchlists } from "@/src/presentation/hooks";
import { useAppDispatch } from "@/src/presentation/store";
import { setHistory, setSnapshot } from "@/src/presentation/store/quotesSlice";
import { useTheme } from "@/src/presentation/theme";
import { useTranslation } from "@/src/presentation/i18n";
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
} from "@/src/presentation/theme/primitives";
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

interface WatchlistStockRow {
  instrument_id: string;
  symbol: string;
  name: string | null;
  price: number;
  change: number;
}

function buildStocksFromInstruments(instruments: Instrument[]): { instrument_id: string; symbol: string; name: string | null }[] {
  return uniqBy(
    map(instruments, (i) => ({
      instrument_id: i.instrument_id,
      symbol: i.symbol,
      name: i.name ?? null,
    })),
    "instrument_id"
  );
}

function formatHeaderDate(locale: string = "en-US") {
  return new Date().toLocaleDateString(locale, {
    month: "long",
    day: "numeric",
  });
}

export default function WatchlistsScreen() {
  const dispatch = useAppDispatch();
  const { colors, isDark } = useTheme();
  const { t, i18n } = useTranslation();
  const { instruments, loading, refresh } = useWatchlists();
  const [detailItem, setDetailItem] = useState<StockDetailItem | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<SortOption>("name");
  const [showSearchBar, setShowSearchBar] = useState(false);
  const searchInputRef = useRef<TextInput>(null);
  const searchBarAnim = useRef(new Animated.Value(0)).current;

  const watchlistStocks = useMemo(
    () => buildStocksFromInstruments(instruments),
    [instruments]
  );

  const symbols = useMemo(
    () =>
      uniq(
        concat(
          map(watchlistStocks, "symbol"),
          detailItem ? [detailItem.symbol] : []
        )
      ),
    [watchlistStocks, detailItem?.symbol]
  );

  const initialPrices = useMemo(() => ({}), []);

  const { quoteMap, historyBySymbol, bySymbol } = useSymbolDisplayData(
    symbols,
    initialPrices
  );

  const baseRows = useMemo(
    (): WatchlistStockRow[] =>
      map(watchlistStocks, (stock) => {
        const quote = get(quoteMap, stock.symbol.toUpperCase(), {});
        return {
          instrument_id: stock.instrument_id,
          symbol: stock.symbol,
          name: stock.name,
          price: get(quote, "price", 0),
          change: get(quote, "change", 0),
        };
      }),
    [watchlistStocks, quoteMap]
  );

  const filteredAndSortedRows = useMemo(() => {
    const query = trim(searchQuery).toUpperCase();
    const matchesQuery = (row: WatchlistStockRow) =>
      row.symbol.toUpperCase().includes(query) ||
      (row.name?.toUpperCase().includes(query) ?? false);
    const sortIteratee =
      sortBy === "changePercent"
        ? (row: WatchlistStockRow) => (row.price > 0 ? (row.change / row.price) * 100 : 0)
        : sortBy;
    const sortOrder = sortBy === "name" ? "asc" : "desc";
    return flow([
      (rows: WatchlistStockRow[]) => (query ? filter(rows, matchesQuery) : rows),
      (rows: WatchlistStockRow[]) => orderBy(rows, sortIteratee, sortOrder),
    ])(baseRows);
  }, [baseRows, searchQuery, sortBy]);

  const quotesUseCase = useMemo(() => container.getQuotesUseCase(), []);
  const fetchQuotesAndHistory = useCallback(async () => {
    if (symbols.length === 0) return;
    const keys = map(symbols, (s) => s.toUpperCase());
    const [historyResults, snapshot] = await Promise.all([
      Promise.all(map(symbols, (s) => quotesUseCase.getHistory(s, 5))),
      quotesUseCase.execute(symbols),
    ]).catch(() => [[], {}] as const);
    const historyData = historyResults.length > 0 ? zipObject(keys, historyResults) : {};
    dispatch(setHistory(historyData));
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
          {watchlistStocks.length === 0 ? (
            <CenteredContainer>
              <EmptyText>{t("watchlist.emptyWatchlist")}</EmptyText>
              <RetryButton onPress={handleRefresh}>
                <RetryButtonText>{t("common.retry")}</RetryButtonText>
              </RetryButton>
            </CenteredContainer>
          ) : (
            <FlatList
              data={filteredAndSortedRows}
              initialNumToRender={12}
              maxToRenderPerBatch={10}
              keyExtractor={(item) => item.instrument_id}
              renderItem={({ item }) => (
                <WatchlistItemRow
                  symbol={item.symbol}
                  name={item.name}
                  price={item.price}
                  change={item.change}
                  historyValues={historyBySymbol[item.symbol.toUpperCase()]}
                  onPress={() =>
                    setDetailItem({
                      symbol: item.symbol,
                      name: item.name ?? null,
                      price: item.price,
                      change: item.change,
                      historyValues: historyBySymbol[item.symbol.toUpperCase()],
                    })
                  }
                />
              )}
              ListEmptyComponent={
                trim(searchQuery) ? (
                  <EmptyContainer>
                    <EmptyText>{t("watchlist.noStocksFound")}</EmptyText>
                    <EmptySubtext>{t("watchlist.tryDifferentSearch")}</EmptySubtext>
                  </EmptyContainer>
                ) : null
              }
            />
          )}
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
              ? get(bySymbol, detailItem.symbol.toUpperCase(), null)
              : null
          }
        />
      </SafeAreaScreen>
    </SafeAreaView>
  );
}
