'use client';

import React from 'react';
import {
  AreaChart as RechartsAreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import type { AreaChartProps, TimeDataPoint } from '../types';
import { getThemeColors } from '../utils/chart-helpers';

export function AreaChart({
  data,
  series = [],
  height = 400,
  theme = 'light',
  showGrid = true,
  gradient = true,
  className,
}: AreaChartProps) {
  const colors = getThemeColors(theme);
  
  // 转换数据格式为 Recharts 格式
  const chartData = React.useMemo(() => {
    if (series.length > 0) {
      // 多系列模式：合并数据
      const timeMap = new Map<string | number, Record<string, any>>();
      
      series.forEach((serie) => {
        serie.data.forEach((point) => {
          const key = point.time;
          if (!timeMap.has(key)) {
            timeMap.set(key, { time: point.time });
          }
          timeMap.get(key)![serie.name] = point.value;
        });
      });
      
      return Array.from(timeMap.values()).sort((a, b) => {
        const aTime = typeof a.time === 'string' ? new Date(a.time).getTime() : a.time;
        const bTime = typeof b.time === 'string' ? new Date(b.time).getTime() : b.time;
        return aTime - bTime;
      });
    }
    
    // 单系列模式
    return data.map((point) => ({
      time: point.time,
      value: point.value,
    }));
  }, [data, series]);

  const seriesColors = [
    colors.primary,
    colors.success,
    colors.warning,
    colors.danger,
    '#8b5cf6',
    '#ec4899',
  ];

  return (
    <div className={className} style={{ width: '100%', height: `${height}px` }}>
      <ResponsiveContainer width="100%" height="100%">
        <RechartsAreaChart
          data={chartData}
          margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
        >
          <defs>
            {series.length > 0 ? (
              series.map((serie, index) => {
                const color = serie.color || seriesColors[index % seriesColors.length];
                return gradient ? (
                  <linearGradient key={serie.name} id={`color${serie.name}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={color} stopOpacity={0.8} />
                    <stop offset="95%" stopColor={color} stopOpacity={0} />
                  </linearGradient>
                ) : (
                  <linearGradient key={serie.name} id={`color${serie.name}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={color} stopOpacity={1} />
                    <stop offset="95%" stopColor={color} stopOpacity={1} />
                  </linearGradient>
                );
              })
            ) : (
              gradient ? (
                <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={colors.primary} stopOpacity={0.8} />
                  <stop offset="95%" stopColor={colors.primary} stopOpacity={0} />
                </linearGradient>
              ) : null
            )}
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke={colors.grid} opacity={showGrid ? 1 : 0} />
          <XAxis
            dataKey="time"
            tick={{ fill: colors.text }}
            stroke={colors.grid}
            tickFormatter={(value) => {
              if (typeof value === 'number') {
                return new Date(value * 1000).toLocaleDateString('zh-CN', {
                  month: 'short',
                  day: 'numeric',
                });
              }
              return String(value);
            }}
          />
          <YAxis tick={{ fill: colors.text }} stroke={colors.grid} />
          <Tooltip
            contentStyle={{
              backgroundColor: colors.background,
              border: `1px solid ${colors.grid}`,
              color: colors.text,
              borderRadius: '4px',
            }}
            labelStyle={{ color: colors.text }}
          />
          {series.length > 0 && <Legend wrapperStyle={{ color: colors.text }} />}
          {series.length > 0 ? (
            series.map((serie, index) => {
              const color = serie.color || seriesColors[index % seriesColors.length];
              return (
                <Area
                  key={serie.name}
                  type="monotone"
                  dataKey={serie.name}
                  stroke={color}
                  fill={`url(#color${serie.name})`}
                  strokeWidth={2}
                />
              );
            })
          ) : (
            <Area
              type="monotone"
              dataKey="value"
              stroke={colors.primary}
              fill={gradient ? 'url(#colorValue)' : colors.primary}
              fillOpacity={gradient ? 1 : 0.6}
              strokeWidth={2}
            />
          )}
        </RechartsAreaChart>
      </ResponsiveContainer>
    </div>
  );
}
