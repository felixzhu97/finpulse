import { useState } from "react";
import { StyleSheet, View } from "react-native";
import { LineChart } from "react-native-chart-kit";
import type { PortfolioHistoryPoint } from "@/src/domain/entities/portfolio";
import { useTheme } from "@/src/presentation/theme";

interface NetWorthLineChartProps {
  points: PortfolioHistoryPoint[];
}

export function NetWorthLineChart({ points }: NetWorthLineChartProps) {
  const { colors } = useTheme();
  const [width, setWidth] = useState(0);

  if (!points.length) return null;

  const data = points.map((point) => point.value);
  const labels = points.map((point) => {
    const d = new Date(point.date);
    return d.toLocaleDateString(undefined, { month: "numeric", day: "numeric" });
  });

  return (
    <View style={[styles.container, { backgroundColor: colors.card, borderColor: colors.border }]} onLayout={(e) => setWidth(e.nativeEvent.layout.width)}>
      {width > 0 && (
        <LineChart
          data={{ labels, datasets: [{ data }] }}
          width={width}
          height={180}
          withDots={false}
          withVerticalLines={false}
          withHorizontalLines={false}
          withHorizontalLabels={true}
          withVerticalLabels={true}
          withShadow={false}
          chartConfig={{
            backgroundGradientFrom: colors.background,
            backgroundGradientTo: colors.background,
            color: () => colors.success,
            labelColor: () => colors.textSecondary,
            decimalPlaces: 0,
            propsForBackgroundLines: { strokeWidth: 0 },
          }}
          style={styles.chart}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 12,
    borderWidth: StyleSheet.hairlineWidth,
    paddingVertical: 8,
    overflow: "hidden",
    width: "100%",
  },
  chart: {
    marginHorizontal: 0,
  },
});
