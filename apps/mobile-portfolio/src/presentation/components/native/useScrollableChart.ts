import { useState, useCallback, useMemo, useRef } from "react";
import { ScrollView, PanResponder } from "react-native";

const MIN_BAR_WIDTH = 52;
const X_LABEL_COUNT = 5;
export const X_AXIS_HEIGHT = 20;

export type TooltipPayload = {
  value?: number;
  ohlc?: { o: number; h: number; l: number; c: number };
  timestamp?: number;
};

export type ScrollableChartSelection = {
  x: number;
  index: number;
} & TooltipPayload;

type UseScrollableChartParams = {
  flatData: number[];
  count: number;
  timestamps?: number[];
  theme: "light" | "dark";
  getTooltipPayload: (index: number) => TooltipPayload;
  showXAxisLabels?: boolean;
};

export function useScrollableChart({
  flatData,
  count,
  timestamps,
  theme,
  getTooltipPayload,
  showXAxisLabels = true,
}: UseScrollableChartParams) {
  const [layoutWidth, setLayoutWidth] = useState(0);
  const [layoutHeight, setLayoutHeight] = useState(0);
  const [scrollX, setScrollX] = useState(0);
  const [selected, setSelected] = useState<ScrollableChartSelection | null>(null);
  const scrollRef = useRef<ScrollView>(null);
  const scrollXRef = useRef(0);
  const startXRef = useRef(0);

  const contentWidth = Math.max(layoutWidth, count * MIN_BAR_WIDTH);
  const canScroll = contentWidth > layoutWidth && layoutWidth > 0;
  const maxScroll = Math.max(0, contentWidth - layoutWidth);
  const chartHeight = layoutHeight > X_AXIS_HEIGHT ? layoutHeight - X_AXIS_HEIGHT : layoutHeight;

  const onLayout = useCallback(
    (e: { nativeEvent: { layout: { width: number; height: number } } }) => {
      const { width, height } = e.nativeEvent.layout;
      setLayoutWidth(width);
      setLayoutHeight(height);
    },
    []
  );

  const onScroll = useCallback(
    (e: { nativeEvent: { contentOffset: { x: number } } }) => {
      const x = e.nativeEvent.contentOffset.x;
      scrollXRef.current = x;
      setScrollX(x);
    },
    []
  );

  const updateSelection = useCallback(
    (viewportX: number, contentX: number) => {
      if (count === 0 || contentWidth <= 0) return;
      const t = contentWidth > 0 ? contentX / contentWidth : 0;
      const index = Math.max(0, Math.min(count - 1, Math.round(t * (count - 1))));
      const x = Math.max(0, Math.min(layoutWidth, viewportX));
      const payload = getTooltipPayload(index);
      setSelected({ x, index, ...payload });
    },
    [count, contentWidth, layoutWidth, getTooltipPayload]
  );

  const pan = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => true,
        onMoveShouldSetPanResponder: () => true,
        onPanResponderGrant: (evt) => {
          const viewportX = evt.nativeEvent.locationX;
          startXRef.current = viewportX;
          const contentX = canScroll
            ? scrollXRef.current + viewportX
            : (viewportX / layoutWidth) * contentWidth;
          updateSelection(viewportX, contentX);
        },
        onPanResponderMove: (evt, gs) => {
          const viewportX = startXRef.current + gs.dx;
          if (canScroll && layoutWidth > 0) {
            const newScrollX = Math.max(0, Math.min(maxScroll, scrollXRef.current + gs.dx));
            scrollRef.current?.scrollTo({ x: newScrollX, animated: false });
            scrollXRef.current = newScrollX;
            setScrollX(newScrollX);
            const contentX = newScrollX + viewportX;
            updateSelection(viewportX, contentX);
          } else {
            const contentX = (viewportX / layoutWidth) * contentWidth;
            updateSelection(viewportX, contentX);
          }
        },
        onPanResponderRelease: () => setSelected(null),
        onPanResponderTerminate: () => setSelected(null),
      }),
    [canScroll, layoutWidth, maxScroll, updateSelection]
  );

  const xLabelIndices = useMemo(() => {
    if (count <= 0 || layoutWidth <= 0) return [];
    return Array.from({ length: X_LABEL_COUNT }, (_, i) => {
      const t = i / (X_LABEL_COUNT - 1);
      const contentX = canScroll ? scrollX + t * layoutWidth : t * layoutWidth;
      return Math.max(0, Math.min(count - 1, Math.round((contentX / contentWidth) * (count - 1))));
    });
  }, [count, contentWidth, layoutWidth, canScroll, scrollX]);

  const axisColor = theme === "dark" ? "rgba(255,255,255,0.7)" : "rgba(0,0,0,0.55)";

  const formatXLabel = useCallback(
    (idx: number) => {
      if (timestamps != null && timestamps[idx] != null) {
        return new Date(timestamps[idx]).toLocaleDateString(undefined, {
          month: "numeric",
          day: "numeric",
        });
      }
      return String(idx + 1);
    },
    [timestamps]
  );

  return {
    layoutWidth,
    layoutHeight,
    scrollX,
    selected,
    scrollRef,
    onLayout,
    onScroll,
    panHandlers: pan.panHandlers,
    contentWidth,
    canScroll,
    chartHeight,
    xLabelIndices,
    axisColor,
    formatXLabel,
    flatData,
    count,
    theme,
    showXAxisLabels,
  };
}

export { MIN_BAR_WIDTH, X_LABEL_COUNT };
