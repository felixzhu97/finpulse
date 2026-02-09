import type { ViewProps } from "react-native";
import { Platform, requireNativeComponent, View, StyleSheet } from "react-native";
import type { ComponentType } from "react";

export type NativeSparklineProps = {
  trend?: "up" | "down" | "flat";
  data?: number[];
  style?: ViewProps["style"];
} & ViewProps;

const NativeSparklineNative =
  Platform.OS !== "web"
    ? requireNativeComponent<NativeSparklineProps>("NativeSparkline")
    : null;

export function NativeSparkline({ trend = "flat", data, style, ...rest }: NativeSparklineProps) {
  if (Platform.OS === "web" || !NativeSparklineNative) {
    return <View style={[styles.fallback, style]} {...rest} />;
  }
  const NativeView = NativeSparklineNative as ComponentType<NativeSparklineProps>;
  return <NativeView trend={trend} data={data} style={[styles.chart, style]} {...rest} />;
}

const styles = StyleSheet.create({
  chart: {
    width: 60,
    height: 32,
  },
  fallback: {
    width: 60,
    height: 32,
    backgroundColor: "transparent",
  },
});
