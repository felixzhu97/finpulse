'use client';

import React, { useEffect, useRef } from 'react';
import { createChart, IChartApi, ISeriesApi } from 'lightweight-charts';
import type { VolumeChartProps, ChartTheme } from '../types';
import { formatTimeForTradingView } from '../utils/data-formatters';
import { getThemeColors } from '../utils/chart-helpers';

export function VolumeChart({
  data,
  height = 300,
  theme = 'light',
  className,
}: VolumeChartProps) {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const volumeSeriesRef = useRef<ISeriesApi<'Histogram'> | null>(null);

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
      rightPriceScale: {
        borderColor: colors.grid,
        visible: false,
      },
      timeScale: {
        borderColor: colors.grid,
        timeVisible: true,
        secondsVisible: false,
      },
      handleScroll: {
        mouseWheel: false,
        pressedMouseMove: false,
      },
      handleScale: {
        axisPressedMouseMove: false,
        mouseWheel: false,
        pinch: false,
      },
    });

    chartRef.current = chart;

    // 创建成交量系列
    const volumeSeries = chart.addHistogramSeries({
      priceFormat: {
        type: 'volume',
      },
      priceScaleId: '',
      scaleMargins: {
        top: 0.8,
        bottom: 0,
      },
    });

    volumeSeriesRef.current = volumeSeries;

    // 处理窗口大小变化
    const handleResize = () => {
      if (chartContainerRef.current && chart) {
        chart.applyOptions({
          width: chartContainerRef.current.clientWidth,
        });
      }
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      chart.remove();
    };
  }, [height, theme]);

  // 更新数据
  useEffect(() => {
    if (!volumeSeriesRef.current || !data.length) return;

    const colors = getThemeColors(theme);
    
    const formattedData = data.map((item) => ({
      time: formatTimeForTradingView(item.time) as any,
      value: item.value,
      color: item.color || colors.primary,
    }));

    volumeSeriesRef.current.setData(formattedData);

    // 自动调整视图
    if (chartRef.current && formattedData.length > 0) {
      chartRef.current.timeScale().fitContent();
    }
  }, [data, theme]);

  return (
    <div
      ref={chartContainerRef}
      className={className}
      style={{ width: '100%', height: `${height}px` }}
    />
  );
}
