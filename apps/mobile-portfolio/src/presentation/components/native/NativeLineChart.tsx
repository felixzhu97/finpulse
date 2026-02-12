import type { ComponentType } from "react";
import { useCallback, useMemo, useState } from "react";
import type { ViewProps } from "react-native";
import {
  Platform,
  requireNativeComponent,
  StyleSheet,
  Text,
  View,
  PanResponder,
} from "react-native";

export type PointSelectPayload = {
  index: number;
  value: number;
  timestamp?: number;
};

export type NativeLineChartProps = {
  data?: number[];
  onPointSelect?: (point: PointSelectPayload) => void;
  timestamps?: number[];
  theme?: "light" | "dark";
  trend?: "up" | "down" | "flat";
  baselineValue?: number;
  onInteractionStart?: () => void;
  onInteractionEnd?: () => void;
} & ViewProps;

const NativeLineChartNative =
  Platform.OS !== "web"
    ? requireNativeComponent<NativeLineChartProps>("NativeLineChart")
    : null;

function formatValue(value: number): string {
  if (value >= 1e9) return `${(value / 1e9).toFixed(2)}B`;
  if (value >= 1e6) return `${(value / 1e6).toFixed(2)}M`;
  if (value >= 1e3) return `${(value / 1e3).toFixed(2)}K`;
  if (value >= 1) return value.toFixed(2);
  if (value >= 0.01) return value.toFixed(4);
  return value.toFixed(6);
}

function formatTimestamp(ts: number): string {
  return new Date(ts).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
}

function formatHour(ts: number): string {
  return new Date(ts).getHours().toString();
}

export function NativeLineChart(props: NativeLineChartProps) {
  const { data = [], onPointSelect, timestamps, theme = "light", trend: trendProp, baselineValue, onInteractionStart, onInteractionEnd, style, ...rest } = props;
  const isDark = theme === "dark";
  const crosshairColor = isDark ? "rgba(255,255,255,0.4)" : "rgba(0,0,0,0.35)";
  const [layoutWidth, setLayoutWidth] = useState(0);
  const [layoutHeight, setLayoutHeight] = useState(0);
  const [selected, setSelected] = useState<{ index: number; value: number; x: number; ts?: number } | null>(null);
  
  const trend = useMemo(() => {
    if (trendProp !== undefined) return trendProp;
    if (baselineValue !== undefined && data.length > 0) {
      const latestValue = data[data.length - 1];
      const diff = latestValue - baselineValue;
      const range = Math.max(...data) - Math.min(...data) || 1;
      const threshold = range * 0.001;
      if (diff > threshold) return "up";
      if (diff < -threshold) return "down";
      return "flat";
    }
    return "flat";
  }, [trendProp, baselineValue, data]);

  const updateSelection = useCallback(
    (touchX: number) => {
      if (!data.length || layoutWidth <= 0 || !Number.isFinite(touchX)) return;
      const chartWidth = layoutWidth > 90 ? layoutWidth - 90 : layoutWidth;
      const clampedX = Math.max(0, Math.min(chartWidth, touchX));
      const t = Math.max(0, Math.min(1, clampedX / chartWidth));
      const index = Math.round(t * (data.length - 1));
      const value = data[index] ?? 0;
      const payload = { index, value, timestamp: timestamps?.[index] };
      setSelected({ index, value, x: clampedX, ts: payload.timestamp });
      onPointSelect?.(payload);
    },
    [data, layoutWidth, timestamps, onPointSelect]
  );

  const pan = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => true,
        onMoveShouldSetPanResponder: () => true,
        onPanResponderGrant: (evt) => {
          onInteractionStart?.();
          updateSelection(evt.nativeEvent.locationX);
        },
        onPanResponderMove: (evt) => updateSelection(evt.nativeEvent.locationX),
        onPanResponderRelease: () => {
          setSelected(null);
          onInteractionEnd?.();
        },
        onPanResponderTerminate: () => {
          setSelected(null);
          onInteractionEnd?.();
        },
      }),
    [updateSelection, onInteractionStart, onInteractionEnd]
  );

  if (Platform.OS === "web") {
    return <View {...rest} style={[styles.webFallback, style]} />;
  }

  const NativeView = NativeLineChartNative as ComponentType<NativeLineChartProps>;

  const onLayout = useCallback((e: { nativeEvent: { layout: { width: number; height: number } } }) => {
    setLayoutWidth(e.nativeEvent.layout.width);
    setLayoutHeight(e.nativeEvent.layout.height);
  }, []);

  const chartWidth = layoutWidth > 90 ? layoutWidth - 90 : layoutWidth;
  const xAxisLabelHeight = 20;
  const chartDataHeight = layoutHeight > xAxisLabelHeight ? layoutHeight - xAxisLabelHeight : layoutHeight;

  const yAxisLabels = useMemo(() => {
    if (data.length === 0 || chartDataHeight === 0) return [];
    const minVal = Math.min(...data);
    const maxVal = Math.max(...data);
    const range = maxVal - minVal || 1;
    const labelCount = 6;
    
    return Array.from({ length: labelCount }, (_, i) => {
      const t = i / (labelCount - 1);
      const value = maxVal - t * range;
      const yPosition = (1.0 - t) * chartDataHeight;
      return { value, yPosition };
    });
  }, [data, chartDataHeight]);

  const xAxisLabels = useMemo(() => {
    if (!timestamps || timestamps.length === 0 || chartWidth === 0) return [];
    const labelCount = 5;
    const startTime = timestamps[0];
    const endTime = timestamps[timestamps.length - 1];
    const duration = endTime - startTime;
    const labelWidth = 24;
    
    return Array.from({ length: labelCount }, (_, i) => {
      const t = i / (labelCount - 1);
      const timestamp = startTime + t * duration;
      const hour = formatHour(timestamp);
      let x: number;
      let textAlign: "left" | "center" | "right";
      if (i === 0) {
        x = 0;
        textAlign = "left";
      } else if (i === labelCount - 1) {
        x = chartWidth - labelWidth;
        textAlign = "right";
      } else {
        x = t * chartWidth - labelWidth / 2;
        textAlign = "center";
      }
      return { hour, x, textAlign, timestamp };
    });
  }, [timestamps, chartWidth]);

  const labelColor = isDark ? "rgba(255,255,255,0.9)" : "rgba(0,0,0,0.7)";

  return (
    <View style={[styles.container, style]} onLayout={onLayout}>
      <View style={{ width: chartWidth, height: chartDataHeight }}>
        <NativeView 
          data={data} 
          theme={theme} 
          trend={trend}
          timestamps={timestamps}
          baselineValue={baselineValue}
          style={StyleSheet.absoluteFill} 
          {...rest} 
        />
      </View>
      {yAxisLabels.map((label, i) => (
        <Text
          key={`y-${i}`}
          style={[
            styles.yAxisLabel,
            {
              color: labelColor,
              top: label.yPosition - 8,
              left: chartWidth + 8,
            },
          ]}
        >
          {formatValue(label.value)}
        </Text>
      ))}
      {xAxisLabels.map((label, i) => (
        <Text
          key={`x-${i}`}
          style={[
            styles.xAxisLabel,
            {
              color: labelColor,
              left: Math.max(0, label.x),
              top: chartDataHeight + 4,
              textAlign: label.textAlign,
            },
          ]}
        >
          {label.hour}
        </Text>
      ))}
      <View
        style={[{ width: chartWidth, height: chartDataHeight, position: "absolute", left: 0, top: 0 }, { pointerEvents: "auto" }]}
        {...pan.panHandlers}
      >
        {selected !== null && (
          <>
            <View style={[styles.crosshair, { left: selected.x, backgroundColor: crosshairColor }]} />
            <View style={[styles.tooltip, { left: Math.max(8, Math.min(chartWidth - 8, selected.x - 40)) }]}>
              <Text style={styles.tooltipValue}>{formatValue(selected.value)}</Text>
              {selected.ts != null && <Text style={styles.tooltipTime}>{formatTimestamp(selected.ts)}</Text>}
            </View>
          </>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    overflow: "visible",
    backgroundColor: "transparent",
  },
  webFallback: {
    backgroundColor: "#f7f7fa",
    justifyContent: "center",
    alignItems: "center",
  },
  yAxisLabel: {
    position: "absolute",
    fontSize: 12,
    fontWeight: "500",
    width: 80,
    pointerEvents: "none",
  },
  xAxisLabel: {
    position: "absolute",
    fontSize: 12,
    fontWeight: "500",
    width: 24,
    height: 16,
    pointerEvents: "none",
  },
  crosshair: {
    position: "absolute",
    top: 0,
    bottom: 0,
    width: 1,
    backgroundColor: "rgba(0,0,0,0.35)",
    marginLeft: -0.5,
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
});
