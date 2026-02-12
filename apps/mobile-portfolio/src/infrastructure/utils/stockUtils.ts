export type Trend = "up" | "down" | "flat";

export interface StockChangeInfo {
  isUp: boolean;
  isDown: boolean;
  trend: Trend;
  changeColor: string;
  changePercent: string;
}

const COLOR_UP = "#34C759";
const COLOR_DOWN = "#FF3B30";
const COLOR_FLAT = "rgba(255,255,255,0.5)";

export function getStockChangeInfo(change: number, basePrice: number): StockChangeInfo {
  const isUp = change > 0;
  const isDown = change < 0;
  const trend: Trend = isUp ? "up" : isDown ? "down" : "flat";
  const changeColor = isUp ? COLOR_UP : isDown ? COLOR_DOWN : COLOR_FLAT;
  const changePercent = basePrice > 0 ? ((change / basePrice) * 100).toFixed(2) : "0.00";

  return {
    isUp,
    isDown,
    trend,
    changeColor,
    changePercent,
  };
}
