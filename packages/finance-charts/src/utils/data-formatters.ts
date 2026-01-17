/**
 * 格式化价格为货币格式
 */
export function formatCurrency(value: number, currency: string = 'CNY'): string {
  return new Intl.NumberFormat('zh-CN', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

/**
 * 格式化百分比
 */
export function formatPercent(value: number, decimals: number = 2): string {
  return `${value.toFixed(decimals)}%`;
}

/**
 * 格式化大数字（如成交量）
 */
export function formatLargeNumber(value: number): string {
  if (value >= 100000000) {
    return `${(value / 100000000).toFixed(2)}亿`;
  }
  if (value >= 10000) {
    return `${(value / 10000).toFixed(2)}万`;
  }
  return value.toLocaleString('zh-CN');
}

/**
 * 格式化时间戳为日期字符串
 */
export function formatDate(timestamp: string | number, format: 'short' | 'long' = 'short'): string {
  const date = typeof timestamp === 'string' ? new Date(timestamp) : new Date(timestamp * 1000);
  
  if (format === 'long') {
    return date.toLocaleString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  }
  
  return date.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
}

/**
 * 格式化时间为 TradingView 格式
 */
export function formatTimeForTradingView(timestamp: string | number): number {
  if (typeof timestamp === 'number') {
    // 如果已经是 Unix 时间戳（秒），直接返回
    if (timestamp < 10000000000) {
      return timestamp;
    }
    // 如果是毫秒时间戳，转换为秒
    return Math.floor(timestamp / 1000);
  }
  
  // 字符串时间转换为 Unix 时间戳（秒）
  return Math.floor(new Date(timestamp).getTime() / 1000);
}

/**
 * 生成颜色渐变
 */
export function generateGradientColors(
  startColor: string,
  endColor: string,
  steps: number
): string[] {
  const colors: string[] = [];
  const start = hexToRgb(startColor);
  const end = hexToRgb(endColor);
  
  if (!start || !end) return [startColor, endColor];
  
  for (let i = 0; i < steps; i++) {
    const ratio = i / (steps - 1);
    const r = Math.round(start.r + (end.r - start.r) * ratio);
    const g = Math.round(start.g + (end.g - start.g) * ratio);
    const b = Math.round(start.b + (end.b - start.b) * ratio);
    colors.push(rgbToHex(r, g, b));
  }
  
  return colors;
}

function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : null;
}

function rgbToHex(r: number, g: number, b: number): string {
  return '#' + [r, g, b].map((x) => x.toString(16).padStart(2, '0')).join('');
}
