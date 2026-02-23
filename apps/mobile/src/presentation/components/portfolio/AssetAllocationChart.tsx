import { memo } from "react";
import { Dimensions } from "react-native";
import { PieChart } from "react-native-chart-kit";
import { useTheme } from "@/src/presentation/theme";
import styled from "styled-components/native";

type AllocationItem = { label: string; value: number };

interface AssetAllocationChartProps {
  items: AllocationItem[];
}

const Container = styled.View`
  border-radius: 12px;
  border-width: 1px;
  border-color: ${(p) => p.theme.colors.border};
  padding-vertical: 8px;
  background-color: ${(p) => p.theme.colors.card};
`;

export const AssetAllocationChart = memo(function AssetAllocationChart({ items }: AssetAllocationChartProps) {
  const { colors } = useTheme();
  const total = items.reduce((sum, item) => sum + item.value, 0);

  if (!total) return null;

  const width = Dimensions.get("window").width - 32;

  const chartData = items.map((item, index) => ({
    name: item.label,
    value: item.value,
    color: ["#818cf8", "#38bdf8", "#4ade80", "#fb923c", "#a78bfa"][index % 5],
    legendFontColor: colors.textSecondary,
    legendFontSize: 12,
  }));

  return (
    <Container>
      <PieChart
        data={chartData}
        width={width}
        height={200}
        accessor="value"
        backgroundColor="transparent"
        paddingLeft="12"
        chartConfig={{
          backgroundGradientFrom: colors.background,
          backgroundGradientTo: colors.background,
          color: () => colors.text,
          labelColor: () => colors.textSecondary,
          decimalPlaces: 0,
        }}
        hasLegend
      />
    </Container>
  );
});
