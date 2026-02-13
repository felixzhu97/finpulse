import { useCallback } from "react";
import { Text } from "react-native";
import { NativeLineChart } from "@/src/shared/components/native/NativeLineChart";
import { useTheme } from "@/src/shared/theme";
import styled from "styled-components/native";

interface InteractiveStockChartProps {
  data: number[];
  timestamps?: number[];
  trend?: "up" | "down" | "flat";
  baselineValue?: number;
  width: number;
  height: number;
}

const Container = styled.View`
  position: relative;
  overflow: visible;
`;

const EmptyText = styled.Text`
  font-size: 14px;
  text-align: center;
  margin-top: 50px;
  color: ${(p) => p.theme.colors.textSecondary};
`;

export function InteractiveStockChart({
  data,
  timestamps,
  trend,
  baselineValue,
  width,
  height,
}: InteractiveStockChartProps) {
  const { isDark } = useTheme();
  const theme = isDark ? "dark" : "light";

  const onInteractionEnd = useCallback(() => {}, []);

  if (data.length === 0) {
    return (
      <Container style={{ width, height }}>
        <EmptyText>No data</EmptyText>
      </Container>
    );
  }

  return (
    <Container style={{ width, height }}>
      <NativeLineChart
        data={data}
        timestamps={timestamps}
        trend={trend}
        baselineValue={baselineValue}
        onInteractionEnd={onInteractionEnd}
        theme={theme}
        style={{ width: width + 135, height }}
      />
    </Container>
  );
}
