import { memo, useState } from "react";
import { View } from "react-native";
import { LineChart } from "react-native-chart-kit";
import type { PortfolioHistoryPoint } from "@/src/domain/entities/portfolio";
import { useTheme } from "@/src/presentation/theme";
import styled from "styled-components/native";

interface NetWorthLineChartProps {
  points: PortfolioHistoryPoint[];
}

const Container = styled.View`
  border-radius: 12px;
  border-width: 1px;
  border-color: ${(p) => p.theme.colors.border};
  padding-vertical: 8px;
  overflow: hidden;
  width: 100%;
  background-color: ${(p) => p.theme.colors.card};
`;

export const NetWorthLineChart = memo(function NetWorthLineChart({ points }: NetWorthLineChartProps) {
  const { colors } = useTheme();
  const [width, setWidth] = useState(0);

  if (!points.length) return null;

  const data = points.map((point) => point.value);
  const labels = points.map((point) => {
    const d = new Date(point.date);
    return d.toLocaleDateString(undefined, { month: "numeric", day: "numeric" });
  });

  return (
    <Container onLayout={(e) => setWidth(e.nativeEvent.layout.width)}>
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
          style={{ marginHorizontal: 0 }}
        />
      )}
    </Container>
  );
});
