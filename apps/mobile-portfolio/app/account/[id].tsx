import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { FlatList, Text, TouchableOpacity, View } from "react-native";
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
      <SafeAreaView
        style={{
          flex: 1,
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Text>Account not found.</Text>
      </SafeAreaView>
    );
  }

  if (loading) {
    return (
      <SafeAreaView
        style={{
          flex: 1,
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Text>Loading account...</Text>
      </SafeAreaView>
    );
  }

  if (!account) {
    return (
      <SafeAreaView
        style={{
          flex: 1,
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Text>Account not found.</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#f3f4f6" }}>
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          paddingHorizontal: 16,
          paddingVertical: 12,
          backgroundColor: "#ffffff",
          borderBottomWidth: 1,
          borderBottomColor: "rgba(15, 23, 42, 0.06)",
        }}
      >
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={{ fontSize: 16 }}>Back</Text>
        </TouchableOpacity>
        <Text
          style={{
            marginLeft: 16,
            fontSize: 18,
            fontWeight: "600",
          }}
        >
          {account.name}
        </Text>
      </View>
      <View style={{ flex: 1, paddingHorizontal: 16, paddingTop: 8 }}>
        <FlatList
          data={holdings}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => <HoldingListItem holding={item} />}
          ListEmptyComponent={
            <View
              style={{
                paddingVertical: 24,
                alignItems: "center",
              }}
            >
              <Text>No holdings in this account.</Text>
            </View>
          }
        />
      </View>
    </SafeAreaView>
  );
}

