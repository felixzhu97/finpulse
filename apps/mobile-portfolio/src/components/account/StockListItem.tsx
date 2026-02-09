import { StyleSheet, Text, View } from "react-native";
import type { Holding } from "../../types/portfolio";
import { Sparkline } from "../ui/Sparkline";

interface StockListItemProps {
  holding: Holding;
  price: number;
  change: number;
  historyValues?: number[];
}

function formatPrice(value: number) {
  return value.toLocaleString(undefined, {
    maximumFractionDigits: 2,
    minimumFractionDigits: 2,
  });
}

function formatSigned(value: number) {
  const formatted = value.toLocaleString(undefined, {
    maximumFractionDigits: 2,
    minimumFractionDigits: 2,
  });
  if (value > 0) return `+${formatted}`;
  if (value < 0) return formatted;
  return "0";
}

export function StockListItem({ holding, price, change, historyValues }: StockListItemProps) {
  const isUp = change > 0;
  const isDown = change < 0;
  const trend = isUp ? "up" : isDown ? "down" : "flat";
  const badgeBg = isUp ? "#ef4444" : isDown ? "#22c55e" : "#374151";

  return (
    <View style={styles.row}>
      <View style={styles.left}>
        <Text style={styles.symbol} numberOfLines={1}>
          {holding.symbol}
        </Text>
        <Text style={styles.name} numberOfLines={1}>
          {holding.name}
        </Text>
      </View>
      <View style={styles.sparkline}>
        <Sparkline data={historyValues} trend={trend} width={60} height={32} />
      </View>
      <View style={styles.right}>
        <Text style={styles.price}>{formatPrice(price)}</Text>
        <View style={[styles.badge, { backgroundColor: badgeBg }]}>
          <Text style={styles.badgeText}>{formatSigned(change)}</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
    paddingHorizontal: 0,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "rgba(156,163,175,0.25)",
  },
  left: {
    flex: 1,
    minWidth: 0,
  },
  symbol: {
    fontSize: 17,
    fontWeight: "600",
    color: "#fff",
  },
  name: {
    fontSize: 13,
    color: "#9ca3af",
    marginTop: 2,
  },
  sparkline: {
    width: 60,
    alignItems: "center",
    justifyContent: "center",
  },
  right: {
    alignItems: "flex-end",
  },
  price: {
    fontSize: 17,
    fontWeight: "600",
    color: "#fff",
  },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    marginTop: 4,
  },
  badgeText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#fff",
  },
});
