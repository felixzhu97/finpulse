'use client';

import React, { useEffect, useRef } from 'react';
import { createChart, IChartApi, ISeriesApi } from 'lightweight-charts';
import type { LineChartProps, ChartTheme } from '../types';
import { formatTimeForTradingView } from '../utils/data-formatters';
import { getThemeColors } from '../utils/chart-helpers';

export function LineChart({
  data,
  series = [],
  height = 400,
  theme = 'light',
  showGrid = true,
  showCrosshair = true,
  className,
}: LineChartProps) {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const seriesRefsRef = useRef<ISeriesApi<'Line'>[]>([]);

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
        vertLines: { visible: showGrid, color: colors.grid },
        horzLines: { visible: showGrid, color: colors.grid },
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
    seriesRefsRef.current = [];

    // 如果有多系列，为每个系列创建线图
    if (series.length > 0) {
      series.forEach((serie, index) => {
        const lineSeries = chart.addLineSeries({
          color: serie.color || colors.primary,
          lineWidth: 2,
          title: serie.name,
        });
        seriesRefsRef.current.push(lineSeries);
      });
    } else {
      // 单系列模式
      const lineSeries = chart.addLineSeries({
        color: colors.primary,
        lineWidth: 2,
      });
      seriesRefsRef.current.push(lineSeries);
    }

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
  }, [height, theme, showGrid, showCrosshair, series.length]);

  // 更新数据
  useEffect(() => {
    if (seriesRefsRef.current.length === 0) return;

    // 多系列模式
    if (series.length > 0) {
      series.forEach((serie, index) => {
        const lineSeries = seriesRefsRef.current[index];
        if (!lineSeries) return;

        const formattedData = serie.data.map((item) => ({
          time: formatTimeForTradingView(item.time) as any,
          value: item.value,
        }));

        lineSeries.setData(formattedData);
      });
    } else {
      // 单系列模式
      const lineSeries = seriesRefsRef.current[0];
      if (!lineSeries || !data.length) return;

      const formattedData = data.map((item) => ({
        time: formatTimeForTradingView(item.time) as any,
        value: item.value,
      }));

      lineSeries.setData(formattedData);

      // 自动调整视图
      if (chartRef.current && formattedData.length > 0) {
        chartRef.current.timeScale().fitContent();
      }
    }
  }, [data, series]);

  return (
    <div
      ref={chartContainerRef}
      className={className}
      style={{ width: '100%', height: `${height}px` }}
    />
  );
}
