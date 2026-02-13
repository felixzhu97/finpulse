import type { ComponentType } from "react";
import type { ViewProps } from "react-native";
import { Platform, requireNativeComponent, View } from "react-native";

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

  if (Platform.OS === "web") {
    return <View style={[{ backgroundColor: "#000", minHeight: 160 }, style]} {...rest} />;
  }

  const NativeView = NativeHistogramChartNative as ComponentType<NativeHistogramChartProps>;

  return (
    <NativeView
      data={flatData}
      theme={theme}
      style={[style, { minHeight: 160 }]}
      {...rest}
    />
  );
}
