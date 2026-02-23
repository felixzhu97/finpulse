import { Text, View } from "react-native";
import { AbsoluteFillView } from "@/src/presentation/theme/primitives";
import { formatChartTooltipDate } from "@/src/presentation/utils";

export function formatChartValue(value: number): string {
  if (value >= 1e9) return (value / 1e9).toFixed(2) + "B";
  if (value >= 1e6) return (value / 1e6).toFixed(2) + "M";
  if (value >= 1e3) return (value / 1e3).toFixed(2) + "K";
  return value.toFixed(2);
}

export function formatChartTimestamp(ts: number): string {
  return formatChartTooltipDate(new Date(ts));
}

const tooltipValueStyle = { fontSize: 14, fontWeight: "600" as const, color: "#fff" };
const tooltipTimeStyle = { fontSize: 11, color: "rgba(255,255,255,0.7)", marginTop: 2 };
const tooltipRowStyle = { fontSize: 11, color: "rgba(255,255,255,0.85)", marginTop: 2 };

type TooltipContentProps = {
  value?: number;
  ohlc?: { o: number; h: number; l: number; c: number };
  timestamp?: number;
};

export function ChartTooltipContent({ value, ohlc, timestamp }: TooltipContentProps) {
  if (ohlc != null) {
    return (
      <>
        <Text style={tooltipValueStyle}>C {formatChartValue(ohlc.c)}</Text>
        <Text style={tooltipRowStyle}>O {formatChartValue(ohlc.o)} H {formatChartValue(ohlc.h)}</Text>
        <Text style={tooltipRowStyle}>L {formatChartValue(ohlc.l)}</Text>
        {timestamp != null && <Text style={tooltipTimeStyle}>{formatChartTimestamp(timestamp)}</Text>}
      </>
    );
  }
  return (
    <>
      <Text style={tooltipValueStyle}>{value != null ? formatChartValue(value) : "—"}</Text>
      {timestamp != null && <Text style={tooltipTimeStyle}>{formatChartTimestamp(timestamp)}</Text>}
    </>
  );
}

type ChartTooltipOverlayProps = {
  theme?: "light" | "dark";
  x: number;
  layoutWidth: number;
  value?: number;
  ohlc?: { o: number; h: number; l: number; c: number };
  timestamp?: number;
};

export function ChartTooltipOverlay({
  theme,
  x,
  layoutWidth,
  value,
  ohlc,
  timestamp,
}: ChartTooltipOverlayProps) {
  const isDark = theme === "dark";
  const tooltipW = ohlc ? 100 : 80;
  const tooltipLeft = Math.max(8, Math.min(layoutWidth - tooltipW - 8, x - tooltipW / 2));
  return (
    <AbsoluteFillView pointerEvents="none">
      <View
        style={{
          position: "absolute",
          top: 0,
          bottom: 0,
          width: 1,
          marginLeft: -0.5,
          left: x,
          backgroundColor: isDark ? "rgba(255,255,255,0.4)" : "rgba(0,0,0,0.35)",
        }}
      />
      <View
        style={{
          position: "absolute",
          top: 8,
          width: tooltipW,
          paddingVertical: 6,
          paddingHorizontal: 8,
          backgroundColor: "rgba(30,30,34,0.95)",
          borderRadius: 8,
          borderWidth: 1,
          borderColor: "rgba(255,255,255,0.12)",
          left: tooltipLeft,
        }}
      >
        <ChartTooltipContent value={value} ohlc={ohlc} timestamp={timestamp} />
      </View>
    </AbsoluteFillView>
  );
}
