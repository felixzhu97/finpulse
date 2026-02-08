# Native UI components

Bridge components for views implemented in native code (iOS / Android). **NativeDemoCard** (demo card), **NativeLineChart** (line + area chart), and five dedicated chart components that support horizontal scrolling for historical data.

- **Theme**: All chart components accept a `theme` prop (`'light' | 'dark'`; default `'light'`).
- **Tooltips**: Scrollable charts use the same crosshair and tooltip behavior as NativeLineChart; implementation in `chartTooltip.tsx`.
- **Horizontal scroll**: Drag on the chart or x-axis labels to scroll; driven by `useScrollableChart` and wrapped in `ScrollableChartContainer`.
- **Shared logic**: `useScrollableChart` (scroll state, content width, touch handlers), `ScrollableChartContainer` (ScrollView + x-axis labels), `chartTooltip.tsx` (tooltip UI and crosshair).

## NativeDemoCard

Demo native card view with a `title` prop.

- **iOS**: `NativeDemoCard/`; **Android**: `NativeDemoCardView.kt`, `NativeDemoCardViewManager.kt`; `getName() = "NativeDemoCard"`.

## NativeLineChart

Line chart with area fill (grid, red line + gradient). Touch: crosshair and tooltip; optional scroll lock.

- **iOS**: `NativeLineChart/` (NativeLineChartView.swift, ChartShaders.metal); **Android**: `NativeLineChartView.kt`; `getName() = "NativeLineChart"`.
- **Props**: `data`, `timestamps?`, `showAxisLabels?`, `onPointSelect?`, `onInteractionStart?`, `onInteractionEnd?`.

## NativeCandleChart

K-line (candlestick) chart. **Data**: flat array `[open, high, low, close, ...]` per candle. Wraps in horizontal `ScrollView` when content width exceeds view for historical scroll.

- **iOS**: `NativeCandleChart/`; **Android**: `NativeCandleChartView.kt`; `getName() = "NativeCandleChart"`.
- **Props**: `data` (flat OHLC).

## NativeAmericanLineChart

American-style OHLC (open-close segment + high-low wick). Same `data` format as NativeCandleChart. Horizontal scroll when data is long.

- **iOS**: `NativeAmericanLineChart/`; **Android**: `NativeAmericanLineChartView.kt`; `getName() = "NativeAmericanLineChart"`.

## NativeBaselineChart

Line chart with fill above/below a baseline (green above, red below). Horizontal scroll for long series.

- **iOS**: `NativeBaselineChart/`; **Android**: `NativeBaselineChartView.kt`; `getName() = "NativeBaselineChart"`.
- **Props**: `data`, `baselineValue?` (default: average of data).

## NativeHistogramChart

Vertical bar chart. **Props**: `data`. Horizontal scroll when many bars.

- **iOS**: `NativeHistogramChart/`; **Android**: `NativeHistogramChartView.kt`; `getName() = "NativeHistogramChart"`.

## NativeLineOnlyChart

Line only (no fill). **Props**: `data`. Horizontal scroll for long series.

- **iOS**: `NativeLineOnlyChart/`; **Android**: `NativeLineOnlyChartView.kt`; `getName() = "NativeLineOnlyChart"`.

## Usage

```tsx
import {
  NativeLineChart,
  NativeCandleChart,
  NativeAmericanLineChart,
  NativeBaselineChart,
  NativeHistogramChart,
  NativeLineOnlyChart,
} from "@/src/components/native";

const lineData = [100, 102, 101, 105, 103, 108];
const ohlcData = [102, 105, 101, 103, 103, 104, 100, 102];

<NativeLineChart data={lineData} timestamps={[...]} style={{ height: 200 }} />
<NativeCandleChart data={ohlcData} style={{ height: 200 }} />
<NativeAmericanLineChart data={ohlcData} style={{ height: 200 }} />
<NativeBaselineChart data={lineData} baselineValue={102} style={{ height: 200 }} />
<NativeHistogramChart data={lineData} style={{ height: 200 }} />
<NativeLineOnlyChart data={lineData} style={{ height: 200 }} />
```
