import { Dimensions, View } from "react-native";
import { LineChart } from "react-native-chart-kit";
import type { PortfolioHistoryPoint } from "../types/portfolio";

interface NetWorthLineChartProps {
  points: PortfolioHistoryPoint[];
}

export function NetWorthLineChart({ points }: NetWorthLineChartProps) {
  if (!points.length) {
    return null;
  }

  const width = Dimensions.get("window").width - 32;
  const labels = points.map((point) => point.date);
  const data = points.map((point) => point.value);

  return (
    <View
      style={{
        borderRadius: 12,
        backgroundColor: "#ffffff",
        borderWidth: 1,
        borderColor: "rgba(15, 23, 42, 0.06)",
        paddingVertical: 8,
      }}
    >
      <LineChart
        data={{
          labels,
          datasets: [{ data }],
        }}
        width={width}
        height={180}
        withDots={false}
        withVerticalLines={false}
        withHorizontalLines={false}
        withShadow={false}
        chartConfig={{
          backgroundGradientFrom: "#ffffff",
          backgroundGradientTo: "#ffffff",
          color: () => "#16a34a",
          labelColor: () => "#9ca3af",
          decimalPlaces: 0,
          propsForBackgroundLines: {
            strokeWidth: 0,
          },
        }}
        style={{
          marginLeft: -16,
        }}
      />
    </View>
  );
}

