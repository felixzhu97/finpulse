import { Dimensions, StyleSheet, View } from "react-native";
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
        "#818cf8",
        "#38bdf8",
        "#4ade80",
        "#fb923c",
        "#a78bfa",
      ][index % 5],
    legendFontColor: "rgba(255,255,255,0.7)",
    legendFontSize: 12,
  }));

  return (
    <View style={styles.container}>
      <PieChart
        data={chartData}
        width={width}
        height={200}
        accessor="value"
        backgroundColor="transparent"
        paddingLeft="12"
        chartConfig={{
          backgroundGradientFrom: "#000000",
          backgroundGradientTo: "#000000",
          color: () => "rgba(255,255,255,0.9)",
          labelColor: () => "rgba(255,255,255,0.6)",
          decimalPlaces: 0,
        }}
        hasLegend
      />
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
  },
});
