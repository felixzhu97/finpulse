import { Pressable, StyleSheet, Text, View } from "react-native";
import type { Account } from "../../types/portfolio";

interface AccountListItemProps {
  account: Account;
  onPress?: () => void;
}

function formatCurrency(value: number, currency: string) {
  return `${currency} ${value.toLocaleString(undefined, {
    maximumFractionDigits: 0,
  })}`;
}

function formatSigned(value: number) {
  const formatted = value.toLocaleString(undefined, {
    maximumFractionDigits: 0,
  });
  if (value > 0) {
    return `+${formatted}`;
  }
  if (value < 0) {
    return `-${formatted}`;
  }
  return "0";
}

function getAccountTypeLabel(type: Account["type"]) {
  switch (type) {
    case "brokerage":
      return "Brokerage";
    case "saving":
      return "Saving";
    case "checking":
      return "Checking";
    case "creditCard":
      return "Credit card";
    case "cash":
      return "Cash";
    default:
      return "Account";
  }
}

export function AccountListItem({ account, onPress }: AccountListItemProps) {
  const isNegative = account.balance < 0;

  return (
    <Pressable onPress={onPress}>
      <View style={styles.row}>
        <View>
          <Text style={styles.name}>{account.name}</Text>
          <Text style={styles.meta}>
            {getAccountTypeLabel(account.type)} ·{" "}
            {account.holdings.length > 0
              ? `${account.holdings.length} holdings`
              : "No holdings"}
          </Text>
        </View>
        <View style={styles.right}>
          <Text style={[styles.value, isNegative && styles.valueNegative]}>
            {formatCurrency(account.balance, account.currency)}
          </Text>
          <Text
            style={[
              styles.meta,
              account.todayChange >= 0 ? styles.positive : styles.negative,
            ]}
          >
            {formatSigned(account.todayChange)}
          </Text>
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    paddingVertical: 12,
    paddingHorizontal: 4,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(15, 23, 42, 0.06)",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  name: {
    fontSize: 16,
    fontWeight: "500",
    color: "#111827",
  },
  meta: {
    marginTop: 2,
    fontSize: 12,
    color: "#6b7280",
  },
  right: {
    alignItems: "flex-end",
  },
  value: {
    fontSize: 16,
    fontWeight: "600",
    color: "#111827",
  },
  valueNegative: {
    color: "#b91c1c",
  },
  positive: {
    color: "#16a34a",
  },
  negative: {
    color: "#b91c1c",
  },
});
