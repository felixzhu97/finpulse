import type { PortfolioHistoryPoint } from "@/src/domain/entities/portfolio";
import styled from "styled-components/native";

interface PortfolioPerformanceChartProps {
  points: PortfolioHistoryPoint[];
}

function getMinMax(points: PortfolioHistoryPoint[]) {
  let min = Number.POSITIVE_INFINITY;
  let max = Number.NEGATIVE_INFINITY;

  points.forEach((point) => {
    if (point.value < min) min = point.value;
    if (point.value > max) max = point.value;
  });

  if (!points.length) return { min: 0, max: 0 };
  if (min === max) return { min: min - 1, max: max + 1 };
  return { min, max };
}

const Card = styled.View`
  padding: 12px;
  border-radius: 12px;
  background-color: ${(p) => p.theme.colors.card};
  border-width: 1px;
  border-color: ${(p) => p.theme.colors.border};
  gap: 8px;
`;

const Title = styled.Text`
  font-size: 14px;
  font-weight: 600;
  color: ${(p) => p.theme.colors.text};
`;

const BarsRow = styled.View`
  height: 64px;
  flex-direction: row;
  align-items: flex-end;
  gap: 4px;
`;

const BarWrap = styled.View`
  flex: 1;
  align-items: center;
  justify-content: flex-end;
`;

const Bar = styled.View<{ height: string }>`
  width: 6px;
  border-radius: 999px;
  background-color: ${(p) => p.theme.colors.success};
  height: ${(p) => p.height};
`;

const Footer = styled.View`
  flex-direction: row;
  justify-content: space-between;
`;

const DateText = styled.Text`
  font-size: 11px;
  color: ${(p) => p.theme.colors.textSecondary};
`;

export function PortfolioPerformanceChart({ points }: PortfolioPerformanceChartProps) {
  if (!points.length) return null;

  const { min, max } = getMinMax(points);
  const range = max - min || 1;

  return (
    <Card>
      <Title>Portfolio performance</Title>
      <BarsRow>
        {points.map((point) => {
          const ratio = (point.value - min) / range;
          const h = Math.max(0.1, ratio);

          return (
            <BarWrap key={point.date}>
              <Bar height={`${h * 100}%`} />
            </BarWrap>
          );
        })}
      </BarsRow>
      <Footer>
        <DateText>{points[0]?.date}</DateText>
        <DateText>{points[points.length - 1]?.date}</DateText>
      </Footer>
    </Card>
  );
}
