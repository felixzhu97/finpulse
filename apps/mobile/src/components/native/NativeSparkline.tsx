import type { ComponentType } from "react";
import type { ViewProps } from "react-native";
import { Platform, requireNativeComponent, View } from "react-native";

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
    return <View style={[{ width: 60, height: 32, backgroundColor: "transparent" }, style]} {...rest} />;
  }
  const NativeView = NativeSparklineNative as ComponentType<NativeSparklineProps>;
  return <NativeView trend={trend} data={data} style={[{ width: 60, height: 32 }, style]} {...rest} />;
}
