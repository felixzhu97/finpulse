import { useState } from "react";
import { View, Text, StyleSheet } from "react-native";
import { LineChart, CandlestickChart } from "react-native-wagmi-charts";

type LinePoint = { timestamp: number; value: number };
type CandlePoint = { timestamp: number; open: number; high: number; low: number; close: number };

interface ProfessionalStockChartProps {
  linePoints: LinePoint[];
  candlePoints: CandlePoint[];
}

const cardStyle = {
  borderRadius: 12,
  backgroundColor: "#ffffff",
  borderWidth: 1,
  borderColor: "rgba(15, 23, 42, 0.06)",
  paddingVertical: 12,
  paddingHorizontal: 8,
  overflow: "hidden" as const,
};

const labelStyle = { fontSize: 14, fontWeight: "600" as const, color: "#111827", marginBottom: 8 };
const priceStyle = { fontSize: 13, color: "#111827", fontWeight: "500" as const };
const timeStyle = { fontSize: 12, color: "#6b7280" };
const footerStyle = { flexDirection: "row" as const, justifyContent: "space-between" as const, marginTop: 8 };

export function ProfessionalStockChart({ linePoints, candlePoints }: ProfessionalStockChartProps) {
  const [width, setWidth] = useState(0);
  const chartWidth = width > 0 ? width - 16 : undefined;

  if (!linePoints.length || !candlePoints.length) return null;

  return (
    <View style={styles.wrapper} onLayout={(e) => setWidth(e.nativeEvent.layout.width)}>
      <View style={cardStyle}>
        <Text style={labelStyle}>Price line</Text>
        <LineChart.Provider data={linePoints}>
          <LineChart height={160} width={chartWidth}>
            <LineChart.Path color="red">
              <LineChart.Gradient />
            </LineChart.Path>
            <LineChart.CursorCrosshair />
          </LineChart>
          <View style={footerStyle}>
            <LineChart.PriceText style={priceStyle} />
            <LineChart.DatetimeText style={timeStyle} />
          </View>
        </LineChart.Provider>
      </View>
      <View style={cardStyle}>
        <Text style={labelStyle}>Candlestick</Text>
        <CandlestickChart.Provider data={candlePoints}>
          <CandlestickChart height={200} width={chartWidth}>
            <CandlestickChart.Candles />
            <CandlestickChart.Crosshair />
          </CandlestickChart>
          <View style={footerStyle}>
            <CandlestickChart.PriceText type="close" style={priceStyle} />
            <CandlestickChart.DatetimeText style={timeStyle} />
          </View>
        </CandlestickChart.Provider>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { gap: 12, width: "100%", overflow: "hidden" },
});

