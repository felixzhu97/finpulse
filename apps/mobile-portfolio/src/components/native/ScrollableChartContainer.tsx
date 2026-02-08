import { View, ScrollView, StyleSheet, Text } from "react-native";
import type { StyleProp, ViewStyle } from "react-native";
import type { ReactNode } from "react";
import { ChartTooltipOverlay } from "./chartTooltip";
import { X_AXIS_HEIGHT, X_LABEL_COUNT } from "./useScrollableChart";
import type { ScrollableChartSelection } from "./useScrollableChart";

const styles = StyleSheet.create({
  container: { overflow: "hidden" },
  chartArea: { flex: 1 },
  scrollContent: { flexGrow: 1 },
  xAxisRow: { height: X_AXIS_HEIGHT, position: "relative" },
  xLabel: { position: "absolute", fontSize: 10, top: 2 },
});

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
  renderChart,
  containerStyle,
}: ScrollableChartContainerProps) {
  const chart = renderChart({
    width: contentWidth,
    minHeight: chartHeight,
    fill: !canScroll,
  });

  return (
    <View style={[styles.container, containerStyle]} onLayout={onLayout}>
      <View style={[styles.chartArea, { minHeight: chartHeight }]}>
        {canScroll ? (
          <ScrollView
            ref={scrollRef}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}
            onScroll={onScroll}
            scrollEventThrottle={16}
          >
            {chart}
          </ScrollView>
        ) : (
          chart
        )}
      </View>
      {layoutHeight > X_AXIS_HEIGHT && xLabelIndices.length > 0 && (
        <View style={[styles.xAxisRow, { pointerEvents: "none" }]}>
          {xLabelIndices.map((idx, i) => {
            const left = layoutWidth * (i / (X_LABEL_COUNT - 1)) - 16;
            const clampedLeft = Math.max(4, Math.min(layoutWidth - 32, left));
            return (
              <Text key={i} style={[styles.xLabel, { left: clampedLeft, color: axisColor }]}>
                {formatXLabel(idx)}
              </Text>
            );
          })}
        </View>
      )}
      <View style={[StyleSheet.absoluteFill, { pointerEvents: "auto" }]} {...panHandlers}>
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
      </View>
    </View>
  );
}
