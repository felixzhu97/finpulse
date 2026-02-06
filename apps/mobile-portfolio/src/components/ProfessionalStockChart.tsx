import { View, Text } from "react-native";
import { LineChart, CandlestickChart } from "react-native-wagmi-charts";

type LinePoint = {
  timestamp: number;
  value: number;
};

type CandlePoint = {
  timestamp: number;
  open: number;
  high: number;
  low: number;
  close: number;
};

interface ProfessionalStockChartProps {
  linePoints: LinePoint[];
  candlePoints: CandlePoint[];
}

export function ProfessionalStockChart({
  linePoints,
  candlePoints,
}: ProfessionalStockChartProps) {
  if (!linePoints.length || !candlePoints.length) {
    return null;
  }

  return (
    <View style={{ gap: 12 }}>
      <View
        style={{
          borderRadius: 12,
          backgroundColor: "#ffffff",
          borderWidth: 1,
          borderColor: "rgba(15, 23, 42, 0.06)",
          paddingVertical: 12,
          paddingHorizontal: 8,
        }}
      >
        <Text
          style={{
            fontSize: 14,
            fontWeight: "600",
            color: "#111827",
            marginBottom: 8,
          }}
        >
          Price line
        </Text>
        <LineChart.Provider data={linePoints}>
          <LineChart height={160}>
            <LineChart.Path color="#2563eb" />
            <LineChart.CursorCrosshair />
          </LineChart>
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              marginTop: 8,
            }}
          >
            <LineChart.PriceText
              style={{ fontSize: 13, color: "#111827", fontWeight: "500" }}
            />
            <LineChart.DatetimeText
              style={{ fontSize: 12, color: "#6b7280" }}
            />
          </View>
        </LineChart.Provider>
      </View>
      <View
        style={{
          borderRadius: 12,
          backgroundColor: "#ffffff",
          borderWidth: 1,
          borderColor: "rgba(15, 23, 42, 0.06)",
          paddingVertical: 12,
          paddingHorizontal: 8,
        }}
      >
        <Text
          style={{
            fontSize: 14,
            fontWeight: "600",
            color: "#111827",
            marginBottom: 8,
          }}
        >
          Candlestick
        </Text>
        <CandlestickChart.Provider data={candlePoints}>
          <CandlestickChart height={200}>
            <CandlestickChart.Candles />
            <CandlestickChart.Crosshair />
          </CandlestickChart>
          <View
            style={{
              marginTop: 8,
              flexDirection: "row",
              justifyContent: "space-between",
            }}
          >
            <CandlestickChart.PriceText
              type="close"
              style={{ fontSize: 13, color: "#111827", fontWeight: "500" }}
            />
            <CandlestickChart.DatetimeText
              style={{ fontSize: 12, color: "#6b7280" }}
            />
          </View>
        </CandlestickChart.Provider>
      </View>
    </View>
  );
}

