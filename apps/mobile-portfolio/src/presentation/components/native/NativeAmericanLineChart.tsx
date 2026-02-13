import type { ComponentType } from "react";
import { useCallback } from "react";
import type { ViewProps } from "react-native";
import { Platform, requireNativeComponent, View } from "react-native";
import { ScrollableChartContainer } from "./ScrollableChartContainer";
import { useScrollableChart } from "./useScrollableChart";

export type NativeAmericanLineChartProps = {
  data?: number[];
  theme?: "light" | "dark";
  timestamps?: number[];
  style?: ViewProps["style"];
} & ViewProps;

const NativeAmericanLineChartNative =
  Platform.OS !== "web"
    ? requireNativeComponent<NativeAmericanLineChartProps>("NativeAmericanLineChart")
    : null;

export function NativeAmericanLineChart(props: NativeAmericanLineChartProps) {
  const { data = [], theme = "light", timestamps, style, ...rest } = props;
  const flatData = Array.isArray(data) ? data : [];
  const count = Math.floor(flatData.length / 4);

  const getTooltipPayload = useCallback(
    (index: number) => {
      if (index < 0 || index >= count) return {};
      const i = index * 4;
      return {
        ohlc: {
          o: flatData[i] ?? 0,
          h: flatData[i + 1] ?? 0,
          l: flatData[i + 2] ?? 0,
          c: flatData[i + 3] ?? 0,
        },
        timestamp: timestamps?.[index],
      };
    },
    [flatData, count, timestamps]
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

  const NativeView = NativeAmericanLineChartNative as ComponentType<NativeAmericanLineChartProps>;

  return (
    <ScrollableChartContainer
      {...scrollable}
      containerStyle={style}
      renderChart={({ width, minHeight, fill }) => (
        <NativeView
          data={flatData}
          theme={theme}
          style={[fill ? { flex: 1 } : { width }, { minHeight: 160 }]}
          {...rest}
        />
      )}
    />
  );
}
