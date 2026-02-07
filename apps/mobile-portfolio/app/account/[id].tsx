import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { FlatList, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { getAccountById, getHoldingsByAccount } from "@/src/services/portfolioService";
import { HoldingListItem } from "@/src/components/HoldingListItem";
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
    <SafeAreaView style={styles.screen}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} hitSlop={styles.backHitSlop}>
          <Text style={styles.backText}>Back</Text>
        </TouchableOpacity>
        <Text numberOfLines={1} style={styles.title}>
          {account.name}
        </Text>
      </View>
      <View style={styles.content}>
        <FlatList
          data={holdings}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => <HoldingListItem holding={item} />}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Text>No holdings in this account.</Text>
            </View>
          }
        />
      </View>
    </SafeAreaView>
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
