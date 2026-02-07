import { useState } from "react";
import { View } from "react-native";
import { LineChart } from "react-native-chart-kit";
import type { PortfolioHistoryPoint } from "../types/portfolio";

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
    <View
      style={{
        borderRadius: 12,
        backgroundColor: "#ffffff",
        borderWidth: 1,
        borderColor: "rgba(15, 23, 42, 0.06)",
        paddingVertical: 8,
        overflow: "hidden",
        width: "100%",
      }}
      onLayout={(e) => setWidth(e.nativeEvent.layout.width)}
    >
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
            backgroundGradientFrom: "#ffffff",
            backgroundGradientTo: "#ffffff",
            color: () => "#16a34a",
            labelColor: () => "#9ca3af",
            decimalPlaces: 0,
            propsForBackgroundLines: { strokeWidth: 0 },
          }}
          style={{ marginHorizontal: 0 }}
        />
      )}
    </View>
  );
}

