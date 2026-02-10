import type { ComponentType } from "react";
import { useCallback } from "react";
import type { ViewProps } from "react-native";
import { Platform, requireNativeComponent, StyleSheet, View } from "react-native";
import { ScrollableChartContainer } from "./ScrollableChartContainer";
import { useScrollableChart } from "./useScrollableChart";

export type NativeLineOnlyChartProps = {
  data?: number[];
  theme?: "light" | "dark";
  timestamps?: number[];
  style?: ViewProps["style"];
} & ViewProps;

const NativeLineOnlyChartNative =
  Platform.OS !== "web"
    ? requireNativeComponent<NativeLineOnlyChartProps>("NativeLineOnlyChart")
    : null;

export function NativeLineOnlyChart(props: NativeLineOnlyChartProps) {
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

  const NativeView = NativeLineOnlyChartNative as ComponentType<NativeLineOnlyChartProps>;

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
