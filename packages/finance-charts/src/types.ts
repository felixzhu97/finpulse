// 基础数据类型
export interface TimeDataPoint {
  time: string | number;
  value: number;
}

export interface PriceDataPoint {
  time: string | number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume?: number;
}

export interface LineDataPoint extends TimeDataPoint {
  label?: string;
}

export interface VolumeDataPoint {
  time: string | number;
  value: number;
  color?: string;
}

// 热力图数据
export interface HeatmapDataPoint {
  row: string;
  col: string;
  value: number;
}

export interface HeatmapData {
  data: HeatmapDataPoint[];
  rowLabels: string[];
  colLabels: string[];
}

// 雷达图数据
export interface RadarDataPoint {
  subject: string;
  value: number;
  fullMark?: number;
}

export interface RadarSeries {
  name: string;
  data: RadarDataPoint[];
  color?: string;
}

// 瀑布图数据
export interface WaterfallDataPoint {
  name: string;
  value: number;
  type?: 'positive' | 'negative' | 'total' | 'intermediate';
}

// 图表主题
export type ChartTheme = 'light' | 'dark';

// 蜡烛图 Props
export interface CandlestickChartProps {
  data: PriceDataPoint[];
  height?: number;
  theme?: ChartTheme;
  showVolume?: boolean;
  showCrosshair?: boolean;
  onCrosshairMove?: (data: PriceDataPoint | null) => void;
  className?: string;
}

// 折线图 Props
export interface LineChartProps {
  data: LineDataPoint[];
  series?: Array<{
    name: string;
    data: LineDataPoint[];
    color?: string;
  }>;
  height?: number;
  theme?: ChartTheme;
  showGrid?: boolean;
  showCrosshair?: boolean;
  className?: string;
}

// 面积图 Props
export interface AreaChartProps {
  data: TimeDataPoint[];
  series?: Array<{
    name: string;
    data: TimeDataPoint[];
    color?: string;
  }>;
  height?: number;
  theme?: ChartTheme;
  showGrid?: boolean;
  gradient?: boolean;
  className?: string;
}

// 成交量图 Props
export interface VolumeChartProps {
  data: VolumeDataPoint[];
  height?: number;
  theme?: ChartTheme;
  className?: string;
}

// 热力图 Props
export interface HeatmapChartProps {
  data: HeatmapData;
  height?: number;
  theme?: ChartTheme;
  colorScale?: string[];
  showTooltip?: boolean;
  className?: string;
}

// 仪表盘图 Props
export interface GaugeChartProps {
  value: number;
  min?: number;
  max?: number;
  height?: number;
  theme?: ChartTheme;
  label?: string;
  segments?: Array<{
    min: number;
    max: number;
    color: string;
  }>;
  className?: string;
}

// 雷达图 Props
export interface RadarChartProps {
  series: RadarSeries[];
  height?: number;
  theme?: ChartTheme;
  className?: string;
}

// 瀑布图 Props
export interface WaterfallChartProps {
  data: WaterfallDataPoint[];
  height?: number;
  theme?: ChartTheme;
  className?: string;
}
