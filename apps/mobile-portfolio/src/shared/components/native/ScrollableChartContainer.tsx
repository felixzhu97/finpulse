import { View, ScrollView, Text } from "react-native";
import type { StyleProp, ViewStyle } from "react-native";
import type { ReactNode } from "react";
import { ChartTooltipOverlay } from "./chartTooltip";
import { AbsoluteFillView } from "@/src/shared/theme/primitives";
import { X_AXIS_HEIGHT, X_LABEL_COUNT } from "./useScrollableChart";
import type { ScrollableChartSelection } from "./useScrollableChart";

type ScrollableChartContainerProps = {
  layoutWidth: number;
  layoutHeight: number;
  chartHeight: number;
  contentWidth: number;
  canScroll: boolean;
  scrollRef: React.RefObject<ScrollView | null>;
  onLayout: (e: { nativeEvent: { layout: { width: number; height: number } } }) => void;
  onScroll: (e: { nativeEvent: { contentOffset: { x: number } } }) => void;
  panHandlers: object;
  xLabelIndices: number[];
  axisColor: string;
  formatXLabel: (idx: number) => string;
  selected: ScrollableChartSelection | null;
  theme: "light" | "dark";
  showXAxisLabels?: boolean;
  renderChart: (chartProps: { width: number; minHeight: number; fill: boolean }) => ReactNode;
  containerStyle?: StyleProp<ViewStyle>;
};

export function ScrollableChartContainer({
  layoutWidth,
  layoutHeight,
  chartHeight,
  contentWidth,
  canScroll,
  scrollRef,
  onLayout,
  onScroll,
  panHandlers,
  xLabelIndices,
  axisColor,
  formatXLabel,
  selected,
  theme,
  showXAxisLabels = true,
  renderChart,
  containerStyle,
}: ScrollableChartContainerProps) {
  const chart = renderChart({
    width: contentWidth,
    minHeight: chartHeight,
    fill: !canScroll,
  });

  return (
    <View style={[{ overflow: "hidden" }, containerStyle]} onLayout={onLayout}>
      <View style={{ flex: 1, minHeight: chartHeight }}>
        {canScroll ? (
          <ScrollView
            ref={scrollRef}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ flexGrow: 1 }}
            onScroll={onScroll}
            scrollEventThrottle={16}
          >
            {chart}
          </ScrollView>
        ) : (
          chart
        )}
      </View>
      {showXAxisLabels && layoutHeight > X_AXIS_HEIGHT && xLabelIndices.length > 0 && (
        <View style={{ height: X_AXIS_HEIGHT, position: "relative" as const, pointerEvents: "none" }}>
          {xLabelIndices.map((idx, i) => {
            const left = layoutWidth * (i / (X_LABEL_COUNT - 1)) - 16;
            const clampedLeft = Math.max(4, Math.min(layoutWidth - 32, left));
            return (
              <Text key={i} style={{ position: "absolute" as const, fontSize: 10, top: 2, left: clampedLeft, color: axisColor }}>
                {formatXLabel(idx)}
              </Text>
            );
          })}
        </View>
      )}
      <AbsoluteFillView style={{ pointerEvents: "auto" as const }} {...panHandlers}>
        {selected !== null && (
          <ChartTooltipOverlay
            theme={theme}
            x={selected.x}
            layoutWidth={layoutWidth}
            value={selected.value}
            ohlc={selected.ohlc}
            timestamp={selected.timestamp}
          />
        )}
      </AbsoluteFillView>
    </View>
  );
}
