import type { ChartTheme } from '../types';

/**
 * 获取图表主题颜色
 */
export function getThemeColors(theme: ChartTheme = 'light') {
  if (theme === 'dark') {
    return {
      background: '#1a1a1a',
      text: '#ffffff',
      grid: '#2a2a2a',
      primary: '#3b82f6',
      success: '#10b981',
      danger: '#ef4444',
      warning: '#f59e0b',
    };
  }
  
  return {
    background: '#ffffff',
    text: '#111827',
    grid: '#e5e7eb',
    primary: '#3b82f6',
    success: '#10b981',
    danger: '#ef4444',
    warning: '#f59e0b',
  };
}

/**
 * 计算数组的最小值和最大值
 */
export function calculateMinMax(values: number[]): { min: number; max: number } {
  if (values.length === 0) {
    return { min: 0, max: 0 };
  }
  
  const min = Math.min(...values);
  const max = Math.max(...values);
  
  // 添加一些边距
  const padding = (max - min) * 0.1;
  
  return {
    min: Math.max(0, min - padding),
    max: max + padding,
  };
}

/**
 * 生成示例价格数据
 */
export function generateSamplePriceData(
  count: number,
  basePrice: number = 100,
  volatility: number = 0.02
): Array<{ time: number; open: number; high: number; low: number; close: number }> {
  const data: Array<{ time: number; open: number; high: number; low: number; close: number }> = [];
  let currentPrice = basePrice;
  const baseTime = Math.floor(Date.now() / 1000) - count * 86400; // 每天一个数据点
  
  for (let i = 0; i < count; i++) {
    const change = (Math.random() - 0.5) * 2 * volatility * currentPrice;
    const open = currentPrice;
    const close = open + change;
    const high = Math.max(open, close) + Math.random() * volatility * currentPrice;
    const low = Math.min(open, close) - Math.random() * volatility * currentPrice;
    
    data.push({
      time: baseTime + i * 86400,
      open,
      high,
      low,
      close,
    });
    
    currentPrice = close;
  }
  
  return data;
}

/**
 * 生成示例时间序列数据
 */
export function generateSampleTimeSeriesData(
  count: number,
  baseValue: number = 100,
  trend: number = 0.1
): Array<{ time: number; value: number }> {
  const data: Array<{ time: number; value: number }> = [];
  let currentValue = baseValue;
  const baseTime = Math.floor(Date.now() / 1000) - count * 86400;
  
  for (let i = 0; i < count; i++) {
    currentValue += trend + (Math.random() - 0.5) * 5;
    data.push({
      time: baseTime + i * 86400,
      value: currentValue,
    });
  }
  
  return data;
}

/**
 * 判断是否移动设备
 */
export function isMobile(): boolean {
  if (typeof window === 'undefined') return false;
  return window.innerWidth < 768;
}
