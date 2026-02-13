import { useState } from "react";
import { View, Text } from "react-native";
import { LineChart, CandlestickChart } from "react-native-wagmi-charts";
import styled from "styled-components/native";

type LinePoint = { timestamp: number; value: number };
type CandlePoint = { timestamp: number; open: number; high: number; low: number; close: number };

interface ProfessionalStockChartProps {
  linePoints: LinePoint[];
  candlePoints: CandlePoint[];
}

const Wrapper = styled.View`
  gap: 12px;
  width: 100%;
  overflow: hidden;
`;

const Card = styled.View`
  border-radius: 12px;
  background-color: #000000;
  border-width: 1px;
  border-color: rgba(255,255,255,0.08);
  padding-vertical: 12px;
  padding-horizontal: 8px;
  overflow: hidden;
`;

const Label = styled.Text`
  font-size: 14px;
  font-weight: 600;
  color: rgba(255,255,255,0.9);
  margin-bottom: 8px;
`;

const Footer = styled.View`
  flex-direction: row;
  justify-content: space-between;
  margin-top: 8px;
`;

export function ProfessionalStockChart({ linePoints, candlePoints }: ProfessionalStockChartProps) {
  const [width, setWidth] = useState(0);
  const chartWidth = width > 0 ? width - 16 : undefined;

  if (!linePoints.length || !candlePoints.length) return null;

  return (
    <Wrapper onLayout={(e) => setWidth(e.nativeEvent.layout.width)}>
      <Card>
        <Label>Price line</Label>
        <LineChart.Provider data={linePoints}>
          <LineChart height={160} width={chartWidth}>
            <LineChart.Path color="#6366f1" />
            <LineChart.CursorCrosshair />
          </LineChart>
          <Footer>
            <LineChart.PriceText style={{ fontSize: 13, color: "rgba(255,255,255,0.9)", fontWeight: "500" }} />
            <LineChart.DatetimeText style={{ fontSize: 12, color: "rgba(255,255,255,0.5)" }} />
          </Footer>
        </LineChart.Provider>
      </Card>
      <Card>
        <Label>Candlestick</Label>
        <CandlestickChart.Provider data={candlePoints}>
          <CandlestickChart height={200} width={chartWidth}>
            <CandlestickChart.Candles />
            <CandlestickChart.Crosshair />
          </CandlestickChart>
          <Footer>
            <CandlestickChart.PriceText type="close" style={{ fontSize: 13, color: "rgba(255,255,255,0.9)", fontWeight: "500" }} />
            <CandlestickChart.DatetimeText style={{ fontSize: 12, color: "rgba(255,255,255,0.5)" }} />
          </Footer>
        </CandlestickChart.Provider>
      </Card>
    </Wrapper>
  );
}
