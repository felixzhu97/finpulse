import { useEffect, useState } from "react";
import { StyleSheet, Text, View, ActivityIndicator } from "react-native";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { useBlockchain } from "@/src/presentation/hooks/useBlockchain";
import { useTheme } from "@/src/presentation/theme";
import { useTranslation } from "@/src/presentation/i18n";
import { formatBalance } from "@/src/infrastructure/utils";
import type { BlockchainBalance } from "@/src/domain/entities/blockchain";

interface BlockchainBalanceCardProps {
  accountId: string;
  currency?: string;
}

export function BlockchainBalanceCard({
  accountId,
  currency = "SIM_COIN",
}: BlockchainBalanceCardProps) {
  const { colors } = useTheme();
  const { t } = useTranslation();
  const { getBalance, loading, error } = useBlockchain();
  const [balance, setBalance] = useState<BlockchainBalance | null>(null);

  useEffect(() => {
    loadBalance();
  }, [accountId, currency]);

  const loadBalance = async () => {
    try {
      const result = await getBalance(accountId, currency);
      setBalance(result);
    } catch (err) {
      setBalance(null);
    }
  };

  return (
    <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
      <View style={styles.header}>
        <View style={[styles.iconContainer, { backgroundColor: colors.surface }]}>
          <MaterialIcons name="account-balance-wallet" size={20} color={colors.text} />
        </View>
        <View style={styles.headerText}>
          <Text style={[styles.title, { color: colors.text }]}>
            {t("blockchain.blockchainBalance")}
          </Text>
          <Text style={[styles.currency, { color: colors.textSecondary }]}>{currency}</Text>
        </View>
      </View>
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="small" color={colors.textSecondary} />
        </View>
      ) : error ? (
        <View style={styles.balanceContainer}>
          <Text style={[styles.noBalance, { color: colors.error }]}>
            {t("blockchain.error")}: {error}
          </Text>
        </View>
      ) : balance ? (
        <View style={styles.balanceContainer}>
          <Text style={[styles.balance, { color: colors.text }]}>
            {formatBalance(balance.balance)}
          </Text>
        </View>
      ) : (
        <View style={styles.balanceContainer}>
          <Text style={[styles.noBalance, { color: colors.textSecondary }]}>
            {t("blockchain.noBalance")}
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 12,
    padding: 16,
    borderWidth: StyleSheet.hairlineWidth,
    marginBottom: 12,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  iconContainer: {
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  headerText: {
    flex: 1,
  },
  title: {
    fontSize: 15,
    fontWeight: "600",
    marginBottom: 2,
    letterSpacing: -0.2,
  },
  currency: {
    fontSize: 13,
    letterSpacing: -0.1,
  },
  balanceContainer: {
    paddingTop: 4,
  },
  balance: {
    fontSize: 32,
    fontWeight: "700",
    letterSpacing: -0.8,
  },
  noBalance: {
    fontSize: 15,
    letterSpacing: -0.2,
  },
  loadingContainer: {
    paddingVertical: 20,
    alignItems: "center",
  },
});
