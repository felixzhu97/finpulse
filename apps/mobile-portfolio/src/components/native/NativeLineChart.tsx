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
  showAxisLabels?: boolean;
  theme?: "light" | "dark";
  onInteractionStart?: () => void;
  onInteractionEnd?: () => void;
} & ViewProps;

const NativeLineChartNative =
  Platform.OS !== "web"
    ? requireNativeComponent<NativeLineChartProps>("NativeLineChart")
    : null;

function formatValue(value: number): string {
  if (value >= 1e9) return (value / 1e9).toFixed(2) + "B";
  if (value >= 1e6) return (value / 1e6).toFixed(2) + "M";
  if (value >= 1e3) return (value / 1e3).toFixed(2) + "K";
  return value.toFixed(2);
}

function formatTimestamp(ts: number): string {
  const d = new Date(ts);
  return d.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
}

const Y_LABELS = 4;
const X_LABELS = 5;

export function NativeLineChart(props: NativeLineChartProps) {
  const { data = [], onPointSelect, timestamps, showAxisLabels = true, theme = "light", onInteractionStart, onInteractionEnd, style, ...rest } = props;
  const isDark = theme === "dark";
  const axisColor = isDark ? "rgba(255,255,255,0.85)" : "rgba(0,0,0,0.55)";
  const crosshairColor = isDark ? "rgba(255,255,255,0.4)" : "rgba(0,0,0,0.35)";
  const [layoutWidth, setLayoutWidth] = useState(0);
  const [layoutHeight, setLayoutHeight] = useState(0);
  const [selected, setSelected] = useState<{ index: number; value: number; x: number; ts?: number } | null>(null);

  const minVal = data.length ? Math.min(...data) : 0;
  const maxVal = data.length ? Math.max(...data) : 1;
  const range = maxVal - minVal || 1;
  const yTicks = Array.from({ length: Y_LABELS }, (_, i) => {
    const t = i / (Y_LABELS - 1);
    return maxVal - t * range;
  });
  const xTickIndices = Array.from({ length: X_LABELS }, (_, i) =>
    data.length > 1 ? Math.round((i / (X_LABELS - 1)) * (data.length - 1)) : 0
  );

  const updateSelection = useCallback(
    (touchX: number) => {
      const x = Number(touchX);
      if (!data.length || layoutWidth <= 0 || !Number.isFinite(x)) return;
      const t = Math.max(0, Math.min(1, x / layoutWidth));
      const index = Math.round(t * (data.length - 1));
      const value = data[index] ?? 0;
      setSelected({ index, value, x, ts: timestamps?.[index] });
      onPointSelect?.({ index, value, timestamp: timestamps?.[index] });
    },
    [data.length, layoutWidth, timestamps, onPointSelect]
  );

  const endInteraction = useCallback(() => {
    setSelected(null);
    onInteractionEnd?.();
  }, [onInteractionEnd]);

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
        onPanResponderRelease: endInteraction,
        onPanResponderTerminate: endInteraction,
      }),
    [updateSelection, onInteractionStart, endInteraction]
  );

  if (Platform.OS === "web") {
    return <View {...rest} style={[styles.webFallback, style]} />;
  }

  const NativeView = NativeLineChartNative as ComponentType<NativeLineChartProps>;

  const onLayout = useCallback((e: { nativeEvent: { layout: { width: number; height: number } } }) => {
    const { width, height } = e.nativeEvent.layout;
    setLayoutWidth(width);
    setLayoutHeight(height);
  }, []);

  return (
    <View style={[styles.container, style]} onLayout={onLayout}>
      <NativeView data={data} theme={theme} style={StyleSheet.absoluteFill} {...rest} />
      {showAxisLabels && data.length >= 2 && layoutHeight > 0 && layoutWidth > 0 && (
        <>
          <View style={styles.yAxis} pointerEvents="none">
            {yTicks.map((val, i) => (
              <Text
                key={i}
                style={[
                  styles.axisLabel,
                  styles.yLabel,
                  { top: 8 + (i / (Y_LABELS - 1)) * (layoutHeight - 24), color: axisColor },
                ]}
              >
                {formatValue(val)}
              </Text>
            ))}
          </View>
          <View style={[styles.xAxis, { bottom: 4 }]} pointerEvents="none">
            {xTickIndices.map((idx, i) => {
              const x = data.length > 1 ? (idx / (data.length - 1)) * layoutWidth : layoutWidth / 2;
              const left = Math.max(0, Math.min(layoutWidth - 24, x - 12));
              return (
                <Text key={i} style={[styles.axisLabel, { left, color: axisColor }]}>
                  {timestamps != null && timestamps[idx] != null
                    ? new Date(timestamps[idx]).toLocaleDateString(undefined, { month: "numeric", day: "numeric" })
                    : String(idx + 1)}
                </Text>
              );
            })}
          </View>
        </>
      )}
      <View
        style={[StyleSheet.absoluteFill, { pointerEvents: "auto" }]}
        {...pan.panHandlers}
      >
        {selected !== null && (
          <>
            <View style={[styles.crosshair, { left: selected.x, backgroundColor: crosshairColor }]} />
            <View style={[styles.tooltip, { left: Math.max(8, Math.min(layoutWidth - 8, selected.x - 40)) }]}>
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
    overflow: "hidden",
  },
  axisLabel: {
    position: "absolute",
    fontSize: 10,
    color: "rgba(0,0,0,0.55)",
  },
  yAxis: {
    position: "absolute",
    top: 0,
    right: 4,
    bottom: 20,
    left: 0,
  },
  yLabel: {
    right: 0,
  },
  xAxis: {
    position: "absolute",
    left: 0,
    right: 0,
    height: 16,
  },
  webFallback: {
    backgroundColor: "#f7f7fa",
    justifyContent: "center",
    alignItems: "center",
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
