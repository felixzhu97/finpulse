import { useRouter } from "expo-router";
import { FlatList, SafeAreaView, View } from "react-native";
import { getAccounts } from "@/src/services/portfolioService";
import { AccountListItem } from "@/src/components/AccountListItem";
import { usePortfolioStore } from "@/src/store/portfolioStore";

export default function AccountsScreen() {
  const router = useRouter();
  const accounts = getAccounts();
  const setSelectedAccountId = usePortfolioStore(
    (state) => state.setSelectedAccountId,
  );

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#f3f4f6" }}>
      <View style={{ flex: 1, paddingHorizontal: 16 }}>
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

