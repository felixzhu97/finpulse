import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useFocusEffect } from "@react-navigation/native";
import {
  ActivityIndicator,
  Animated,
  FlatList,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  TextInput,
  View,
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
import type { Account, Holding } from "@/src/types/portfolio";
import { portfolioApi } from "@/src/api";
import { useTheme } from "@/src/theme";
import { useTranslation } from "@/src/i18n";

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
  const { colors } = useTheme();
  const { t, i18n } = useTranslation();
  const [baseAccounts, setBaseAccounts] = useState<Account[]>([]);
  const [historyValues, setHistoryValues] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
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

  const load = useCallback(async () => {
    const portfolio = await portfolioApi.getPortfolio();
    setBaseAccounts(portfolio?.accounts ?? []);
    setHistoryValues(portfolio?.history.map((h) => h.value) ?? []);
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    portfolioApi.invalidateCache();
    await load();
    setRefreshing(false);
  }, [load]);

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
      return () => {
        if (showSearchBar) {
          searchInputRef.current?.blur();
          setShowSearchBar(false);
          searchBarAnim.setValue(0);
          setSearchQuery("");
        }
      };
    }, [showSearchBar, searchBarAnim])
  );

  if (loading) {
    return (
      <SafeAreaView style={[styles.screen, { backgroundColor: colors.background }]}>
        <StatusBar style={colors.isDark ? "light" : "dark"} />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="small" color={colors.textSecondary} />
        </View>
      </SafeAreaView>
    );
  }

  if (baseAccounts.length === 0) {
    return (
      <SafeAreaView style={[styles.screen, { backgroundColor: colors.background }]}>
        <StatusBar style={colors.isDark ? "light" : "dark"} />
        <View style={styles.header}>
          <Text style={[styles.title, { color: colors.text }]}>{t("watchlist.stocks")}</Text>
        </View>
        <View style={styles.centered}>
          <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
            {t("watchlist.startBackendFirst")}
          </Text>
          <Pressable style={[styles.retryBtn, { backgroundColor: colors.primary }]} onPress={onRefresh}>
            <Text style={styles.retryText}>{t("common.retry")}</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.screen, { backgroundColor: colors.background }]} edges={["top"]}>
      <StatusBar style={colors.isDark ? "light" : "dark"} />
      <View style={styles.header}>
        <View>
          <Text style={[styles.title, { color: colors.text }]}>{t("watchlist.stocks")}</Text>
          <Text style={[styles.date, { color: colors.textSecondary }]}>{formatHeaderDate(i18n.language === "zh" ? "zh-CN" : "en-US")}</Text>
        </View>
        <View style={styles.headerActions}>
          <SortMenu
            currentSort={sortBy}
            onSelect={setSortBy}
            onOpen={closeSearchBar}
          />
          <Pressable style={styles.iconButton} onPress={handleSearchPress}>
            <MaterialIcons name="search" size={24} color={colors.text} />
          </Pressable>
        </View>
      </View>
      <View style={styles.listContainer}>
        <FlatList
          data={filteredAndSortedRows}
          keyExtractor={(item) =>
            item.type === "stock" ? item.holding.id : item.account.id
          }
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={colors.primary}
            />
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
              <View style={styles.emptyContainer}>
                <Text style={[styles.emptyText, { color: colors.textSecondary }]}>{t("watchlist.noStocksFound")}</Text>
                <Text style={[styles.emptySubtext, { color: colors.textTertiary }]}>
                  {t("watchlist.tryDifferentSearch")}
                </Text>
              </View>
            ) : null
          }
        />
      </View>
      <Animated.View
        style={[
          styles.searchBarContainer,
          {
            opacity: searchBarAnim,
            transform: [
              {
                translateY: searchBarAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [100, 0],
                }),
              },
            ],
          },
        ]}
        pointerEvents={showSearchBar ? "auto" : "none"}
      >
        <GlassView intensity={70} tint="dark" style={styles.searchBarGlass}>
          <View style={styles.searchBarRow}>
            <GlassView intensity={50} tint="dark" style={styles.searchBarWrapper}>
              <MaterialIcons
                name="search"
                size={20}
                color={colors.textSecondary}
                style={styles.searchIcon}
              />
              <TextInput
                ref={searchInputRef}
                style={[styles.searchInput, { color: colors.text }]}
                placeholder={t("watchlist.searchStocks")}
                placeholderTextColor={colors.textTertiary}
                value={searchQuery}
                onChangeText={setSearchQuery}
                autoCapitalize="none"
                autoCorrect={false}
                returnKeyType="search"
              />
              {searchQuery.length > 0 && (
                <Pressable
                  onPress={() => setSearchQuery("")}
                  hitSlop={8}
                  style={styles.clearBtn}
                >
                  <MaterialIcons name="close" size={18} color={colors.textSecondary} />
                </Pressable>
              )}
            </GlassView>
            <Pressable
              onPress={handleSearchPress}
              hitSlop={8}
              style={styles.searchCloseBtn}
            >
              <GlassView intensity={60} tint="dark" style={styles.searchCloseGlass}>
                <MaterialIcons name="close" size={24} color={colors.text} />
              </GlassView>
            </Pressable>
          </View>
        </GlassView>
      </Animated.View>
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
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  centered: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 12,
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    letterSpacing: -0.5,
  },
  date: {
    fontSize: 13,
    marginTop: 4,
    fontWeight: "400",
  },
  headerActions: {
    flexDirection: "row",
    gap: 8,
  },
  iconButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "transparent",
  },
  listContainer: {
    flex: 1,
  },
  retryBtn: {
    marginTop: 12,
    paddingVertical: 10,
    paddingHorizontal: 20,
    backgroundColor: "rgba(255,255,255,0.1)",
    borderRadius: 10,
  },
  retryText: {
    color: "#fff",
    fontWeight: "600",
  },
  emptyContainer: {
    padding: 40,
    alignItems: "center",
  },
  emptyText: {
    fontSize: 17,
    fontWeight: "600",
    marginBottom: 4,
  },
  emptySubtext: {
    fontSize: 15,
  },
  searchBarContainer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 8,
  },
  searchBarGlass: {
    borderRadius: 20,
    overflow: "hidden",
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "rgba(255,255,255,0.12)",
  },
  searchBarRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    padding: 6,
  },
  searchBarWrapper: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 10,
    overflow: "hidden",
  },
  searchCloseBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    overflow: "hidden",
  },
  searchCloseGlass: {
    flex: 1,
    width: "100%",
    height: "100%",
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 17,
    padding: 0,
  },
  clearBtn: {
    padding: 4,
    marginLeft: 8,
  },
});
