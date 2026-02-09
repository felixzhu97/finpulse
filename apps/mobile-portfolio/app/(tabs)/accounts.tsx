import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { useEffect, useMemo, useState } from "react";
import {
  FlatList,
  Pressable,
  SafeAreaView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { getPortfolio } from "@/src/services/portfolioService";
import { AccountListItem } from "@/src/components/account/AccountListItem";
import { StockListItem } from "@/src/components/account/StockListItem";
import { useRealtimeQuotes } from "@/src/hooks/useRealtimeQuotes";
import { usePerSymbolHistory } from "@/src/hooks/usePerSymbolHistory";
import type { Account, Holding } from "@/src/types/portfolio";

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

  const symbols = useMemo(
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

  const { quotes } = useRealtimeQuotes(symbols);

  const quoteMap = useMemo(
    () =>
      Object.fromEntries(
        Object.entries(quotes).map(([k, v]) => [
          k,
          { price: v.price, change: v.change },
        ])
      ),
    [quotes]
  );

  const rows = useMemo(
    () => buildListRows(baseAccounts, quoteMap),
    [baseAccounts, quoteMap]
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

  const historyBySymbol = usePerSymbolHistory(symbols, quoteMap, initialPrices);

  useEffect(() => {
    let active = true;
    const load = async () => {
      const portfolio = await getPortfolio();
      if (!active) return;
      setBaseAccounts(portfolio?.accounts ?? []);
      setHistoryValues(portfolio?.history.map((h) => h.value) ?? []);
      setLoading(false);
    };
    load();
    return () => {
      active = false;
    };
  }, []);

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
          <Text style={styles.loadingText}>Start backend and seed data first.</Text>
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
          <Pressable style={styles.iconButton}>
            <MaterialIcons name="search" size={24} color="#fff" />
          </Pressable>
          <Pressable style={styles.iconButton}>
            <MaterialIcons name="more-vert" size={24} color="#fff" />
          </Pressable>
        </View>
      </View>
      <View style={styles.listContainer}>
        <FlatList
          data={rows}
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
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 16,
    paddingTop: 8,
  },
  title: {
    fontSize: 34,
    fontWeight: "700",
    color: "#fff",
  },
  date: {
    fontSize: 15,
    color: "#9ca3af",
    marginTop: 2,
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
    paddingHorizontal: 20,
  },
});
