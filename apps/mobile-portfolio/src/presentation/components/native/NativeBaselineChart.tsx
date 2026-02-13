import type { ComponentType } from "react";
import { useCallback } from "react";
import type { ViewProps } from "react-native";
import { Platform, requireNativeComponent, View } from "react-native";
import { ScrollableChartContainer } from "./ScrollableChartContainer";
import { useScrollableChart } from "./useScrollableChart";

export type NativeBaselineChartProps = {
  data?: number[];
  baselineValue?: number;
  theme?: "light" | "dark";
  timestamps?: number[];
  style?: ViewProps["style"];
} & ViewProps;

const NativeBaselineChartNative =
  Platform.OS !== "web"
    ? requireNativeComponent<NativeBaselineChartProps>("NativeBaselineChart")
    : null;

export function NativeBaselineChart(props: NativeBaselineChartProps) {
  const { data = [], baselineValue, theme = "light", timestamps, style, ...rest } = props;
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
    return <View style={[{ backgroundColor: "#000", minHeight: 160 }, style]} {...rest} />;
  }

  const NativeView = NativeBaselineChartNative as ComponentType<NativeBaselineChartProps>;

  return (
    <ScrollableChartContainer
      {...scrollable}
      containerStyle={style}
      renderChart={({ width, minHeight, fill }) => (
        <NativeView
          data={flatData}
          baselineValue={baselineValue}
          theme={theme}
          style={[fill ? { flex: 1 } : { width }, { minHeight: 160 }]}
          {...rest}
        />
      )}
    />
  );
}
