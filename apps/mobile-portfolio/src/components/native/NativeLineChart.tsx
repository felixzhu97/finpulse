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

export function NativeLineChart(props: NativeLineChartProps) {
  const { data = [], onPointSelect, timestamps, theme = "light", trend: trendProp, baselineValue, onInteractionStart, onInteractionEnd, style, ...rest } = props;
  const isDark = theme === "dark";
  const crosshairColor = isDark ? "rgba(255,255,255,0.4)" : "rgba(0,0,0,0.35)";
  const [layoutWidth, setLayoutWidth] = useState(0);
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
      const t = Math.max(0, Math.min(1, touchX / layoutWidth));
      const index = Math.round(t * (data.length - 1));
      const value = data[index] ?? 0;
      const payload = { index, value, timestamp: timestamps?.[index] };
      setSelected({ index, value, x: touchX, ts: payload.timestamp });
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

  const onLayout = useCallback((e: { nativeEvent: { layout: { width: number } } }) => {
    setLayoutWidth(e.nativeEvent.layout.width);
  }, []);

  return (
    <View style={[styles.container, style]} onLayout={onLayout}>
      <NativeView 
        data={data} 
        theme={theme} 
        trend={trend}
        timestamps={timestamps}
        baselineValue={baselineValue}
        style={StyleSheet.absoluteFill} 
        {...rest} 
      />
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
    overflow: "visible",
    backgroundColor: "transparent",
    paddingRight: 0,
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
