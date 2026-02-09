import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import { FlatList, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { getAccountById, getHoldingsByAccount } from "@/src/services/portfolioService";
import { HoldingListItem } from "@/src/components/account/HoldingListItem";
import { useRealtimeQuotes } from "@/src/hooks/useRealtimeQuotes";
import type { Account, Holding } from "@/src/types/portfolio";

export default function AccountDetailScreen() {
  const params = useLocalSearchParams<{ id?: string }>();
  const router = useRouter();

  const accountId = params.id;

  const [account, setAccount] = useState<Account | null>(null);
  const [holdings, setHoldings] = useState<Holding[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!accountId) {
      return;
    }

    let active = true;

    const load = async () => {
      const a = await getAccountById(accountId);
      const h = await getHoldingsByAccount(accountId);

      if (!active) {
        return;
      }

      setAccount(a ?? null);
      setHoldings(h);
      setLoading(false);
    };

    load();

    return () => {
      active = false;
    };
  }, [accountId]);

  const symbols = useMemo(
    () => Array.from(new Set(holdings.map((item) => item.symbol))),
    [holdings],
  );

  const { quotes, status } = useRealtimeQuotes(symbols);

  const data = useMemo(() => {
    return holdings.map((holding) => {
      const quote = quotes[holding.symbol.toUpperCase()];
      if (!quote) {
        return {
          holding,
          displayPrice: holding.price,
          displayMarketValue: holding.marketValue,
          displayProfit: holding.profit,
          displayProfitRate: holding.profitRate,
        };
      }
      const price = quote.price;
      const marketValue = holding.quantity * price;
      const profit = marketValue - holding.costBasis;
      const profitRate = holding.costBasis ? profit / holding.costBasis : 0;
      return {
        holding,
        displayPrice: price,
        displayMarketValue: marketValue,
        displayProfit: profit,
        displayProfitRate: profitRate,
      };
    });
  }, [holdings, quotes]);

  if (!accountId) {
    return (
      <SafeAreaView style={styles.centered}>
        <Text>Account not found.</Text>
      </SafeAreaView>
    );
  }

  if (loading) {
    return (
      <SafeAreaView style={styles.centered}>
        <Text>Loading account...</Text>
      </SafeAreaView>
    );
  }

  if (!account) {
    return (
      <SafeAreaView style={styles.centered}>
        <Text>Account not found.</Text>
      </SafeAreaView>
    );
  }

  return (
    <View style={styles.screen}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} hitSlop={styles.backHitSlop}>
          <Text style={styles.backText}>Back</Text>
        </TouchableOpacity>
        <Text numberOfLines={1} style={styles.title}>
          {account.name}
        </Text>
        <Text style={styles.status}>
          {status === "open" ? "Live" : status === "connecting" ? "Connecting" : "Offline"}
        </Text>
      </View>
      <View style={styles.content}>
        <FlatList
          data={data}
          keyExtractor={(item) => item.holding.id}
          renderItem={({ item }) => (
            <HoldingListItem
              holding={item.holding}
              displayPrice={item.displayPrice}
              displayMarketValue={item.displayMarketValue}
              displayProfit={item.displayProfit}
              displayProfitRate={item.displayProfitRate}
            />
          )}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Text>No holdings in this account.</Text>
            </View>
          }
        />
      </View>
    </View>
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
    backgroundColor: "#f3f4f6",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 12,
    backgroundColor: "#ffffff",
    borderBottomWidth: 1,
    borderBottomColor: "rgba(15, 23, 42, 0.06)",
    gap: 16,
  },
  backHitSlop: { top: 8, bottom: 8, left: 8, right: 8 },
  backText: {
    fontSize: 16,
    color: "#2563eb",
  },
  title: {
    flex: 1,
    fontSize: 18,
    fontWeight: "600",
    color: "#111827",
  },
  status: {
    fontSize: 12,
    color: "#6b7280",
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 8,
    minWidth: 0,
  },
  empty: {
    paddingVertical: 24,
    alignItems: "center",
  },
});

