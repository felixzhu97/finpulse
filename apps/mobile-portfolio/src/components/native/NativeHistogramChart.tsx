import type { ViewProps } from "react-native";
import { Platform, requireNativeComponent, View, StyleSheet } from "react-native";
import { useCallback } from "react";
import type { ComponentType } from "react";
import { useScrollableChart } from "./useScrollableChart";
import { ScrollableChartContainer } from "./ScrollableChartContainer";

export type NativeHistogramChartProps = {
  data?: number[];
  theme?: "light" | "dark";
  timestamps?: number[];
  style?: ViewProps["style"];
} & ViewProps;

const NativeHistogramChartNative =
  Platform.OS !== "web"
    ? requireNativeComponent<NativeHistogramChartProps>("NativeHistogramChart")
    : null;

export function NativeHistogramChart(props: NativeHistogramChartProps) {
  const { data = [], theme = "light", timestamps, style, ...rest } = props;
  const flatData = Array.isArray(data) ? data : [];
  const count = flatData.length;

  const getTooltipPayload = useCallback(
    (index: number) => ({
      value: flatData[index],
      timestamp: timestamps?.[index],
    }),
    [flatData, timestamps]
  );

  const scrollable = useScrollableChart({
    flatData,
    count,
    timestamps,
    theme,
    getTooltipPayload,
  });

  if (Platform.OS === "web") {
    return <View style={[styles.webFallback, style]} {...rest} />;
  }

  const NativeView = NativeHistogramChartNative as ComponentType<NativeHistogramChartProps>;

  return (
    <ScrollableChartContainer
      {...scrollable}
      containerStyle={style}
      renderChart={({ width, minHeight, fill }) => (
        <NativeView
          data={flatData}
          theme={theme}
          style={[fill ? styles.fill : { width }, { minHeight }, styles.chart]}
          {...rest}
        />
      )}
    />
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1 },
  chart: { minHeight: 160 },
  webFallback: { backgroundColor: "#000", minHeight: 160 },
});
