import { memo, useMemo, useState } from "react";
import { View } from "react-native";
import { LineChart } from "react-native-chart-kit";
import type { PortfolioHistoryPoint } from "@/src/domain/entities/portfolio";
import { useTheme } from "@/src/presentation/theme";
import { formatChartLabel, formatCompactCurrency } from "@/src/presentation/utils";
import styled from "@emotion/native";

const X_LABEL_COUNT = 5;

function pickLabelIndices(length: number): number[] {
  if (length <= X_LABEL_COUNT) return Array.from({ length }, (_, i) => i);
  const step = (length - 1) / (X_LABEL_COUNT - 1);
  return Array.from({ length: X_LABEL_COUNT }, (_, i) =>
    i === X_LABEL_COUNT - 1 ? length - 1 : Math.round(i * step)
  );
}

interface NetWorthLineChartProps {
  points: PortfolioHistoryPoint[];
  baseCurrency?: string;
}

const Container = styled.View`
  border-radius: 16px;
  overflow: hidden;
  width: 100%;
  padding-vertical: 12px;
  padding-horizontal: 12px;
  background-color: ${(p) => p.theme.colors.card};
`;

export const NetWorthLineChart = memo(function NetWorthLineChart({
  points,
  baseCurrency = "USD",
}: NetWorthLineChartProps) {
  const { colors } = useTheme();
  const [width, setWidth] = useState(0);

  const { data, labels } = useMemo(() => {
    if (!points.length) return { data: [] as number[], labels: [] as string[] };
    const data = points.map((p) => p.value);
    const indices = new Set(pickLabelIndices(points.length));
    const labels = points.map((p, i) => {
      if (!indices.has(i)) return "";
      return formatChartLabel(new Date(p.date));
    });
    return { data, labels };
  }, [points]);

  const formatYLabel = useMemo(
    () => (value: string) => {
      const n = Number(value);
      return Number.isFinite(n) ? formatCompactCurrency(n, baseCurrency) : value;
    },
    [baseCurrency]
  );

  if (!points.length) return null;

  const chartWidth = Math.max(0, width - 24);

  return (
    <Container onLayout={(e) => setWidth(e.nativeEvent.layout.width)}>
      {chartWidth > 0 && (
        <LineChart
          data={{ labels, datasets: [{ data }] }}
          width={chartWidth}
          height={180}
          withDots={false}
          withVerticalLines={false}
          withHorizontalLines={false}
          withHorizontalLabels={true}
          withVerticalLabels={true}
          withShadow={false}
          segments={4}
          formatYLabel={formatYLabel}
          chartConfig={{
            backgroundGradientFrom: colors.card,
            backgroundGradientFromOpacity: 0,
            backgroundGradientTo: colors.card,
            backgroundGradientToOpacity: 0,
            color: () => colors.success,
            labelColor: () => colors.textSecondary,
            decimalPlaces: 0,
            propsForBackgroundLines: { strokeWidth: 0 },
          }}
          style={{ marginHorizontal: 0, backgroundColor: "transparent" }}
        />
      )}
    </Container>
  );
});
