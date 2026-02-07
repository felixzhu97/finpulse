# Native UI components

Bridge components for views implemented in native code (iOS / Android). Names reflect feature: **NativeDemoCard** (demo card), **NativeLineChart** (portfolio/values line chart).

## NativeDemoCard

Demo native card view with a `title` prop. Used to show a sample of custom native UI on the dashboard.

- **iOS**: `NativeDemoCard/` (NativeDemoCardViewManager.h, .m; NativeDemoCardView); exported as `NativeDemoCard`.
- **Android**: `NativeDemoCardView.kt`, `NativeDemoCardViewManager.kt`, `NativeViewsPackage`; `getName() = "NativeDemoCard"`.

## NativeLineChart

Portfolio/values line chart (light background, grid, red line with gradient fill) rendered on the GPU. Touch shows crosshair and tooltip; optional scroll lock while interacting.

- **iOS**: `NativeLineChart/` (NativeLineChartView.swift, NativeLineChartViewManager.swift, .m, ChartShaders.metal); exported as `NativeLineChart`.
- **Android**: `NativeLineChartView.kt`, `NativeLineChartViewManager.kt`; `getName() = "NativeLineChart"`.
- **Web**: Placeholder view (no native GPU).

**Props**: `data`, `timestamps?`, `showAxisLabels?`, `onPointSelect?`, `onInteractionStart?`, `onInteractionEnd?`, plus `ViewProps`.

**Usage**

```tsx
import { NativeLineChart, NativeDemoCard } from "@/src/components/native";

<NativeDemoCard title="Demo card" style={{ height: 80 }} />

<NativeLineChart
  data={[100, 102, 101, 105, 103, 108]}
  timestamps={[...]}
  style={{ height: 200 }}
  onInteractionStart={() => setScrollLock(true)}
  onInteractionEnd={() => setScrollLock(false)}
/>
```
