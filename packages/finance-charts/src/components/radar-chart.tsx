'use client';

import React from 'react';
import {
  RadarChart as RechartsRadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import type { RadarChartProps, ChartTheme } from '../types';
import { getThemeColors } from '../utils/chart-helpers';

export function RadarChart({
  series,
  height = 400,
  theme = 'light',
  className,
}: RadarChartProps) {
  const colors = getThemeColors(theme);

  // 合并所有系列的数据，确保所有维度都存在
  const allSubjects = new Set<string>();
  series.forEach((s) => {
    s.data.forEach((point) => allSubjects.add(point.subject));
  });

  const chartData = Array.from(allSubjects).map((subject) => {
    const dataPoint: Record<string, string | number> = { subject };
    series.forEach((s) => {
      const point = s.data.find((p) => p.subject === subject);
      dataPoint[s.name] = point ? point.value : 0;
    });
    return dataPoint;
  });

  const seriesColors = [
    colors.primary,
    colors.success,
    colors.warning,
    colors.danger,
    '#8b5cf6',
    '#ec4899',
  ];

  // 计算最大值的倍数（用于雷达图范围）
  const maxValue = Math.max(
    ...series.flatMap((s) => s.data.map((p) => p.fullMark || p.value))
  );
  const roundedMax = Math.ceil(maxValue / 20) * 20; // 向上取整到20的倍数

  return (
    <div className={className} style={{ width: '100%', height: `${height}px` }}>
      <ResponsiveContainer width="100%" height="100%">
        <RechartsRadarChart data={chartData}>
          <PolarGrid stroke={colors.grid} />
          <PolarAngleAxis
            dataKey="subject"
            tick={{ fill: colors.text, fontSize: 12 }}
          />
          <PolarRadiusAxis
            angle={90}
            domain={[0, roundedMax]}
            tick={{ fill: colors.text, fontSize: 10 }}
            axisLine={{ stroke: colors.grid }}
          />
          <Legend wrapperStyle={{ color: colors.text }} />
          {series.map((serie, index) => {
            const color = serie.color || seriesColors[index % seriesColors.length];
            return (
              <Radar
                key={serie.name}
                name={serie.name}
                dataKey={serie.name}
                stroke={color}
                fill={color}
                fillOpacity={0.6}
                strokeWidth={2}
              />
            );
          })}
        </RechartsRadarChart>
      </ResponsiveContainer>
    </div>
  );
}
