import { useState } from "react";
import { View, Text, StyleSheet } from "react-native";
import { LineChart, CandlestickChart } from "react-native-wagmi-charts";

type LinePoint = { timestamp: number; value: number };
type CandlePoint = { timestamp: number; open: number; high: number; low: number; close: number };

interface ProfessionalStockChartProps {
  linePoints: LinePoint[];
  candlePoints: CandlePoint[];
}

export function ProfessionalStockChart({ linePoints, candlePoints }: ProfessionalStockChartProps) {
  const [width, setWidth] = useState(0);
  const chartWidth = width > 0 ? width - 16 : undefined;

  if (!linePoints.length || !candlePoints.length) return null;

  return (
    <View style={styles.wrapper} onLayout={(e) => setWidth(e.nativeEvent.layout.width)}>
      <View style={styles.card}>
        <Text style={styles.label}>Price line</Text>
        <LineChart.Provider data={linePoints}>
          <LineChart height={160} width={chartWidth}>
            <LineChart.Path color="#6366f1" />
            <LineChart.CursorCrosshair />
          </LineChart>
          <View style={styles.footer}>
            <LineChart.PriceText style={styles.priceText} />
            <LineChart.DatetimeText style={styles.timeText} />
          </View>
        </LineChart.Provider>
      </View>
      <View style={styles.card}>
        <Text style={styles.label}>Candlestick</Text>
        <CandlestickChart.Provider data={candlePoints}>
          <CandlestickChart height={200} width={chartWidth}>
            <CandlestickChart.Candles />
            <CandlestickChart.Crosshair />
          </CandlestickChart>
          <View style={styles.footer}>
            <CandlestickChart.PriceText type="close" style={styles.priceText} />
            <CandlestickChart.DatetimeText style={styles.timeText} />
          </View>
        </CandlestickChart.Provider>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    gap: 12,
    width: "100%",
    overflow: "hidden",
  },
  card: {
    borderRadius: 12,
    backgroundColor: "#000000",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
    paddingVertical: 12,
    paddingHorizontal: 8,
    overflow: "hidden",
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: "rgba(255,255,255,0.9)",
    marginBottom: 8,
  },
  footer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 8,
  },
  priceText: {
    fontSize: 13,
    color: "rgba(255,255,255,0.9)",
    fontWeight: "500",
  },
  timeText: {
    fontSize: 12,
    color: "rgba(255,255,255,0.5)",
  },
});
