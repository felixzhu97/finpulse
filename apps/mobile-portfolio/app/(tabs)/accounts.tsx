import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { FlatList, SafeAreaView, StyleSheet, Text, View } from "react-native";
import { getAccounts } from "@/src/services/portfolioService";
import { AccountListItem } from "@/src/components/AccountListItem";
import { usePortfolioStore } from "@/src/store/portfolioStore";
import type { Account } from "@/src/types/portfolio";

export default function AccountsScreen() {
  const router = useRouter();
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(true);
  const setSelectedAccountId = usePortfolioStore(
    (state) => state.setSelectedAccountId,
  );

  useEffect(() => {
    let active = true;

    const load = async () => {
      const list = await getAccounts();
      if (!active) {
        return;
      }
      setAccounts(list);
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
        <View style={styles.centered}>
          <Text>Loading accounts...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.screen}>
      <View style={styles.listContainer}>
        <FlatList
          data={accounts}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <AccountListItem
              account={item}
              onPress={() => {
                setSelectedAccountId(item.id);
                router.push(`/account/${item.id}`);
              }}
            />
          )}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#f3f4f6",
  },
  centered: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  listContainer: {
    flex: 1,
    paddingHorizontal: 16,
  },
});
