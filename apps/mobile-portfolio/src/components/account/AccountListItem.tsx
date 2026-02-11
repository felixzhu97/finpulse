import { StyleSheet, Text, View } from "react-native";
import type { Account } from "@/src/types/portfolio";
import { formatBalance, formatSigned } from "@/src/utils";
import { getStockChangeInfo } from "@/src/utils/stockUtils";
import { Sparkline } from "../ui/Sparkline";

interface AccountListItemProps {
  account: Account;
  historyValues?: number[];
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

export function AccountListItem({ account, historyValues }: AccountListItemProps) {
  const { isUp, trend, changeColor, changePercent } = getStockChangeInfo(
    account.todayChange,
    account.balance
  );

  return (
    <View style={styles.row}>
      <View style={styles.left}>
        <Text style={styles.code} numberOfLines={1}>
          {account.name}
        </Text>
        <Text style={styles.subtitle} numberOfLines={1}>
          {getAccountTypeLabel(account.type)}
        </Text>
      </View>
      <View style={styles.sparkline}>
        <Sparkline data={historyValues} trend={trend} width={80} height={36} />
      </View>
      <View style={styles.right}>
        <Text style={styles.price}>{formatBalance(account.balance)}</Text>
        <View style={styles.changeContainer}>
          <Text style={[styles.change, { color: changeColor }]}>
            {isUp ? "+" : ""}{formatSigned(account.todayChange, 0)}
          </Text>
          <Text style={[styles.changePercent, { color: changeColor }]}>
            {isUp ? "+" : ""}{changePercent}%
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 16,
    paddingHorizontal: 16,
    minHeight: 64,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "rgba(255,255,255,0.1)",
  },
  left: {
    flex: 1,
    minWidth: 0,
    paddingRight: 12,
  },
  code: {
    fontSize: 20,
    fontWeight: "600",
    color: "#fff",
    letterSpacing: -0.3,
  },
  subtitle: {
    fontSize: 13,
    color: "rgba(255,255,255,0.5)",
    marginTop: 3,
    letterSpacing: -0.1,
  },
  sparkline: {
    width: 80,
    alignItems: "center",
    justifyContent: "center",
    marginHorizontal: 8,
  },
  right: {
    alignItems: "flex-end",
    minWidth: 90,
  },
  price: {
    fontSize: 18,
    fontWeight: "600",
    color: "#fff",
    letterSpacing: -0.3,
  },
  changeContainer: {
    alignItems: "flex-end",
    marginTop: 4,
  },
  change: {
    fontSize: 15,
    fontWeight: "500",
    letterSpacing: -0.2,
  },
  changePercent: {
    fontSize: 13,
    fontWeight: "400",
    marginTop: 1,
    letterSpacing: -0.1,
  },
});
