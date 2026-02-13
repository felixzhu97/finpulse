import { memo } from "react";
import { NativeSparkline } from "../native/NativeSparkline";

interface SparklineProps {
  trend?: "up" | "down" | "flat";
  data?: number[];
  width?: number;
  height?: number;
}

export const Sparkline = memo(function Sparkline({ trend = "flat", data, width = 60, height = 32 }: SparklineProps) {
  return <NativeSparkline trend={trend} data={data} style={{ width, height }} />;
});
