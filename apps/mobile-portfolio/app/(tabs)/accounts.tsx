import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  FlatList,
  Pressable,
  RefreshControl,
  SafeAreaView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { AccountListItem } from "@/src/components/account/AccountListItem";
import { StockListItem } from "@/src/components/account/StockListItem";
import {
  StockDetailDrawer,
  type StockDetailItem,
} from "@/src/components/watchlist";
import { useSymbolDisplayData } from "@/src/hooks/useSymbolDisplayData";
import type { Account, Holding } from "@/src/types/portfolio";
import { portfolioApi } from "@/src/api";

type ListRow =
  | { type: "stock"; holding: Holding; price: number; change: number }
  | { type: "account"; account: Account };

function formatHeaderDate() {
  return new Date().toLocaleDateString("en-US", {
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
        const price = q ? q.price : h.price;
        const change = q ? q.change : 0;
        rows.push({ type: "stock", holding: h, price, change });
      }
    } else {
      rows.push({ type: "account", account });
    }
  }
  return rows;
}

export default function AccountsScreen() {
  const [baseAccounts, setBaseAccounts] = useState<Account[]>([]);
  const [historyValues, setHistoryValues] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [detailItem, setDetailItem] = useState<StockDetailItem | null>(null);

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
        new Set([
          ...listSymbols,
          ...(detailItem ? [detailItem.symbol] : []),
        ])
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

  const rows = useMemo(
    () => buildListRows(baseAccounts, quoteMap),
    [baseAccounts, quoteMap]
  );

  const load = useCallback(async () => {
    const portfolio = await portfolioApi.getPortfolio();
    setBaseAccounts(portfolio?.accounts ?? []);
    setHistoryValues(portfolio?.history.map((h) => h.value) ?? []);
    setLoading(false);
  }, []);

  useEffect(() => {
    let active = true;
    const run = async () => {
      setLoading(true);
      const portfolio = await portfolioApi.getPortfolio();
      if (!active) return;
      setBaseAccounts(portfolio?.accounts ?? []);
      setHistoryValues(portfolio?.history.map((h) => h.value) ?? []);
      setLoading(false);
    };
    run();
    return () => {
      active = false;
    };
  }, []);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    portfolioApi.invalidateCache();
    await load();
    setRefreshing(false);
  }, [load]);

  if (loading) {
    return (
      <SafeAreaView style={styles.screen}>
        <StatusBar style="light" />
        <View style={styles.centered}>
          <Text style={styles.loadingText}>Loading stocks...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (baseAccounts.length === 0) {
    return (
      <SafeAreaView style={styles.screen}>
        <StatusBar style="light" />
        <View style={styles.header}>
          <Text style={styles.title}>Stocks</Text>
        </View>
        <View style={styles.centered}>
          <Text style={styles.loadingText}>
            Start backend and seed data first.
          </Text>
          <Pressable style={styles.retryBtn} onPress={onRefresh}>
            <Text style={styles.retryText}>Retry</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.screen}>
      <StatusBar style="light" />
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Stocks</Text>
          <Text style={styles.date}>{formatHeaderDate()}</Text>
        </View>
        <View style={styles.headerActions}>
          <Pressable style={styles.iconButton} onPress={onRefresh}>
            <MaterialIcons name="refresh" size={24} color="#fff" />
          </Pressable>
        </View>
      </View>
      <View style={styles.listContainer}>
        <FlatList
          data={rows}
          keyExtractor={(item) =>
            item.type === "stock" ? item.holding.id : item.account.id
          }
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor="#fff"
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
        />
      </View>
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
    backgroundColor: "#000",
  },
  centered: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  loadingText: {
    color: "#9ca3af",
    fontSize: 16,
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
    color: "#fff",
    letterSpacing: -0.5,
  },
  date: {
    fontSize: 13,
    color: "rgba(255,255,255,0.5)",
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
  },
  listContainer: {
    flex: 1,
    paddingHorizontal: 0,
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
});
