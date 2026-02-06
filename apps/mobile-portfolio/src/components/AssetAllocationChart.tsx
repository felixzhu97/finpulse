import { Dimensions, View } from "react-native";
import { PieChart } from "react-native-chart-kit";

type AllocationItem = {
  label: string;
  value: number;
};

interface AssetAllocationChartProps {
  items: AllocationItem[];
}

export function AssetAllocationChart({ items }: AssetAllocationChartProps) {
  const total = items.reduce((sum, item) => sum + item.value, 0);

  if (!total) {
    return null;
  }

  const width = Dimensions.get("window").width - 32;

  const chartData = items.map((item, index) => ({
    name: item.label,
    value: item.value,
    color:
      [
        "#4f46e5",
        "#0ea5e9",
        "#22c55e",
        "#f97316",
        "#6366f1",
      ][index % 5],
    legendFontColor: "#4b5563",
    legendFontSize: 12,
  }));

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
      <PieChart
        data={chartData}
        width={width}
        height={200}
        accessor="value"
        backgroundColor="transparent"
        paddingLeft="12"
        chartConfig={{
          backgroundGradientFrom: "#ffffff",
          backgroundGradientTo: "#ffffff",
          color: () => "#111827",
          labelColor: () => "#4b5563",
          decimalPlaces: 0,
        }}
        hasLegend
      />
    </View>
  );
}


