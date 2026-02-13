import { useCallback, useMemo, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { NativeLineChart } from "@/src/presentation/components/native/NativeLineChart";
import { useTheme } from "@/src/presentation/theme";
import { formatPrice } from "@/src/presentation/utils";

interface InteractiveStockChartProps {
  data: number[];
  timestamps?: number[];
  trend?: "up" | "down" | "flat";
  baselineValue?: number;
  width: number;
  height: number;
}

function formatTimestamp(ts: number): string {
  const d = new Date(ts);
  const now = new Date();
  const diffMs = now.getTime() - ts;
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) {
    return d.toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" });
  } else if (diffDays === 1) {
    return "Yesterday";
  } else if (diffDays < 7) {
    return d.toLocaleDateString(undefined, { weekday: "short" });
  } else {
    return d.toLocaleDateString(undefined, { month: "short", day: "numeric" });
  }
}

export function InteractiveStockChart({
  data,
  timestamps,
  trend,
  baselineValue,
  width,
  height,
}: InteractiveStockChartProps) {
  const { isDark, colors } = useTheme();
  const theme = isDark ? "dark" : "light";

  const onInteractionEnd = useCallback(() => {
    // Interaction ended - NativeLineChart handles clearing selection
  }, []);

  if (data.length === 0) {
    return (
      <View style={[styles.container, { width, height }]}>
        <Text style={[styles.emptyText, { color: colors.textSecondary }]}>No data</Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { width, height }]}>
      <NativeLineChart
        data={data}
        timestamps={timestamps}
        trend={trend}
        baselineValue={baselineValue}
        onInteractionEnd={onInteractionEnd}
        theme={theme}
        style={{ width: width + 135, height  }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "relative",
    overflow: "visible",
  },
  emptyText: {
    fontSize: 14,
    textAlign: "center",
    marginTop: 50,
  },
  tooltipContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    pointerEvents: "none",
  },
  tooltip: {
    position: "absolute",
    top: 8,
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 8,
    borderWidth: 1,
    minWidth: 80,
    alignItems: "center",
  },
  tooltipValue: {
    fontSize: 14,
    fontWeight: "600",
  },
  tooltipTime: {
    fontSize: 11,
    marginTop: 2,
  },
});
