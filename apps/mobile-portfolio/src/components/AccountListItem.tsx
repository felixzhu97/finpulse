import { Pressable, Text, View } from "react-native";
import type { Account } from "../types/portfolio";

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
      <View
        style={{
          paddingVertical: 12,
          paddingHorizontal: 4,
          borderBottomWidth: 1,
          borderBottomColor: "rgba(15, 23, 42, 0.06)",
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <View>
          <Text
            style={{
              fontSize: 16,
              fontWeight: "500",
              color: "#111827",
            }}
          >
            {account.name}
          </Text>
          <Text
            style={{
              marginTop: 2,
              fontSize: 12,
              color: "#6b7280",
            }}
          >
            {getAccountTypeLabel(account.type)} ·{" "}
            {account.holdings.length > 0
              ? `${account.holdings.length} holdings`
              : "No holdings"}
          </Text>
        </View>
        <View style={{ alignItems: "flex-end" }}>
          <Text
            style={{
              fontSize: 16,
              fontWeight: "600",
              color: isNegative ? "#b91c1c" : "#111827",
            }}
          >
            {formatCurrency(account.balance, account.currency)}
          </Text>
          <Text
            style={{
              marginTop: 2,
              fontSize: 12,
              color: account.todayChange >= 0 ? "#16a34a" : "#b91c1c",
            }}
          >
            {formatSigned(account.todayChange)}
          </Text>
        </View>
      </View>
    </Pressable>
  );
}

