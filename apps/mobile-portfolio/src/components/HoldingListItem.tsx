import { StyleSheet, Text, View } from "react-native";
import type { Holding } from "../types/portfolio";

interface HoldingListItemProps {
  holding: Holding;
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

function formatPercent(value: number) {
  const percent = value * 100;
  const formatted = percent.toFixed(2);
  if (percent > 0) {
    return `+${formatted}%`;
  }
  if (percent < 0) {
    return `${formatted}%`;
  }
  return "0.00%";
}

export function HoldingListItem({ holding }: HoldingListItemProps) {
  const isPositive = holding.profit >= 0;

  return (
    <View style={styles.row}>
      <View style={styles.left}>
        <Text numberOfLines={1} style={styles.name}>
          {holding.name}
        </Text>
        <Text numberOfLines={1} style={styles.meta}>
          {holding.symbol} · {holding.quantity} shares
        </Text>
      </View>
      <View style={styles.right}>
        <Text numberOfLines={1} style={styles.value}>
          {formatCurrency(holding.marketValue, "USD")}
        </Text>
        <Text
          numberOfLines={1}
          style={[styles.change, { color: isPositive ? "#16a34a" : "#b91c1c" }]}
        >
          {formatSigned(holding.profit)} · {formatPercent(holding.profitRate)}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(15, 23, 42, 0.06)",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 12,
    minHeight: 56,
  },
  left: {
    flex: 1,
    minWidth: 0,
  },
  name: {
    fontSize: 15,
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
    flexShrink: 0,
  },
  value: {
    fontSize: 15,
    fontWeight: "600",
    color: "#111827",
  },
  change: {
    marginTop: 2,
    fontSize: 12,
  },
});
