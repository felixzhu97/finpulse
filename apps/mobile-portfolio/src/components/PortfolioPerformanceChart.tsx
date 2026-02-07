import { StyleSheet, View, Text } from "react-native";
import type { PortfolioHistoryPoint } from "../types/portfolio";

interface PortfolioPerformanceChartProps {
  points: PortfolioHistoryPoint[];
}

function getMinMax(points: PortfolioHistoryPoint[]) {
  let min = Number.POSITIVE_INFINITY;
  let max = Number.NEGATIVE_INFINITY;

  points.forEach((point) => {
    if (point.value < min) {
      min = point.value;
    }
    if (point.value > max) {
      max = point.value;
    }
  });

  if (!points.length) {
    return { min: 0, max: 0 };
  }

  if (min === max) {
    return { min: min - 1, max: max + 1 };
  }

  return { min, max };
}

export function PortfolioPerformanceChart({
  points,
}: PortfolioPerformanceChartProps) {
  if (!points.length) {
    return null;
  }

  const { min, max } = getMinMax(points);
  const range = max - min || 1;

  return (
    <View style={styles.card}>
      <Text style={styles.title}>Portfolio performance</Text>
      <View style={styles.barsRow}>
        {points.map((point) => {
          const ratio = (point.value - min) / range;
          const height = Math.max(0.1, ratio);

          return (
            <View key={point.date} style={styles.barWrap}>
              <View
                style={[
                  styles.bar,
                  { height: `${height * 100}%` },
                ]}
              />
            </View>
          );
        })}
      </View>
      <View style={styles.footer}>
        <Text style={styles.dateText}>{points[0]?.date}</Text>
        <Text style={styles.dateText}>{points[points.length - 1]?.date}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: 12,
    borderRadius: 12,
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "rgba(15, 23, 42, 0.06)",
    gap: 8,
  },
  title: {
    fontSize: 14,
    fontWeight: "600",
    color: "#111827",
  },
  barsRow: {
    height: 64,
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 4,
  },
  barWrap: {
    flex: 1,
    alignItems: "center",
    justifyContent: "flex-end",
  },
  bar: {
    width: 6,
    borderRadius: 999,
    backgroundColor: "#16a34a",
  },
  footer: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  dateText: {
    fontSize: 11,
    color: "#6b7280",
  },
});
