import { Pressable, StyleSheet, Text, View } from "react-native";
import type { Holding } from "@/src/types/portfolio";
import { formatPrice, formatSigned } from "@/src/utils";
import { getStockChangeInfo } from "@/src/utils/stockUtils";
import { Sparkline } from "../ui/Sparkline";

interface StockListItemProps {
  holding: Holding;
  price: number;
  change: number;
  historyValues?: number[];
  onPress?: () => void;
}

export function StockListItem({
  holding,
  price,
  change,
  historyValues,
  onPress,
}: StockListItemProps) {
  const { isUp, trend, changeColor, changePercent } = getStockChangeInfo(change, price);

  return (
    <Pressable style={styles.row} onPress={onPress}>
      <View style={styles.left}>
        <Text style={styles.symbol} numberOfLines={1}>
          {holding.symbol}
        </Text>
        <Text style={styles.name} numberOfLines={1}>
          {holding.name}
        </Text>
      </View>
      <View style={styles.sparkline}>
        <Sparkline data={historyValues} trend={trend} width={80} height={36} />
      </View>
      <View style={styles.right}>
        <Text style={styles.price}>{formatPrice(price)}</Text>
        <View style={styles.changeContainer}>
          <Text style={[styles.change, { color: changeColor }]}>
            {isUp ? "+" : ""}{formatSigned(change)}
          </Text>
          <Text style={[styles.changePercent, { color: changeColor }]}>
            {isUp ? "+" : ""}{changePercent}%
          </Text>
        </View>
      </View>
    </Pressable>
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
  symbol: {
    fontSize: 20,
    fontWeight: "600",
    color: "#fff",
    letterSpacing: -0.3,
  },
  name: {
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
