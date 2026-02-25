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
import { memo, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useFocusEffect } from "@react-navigation/native";
import { ActivityIndicator, FlatList } from "react-native";
import { StatusBar } from "expo-status-bar";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  StockDetailDrawer,
  type StockDetailItem,
  WatchlistSearchBar,
  type WatchlistSearchBarRef,
} from "@/src/presentation/components/watchlist";
import { WatchlistItemRow } from "@/src/presentation/components/watchlist/WatchlistItemRow";
import { SortMenu, type SortOption } from "@/src/presentation/components/ui/SortMenu";
import { useSymbolDisplayData, useWatchlists, useQuotesForSymbols } from "@/src/presentation/hooks";
import type { Instrument } from "@/src/domain/entities/instrument";
import { useTheme } from "@/src/presentation/theme";
import { useTranslation } from "@/src/presentation/i18n";
import { formatScreenDate } from "@/src/presentation/utils";
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

const WatchlistRow = memo(function WatchlistRow({
  item,
  historyValues,
  onSelectItem,
}: {
  item: WatchlistStockRow;
  historyValues: number[] | undefined;
  onSelectItem: (payload: StockDetailItem) => void;
}) {
  const onPress = useCallback(() => {
    onSelectItem({
      symbol: item.symbol,
      name: item.name ?? null,
      price: item.price,
      change: item.change,
      historyValues,
    });
  }, [item.symbol, item.name, item.price, item.change, historyValues, onSelectItem]);
  return (
    <WatchlistItemRow
      symbol={item.symbol}
      name={item.name}
      price={item.price}
      change={item.change}
      historyValues={historyValues}
      onPress={onPress}
    />
  );
});

export default function WatchlistsScreen() {
  const { colors, isDark } = useTheme();
  const { t, i18n } = useTranslation();
  const { instruments, loading, refresh } = useWatchlists();
  const [detailItem, setDetailItem] = useState<StockDetailItem | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<SortOption>("name");
  const [showSearchBar, setShowSearchBar] = useState(false);
  const searchBarRef = useRef<WatchlistSearchBarRef>(null);

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
  const [visibleSymbols, setVisibleSymbols] = useState<string[]>([]);

  const subscribeSymbols = visibleSymbols.length > 0 ? visibleSymbols : symbols;

  const { quoteMap, historyBySymbol, bySymbol } = useSymbolDisplayData(
    symbols,
    initialPrices,
    subscribeSymbols
  );
  const { refreshQuotes } = useQuotesForSymbols(symbols);

  const onViewableItemsChanged = useRef(
    (info: { viewableItems: Array<{ item: WatchlistStockRow }> }) => {
      const syms = uniq(map(info.viewableItems, (v) => v.item.symbol.toUpperCase()));
      setVisibleSymbols(syms);
    }
  ).current;
  const viewabilityConfig = useRef({
    itemVisiblePercentThreshold: 50,
    minimumViewTime: 100,
  }).current;

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

  const handleRefresh = useCallback(async () => {
    await refresh();
    await refreshQuotes();
  }, [refresh, refreshQuotes]);

  const closeSearchBar = useCallback(() => {
    if (!showSearchBar) return;
    searchBarRef.current?.blur();
    setShowSearchBar(false);
    setSearchQuery("");
  }, [showSearchBar]);

  const handleSearchPress = useCallback(() => {
    if (showSearchBar) {
      closeSearchBar();
    } else {
      setShowSearchBar(true);
    }
  }, [showSearchBar, closeSearchBar]);

  useEffect(() => {
    if (detailItem !== null && showSearchBar) {
      closeSearchBar();
    }
  }, [detailItem, showSearchBar, closeSearchBar]);

  useFocusEffect(
    useCallback(() => {
      void refreshQuotes();
      return () => {
        if (showSearchBar) {
          searchBarRef.current?.blur();
          setShowSearchBar(false);
          setSearchQuery("");
        }
      };
    }, [refreshQuotes, showSearchBar])
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
            <ScreenDate>{formatScreenDate(new Date(), i18n.language === "zh" ? "zh-CN" : "en-US")}</ScreenDate>
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
              onViewableItemsChanged={onViewableItemsChanged}
              viewabilityConfig={viewabilityConfig}
              keyExtractor={(item) => item.instrument_id}
              contentContainerStyle={{ paddingBottom: 40 }}
              showsVerticalScrollIndicator={false}
              renderItem={({ item }) => (
                <WatchlistRow
                  item={item}
                  historyValues={historyBySymbol[item.symbol.toUpperCase()]}
                  onSelectItem={setDetailItem}
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
        <WatchlistSearchBar
          ref={searchBarRef}
          visible={showSearchBar}
          searchQuery={searchQuery}
          onChangeQuery={setSearchQuery}
          onClose={closeSearchBar}
          placeholder={t("watchlist.searchStocks")}
        />
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
