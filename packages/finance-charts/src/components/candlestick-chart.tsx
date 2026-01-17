"use client";

import React, { useEffect, useRef } from "react";
import { createChart, IChartApi, ISeriesApi } from "lightweight-charts";
import type {
  CandlestickChartProps,
  PriceDataPoint,
  ChartTheme,
} from "../types";
import { formatTimeForTradingView } from "../utils/data-formatters";
import { getThemeColors } from "../utils/chart-helpers";

export function CandlestickChart({
  data,
  height = 400,
  theme = "light",
  showVolume = true,
  showCrosshair = true,
  onCrosshairMove,
  className,
}: CandlestickChartProps) {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const candlestickSeriesRef = useRef<ISeriesApi<"Candlestick"> | null>(null);
  const volumeSeriesRef = useRef<ISeriesApi<"Histogram"> | null>(null);

  useEffect(() => {
    if (!chartContainerRef.current) return;

    const colors = getThemeColors(theme);

    // 创建图表
    const chart = createChart(chartContainerRef.current, {
      layout: {
        background: { color: colors.background },
        textColor: colors.text,
      },
      grid: {
        vertLines: { color: colors.grid },
        horzLines: { color: colors.grid },
      },
      width: chartContainerRef.current.clientWidth,
      height,
      crosshair: {
        mode: showCrosshair ? 1 : 0,
      },
      rightPriceScale: {
        borderColor: colors.grid,
      },
      timeScale: {
        borderColor: colors.grid,
        timeVisible: true,
        secondsVisible: false,
      },
    });

    chartRef.current = chart;

    // 创建蜡烛图系列
    const candlestickSeries = chart.addCandlestickSeries({
      upColor: colors.success,
      downColor: colors.danger,
      borderVisible: false,
      wickUpColor: colors.success,
      wickDownColor: colors.danger,
    });

    candlestickSeriesRef.current = candlestickSeries;

    // 创建成交量系列（如果需要）
    let volumeSeries: ISeriesApi<"Histogram"> | null = null;
    if (showVolume) {
      volumeSeries = chart.addHistogramSeries({
        color: colors.primary,
        priceFormat: {
          type: "volume",
        },
        priceScaleId: "",
        scaleMargins: {
          top: 0.8,
          bottom: 0,
        },
      });
      volumeSeriesRef.current = volumeSeries;
    }

    // 处理十字线移动
    if (onCrosshairMove) {
      chart.subscribeCrosshairMove((param) => {
        if (param.point === undefined || !param.time || !param.seriesData) {
          onCrosshairMove(null);
          return;
        }

        const candlestickData = param.seriesData.get(candlestickSeries);
        if (candlestickData && "open" in candlestickData) {
          const dataPoint: PriceDataPoint = {
            time: param.time as number,
            open: candlestickData.open as number,
            high: candlestickData.high as number,
            low: candlestickData.low as number,
            close: candlestickData.close as number,
          };
          onCrosshairMove(dataPoint);
        }
      });
    }

    // 处理窗口大小变化
    const handleResize = () => {
      if (chartContainerRef.current && chart) {
        chart.applyOptions({
          width: chartContainerRef.current.clientWidth,
        });
      }
    };

    window.addEventListener("resize", handleResize);

    // 清理函数
    return () => {
      window.removeEventListener("resize", handleResize);
      chart.remove();
    };
  }, [height, theme, showVolume, showCrosshair, onCrosshairMove]);

  // 更新数据
  useEffect(() => {
    if (!candlestickSeriesRef.current || !data.length) return;

    const formattedData = data.map((item) => ({
      time: formatTimeForTradingView(item.time) as any,
      open: item.open,
      high: item.high,
      low: item.low,
      close: item.close,
    }));

    candlestickSeriesRef.current.setData(formattedData);

    // 更新成交量数据
    if (volumeSeriesRef.current && showVolume) {
      const volumeData = data
        .filter((item) => item.volume !== undefined)
        .map((item) => ({
          time: formatTimeForTradingView(item.time) as any,
          value: item.volume!,
          color:
            item.close >= item.open
              ? getThemeColors(theme).success
              : getThemeColors(theme).danger,
        }));

      volumeSeriesRef.current.setData(volumeData);
    }

    // 自动调整视图
    if (chartRef.current && formattedData.length > 0) {
      chartRef.current.timeScale().fitContent();
    }
  }, [data, showVolume, theme]);

  return (
    <div
      ref={chartContainerRef}
      className={className}
      style={{ width: "100%", height: `${height}px` }}
    />
  );
}
