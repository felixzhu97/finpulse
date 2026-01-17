'use client';

import React, { useEffect, useRef } from 'react';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  ChartOptions,
  Plugin,
} from 'chart.js';
import { Doughnut } from 'react-chartjs-2';
import type { GaugeChartProps, ChartTheme } from '../types';
import { getThemeColors } from '../utils/chart-helpers';

ChartJS.register(ArcElement, Tooltip, Legend);

export function GaugeChart({
  value,
  min = 0,
  max = 100,
  height = 300,
  theme = 'light',
  label,
  segments = [],
  className,
}: GaugeChartProps) {
  const chartRef = useRef<ChartJS<'doughnut'>>(null);
  const colors = getThemeColors(theme);

  // 计算百分比
  const percentage = ((value - min) / (max - min)) * 100;
  const clampedPercentage = Math.max(0, Math.min(100, percentage));

  // 如果没有提供分段，使用默认颜色分段
  const defaultSegments: Array<{ min: number; max: number; color: string }> = segments.length
    ? segments
    : [
        { min: 0, max: 33, color: colors.success },
        { min: 33, max: 66, color: colors.warning },
        { min: 66, max: 100, color: colors.danger },
      ];

  // 计算数据点
  const dataPoints: number[] = [];
  const backgroundColors: string[] = [];
  let currentValue = min;

  defaultSegments.forEach((segment) => {
    const segmentMin = Math.max(min, ((segment.min / 100) * (max - min) + min));
    const segmentMax = Math.min(max, ((segment.max / 100) * (max - min) + min));
    
    if (currentValue < segmentMax) {
      const segmentValue = Math.min(segmentMax - currentValue, value - currentValue);
      if (segmentValue > 0) {
        dataPoints.push(segmentValue);
        backgroundColors.push(segment.color);
      }
      
      // 如果还没到达目标值，添加空段
      if (currentValue + segmentValue < Math.min(value, segmentMax)) {
        dataPoints.push(segmentMax - currentValue - segmentValue);
        backgroundColors.push(colors.grid + '40'); // 半透明
      }
      
      currentValue = Math.max(currentValue, Math.min(value, segmentMax));
    }
  });

  // 如果还有剩余空间，填充灰色
  const remaining = max - currentValue;
  if (remaining > 0 && value < max) {
    dataPoints.push(remaining);
    backgroundColors.push(colors.grid + '40');
  }

  const chartData = {
    datasets: [
      {
        data: dataPoints.length > 0 ? dataPoints : [max - min],
        backgroundColor: backgroundColors.length > 0 ? backgroundColors : [colors.grid + '40'],
        borderWidth: 0,
        circumference: 270, // 270度，形成半圆效果
        rotation: -135, // 从顶部开始
        cutout: '75%',
      },
    ],
  };

  const options: ChartOptions<'doughnut'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        enabled: false,
      },
    },
  };

  // 自定义插件：绘制中心文本
  const centerTextPlugin: Plugin<'doughnut'> = {
    id: 'centerText',
    beforeDraw: (chart) => {
      const ctx = chart.ctx;
      const centerX = chart.chartArea.left + (chart.chartArea.right - chart.chartArea.left) / 2;
      const centerY = chart.chartArea.top + (chart.chartArea.bottom - chart.chartArea.top) / 2;

      ctx.save();
      ctx.fillStyle = colors.text;
      ctx.font = 'bold 24px Arial';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(`${value.toFixed(1)}`, centerX, centerY - 10);
      
      if (label) {
        ctx.font = '14px Arial';
        ctx.fillStyle = colors.text + 'CC';
        ctx.fillText(label, centerX, centerY + 15);
      }
      
      ctx.restore();
    },
  };

  useEffect(() => {
    if (chartRef.current) {
      ChartJS.register(centerTextPlugin);
    }
    
    return () => {
      ChartJS.unregister(centerTextPlugin);
    };
  }, [value, label, theme]);

  return (
    <div className={className} style={{ width: '100%', height: `${height}px` }}>
      <Doughnut ref={chartRef} data={chartData} options={options} plugins={[centerTextPlugin]} />
    </div>
  );
}
