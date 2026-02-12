import { StyleSheet, Text, View } from "react-native";

export function formatChartValue(value: number): string {
  if (value >= 1e9) return (value / 1e9).toFixed(2) + "B";
  if (value >= 1e6) return (value / 1e6).toFixed(2) + "M";
  if (value >= 1e3) return (value / 1e3).toFixed(2) + "K";
  return value.toFixed(2);
}

export function formatChartTimestamp(ts: number): string {
  const d = new Date(ts);
  return d.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
}

export const chartTooltipStyles = StyleSheet.create({
  crosshair: {
    position: "absolute",
    top: 0,
    bottom: 0,
    width: 1,
    backgroundColor: "rgba(0,0,0,0.35)",
    marginLeft: -0.5,
  },
  crosshairDark: {
    backgroundColor: "rgba(255,255,255,0.4)",
  },
  tooltip: {
    position: "absolute",
    top: 8,
    width: 80,
    paddingVertical: 6,
    paddingHorizontal: 8,
    backgroundColor: "rgba(30,30,34,0.95)",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.12)",
  },
  tooltipValue: {
    fontSize: 14,
    fontWeight: "600",
    color: "#fff",
  },
  tooltipTime: {
    fontSize: 11,
    color: "rgba(255,255,255,0.7)",
    marginTop: 2,
  },
  tooltipRow: {
    fontSize: 11,
    color: "rgba(255,255,255,0.85)",
    marginTop: 2,
  },
});

type TooltipContentProps = {
  value?: number;
  ohlc?: { o: number; h: number; l: number; c: number };
  timestamp?: number;
};

export function ChartTooltipContent({ value, ohlc, timestamp }: TooltipContentProps) {
  if (ohlc != null) {
    return (
      <>
        <Text style={chartTooltipStyles.tooltipValue}>
          C {formatChartValue(ohlc.c)}
        </Text>
        <Text style={chartTooltipStyles.tooltipRow}>
          O {formatChartValue(ohlc.o)} H {formatChartValue(ohlc.h)}
        </Text>
        <Text style={chartTooltipStyles.tooltipRow}>
          L {formatChartValue(ohlc.l)}
        </Text>
        {timestamp != null && (
          <Text style={chartTooltipStyles.tooltipTime}>
            {formatChartTimestamp(timestamp)}
          </Text>
        )}
      </>
    );
  }
  return (
    <>
      <Text style={chartTooltipStyles.tooltipValue}>
        {value != null ? formatChartValue(value) : "—"}
      </Text>
      {timestamp != null && (
        <Text style={chartTooltipStyles.tooltipTime}>
          {formatChartTimestamp(timestamp)}
        </Text>
      )}
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
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      <View
        style={[
          chartTooltipStyles.crosshair,
          isDark && chartTooltipStyles.crosshairDark,
          { left: x },
        ]}
      />
      <View style={[chartTooltipStyles.tooltip, { left: tooltipLeft, width: ohlc ? 100 : 80 }]}>
        <ChartTooltipContent value={value} ohlc={ohlc} timestamp={timestamp} />
      </View>
    </View>
  );
}
