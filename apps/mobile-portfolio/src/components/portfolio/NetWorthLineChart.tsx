import { useState } from "react";
import { StyleSheet, View } from "react-native";
import { LineChart } from "react-native-chart-kit";
import type { PortfolioHistoryPoint } from "../../types/portfolio";

interface NetWorthLineChartProps {
  points: PortfolioHistoryPoint[];
}

export function NetWorthLineChart({ points }: NetWorthLineChartProps) {
  const [width, setWidth] = useState(0);

  if (!points.length) return null;

  const data = points.map((point) => point.value);
  const labels = points.map((point) => {
    const d = new Date(point.date);
    return d.toLocaleDateString(undefined, { month: "numeric", day: "numeric" });
  });

  return (
    <View style={styles.container} onLayout={(e) => setWidth(e.nativeEvent.layout.width)}>
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
            backgroundGradientFrom: "#000000",
            backgroundGradientTo: "#000000",
            color: () => "#22c55e",
            labelColor: () => "rgba(255,255,255,0.6)",
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
    backgroundColor: "#000000",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
    paddingVertical: 8,
    overflow: "hidden",
    width: "100%",
  },
  chart: {
    marginHorizontal: 0,
  },
});
