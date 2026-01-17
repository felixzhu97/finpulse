import type { Meta, StoryObj } from '@storybook/react';
import { CandlestickChart } from '../components/candlestick-chart';
import { generateSamplePriceData } from '../utils/chart-helpers';

const meta = {
  title: 'Finance Charts/蜡烛图',
  component: CandlestickChart,
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
  argTypes: {
    theme: {
      control: 'select',
      options: ['light', 'dark'],
      description: '图表主题',
    },
    height: {
      control: { type: 'number', min: 200, max: 800, step: 50 },
      description: '图表高度',
    },
    showVolume: {
      control: 'boolean',
      description: '是否显示成交量',
    },
    showCrosshair: {
      control: 'boolean',
      description: '是否显示十字线',
    },
  },
} satisfies Meta<typeof CandlestickChart>;

export default meta;
type Story = StoryObj<typeof meta>;

// 生成示例数据
const sampleData = generateSamplePriceData(100, 100, 0.03).map((item) => ({
  ...item,
  volume: Math.floor(Math.random() * 1000000 + 500000),
}));

export const Default: Story = {
  args: {
    data: sampleData,
    height: 400,
    theme: 'light',
    showVolume: true,
    showCrosshair: true,
  },
};

export const DarkTheme: Story = {
  args: {
    data: sampleData,
    height: 400,
    theme: 'dark',
    showVolume: true,
    showCrosshair: true,
  },
};

export const WithoutVolume: Story = {
  args: {
    data: sampleData,
    height: 400,
    theme: 'light',
    showVolume: false,
    showCrosshair: true,
  },
};

export const LargeDataset: Story = {
  args: {
    data: generateSamplePriceData(500, 100, 0.02).map((item) => ({
      ...item,
      volume: Math.floor(Math.random() * 1000000 + 500000),
    })),
    height: 500,
    theme: 'light',
    showVolume: true,
    showCrosshair: true,
  },
};

export const HighVolatility: Story = {
  args: {
    data: generateSamplePriceData(100, 100, 0.05).map((item) => ({
      ...item,
      volume: Math.floor(Math.random() * 1000000 + 500000),
    })),
    height: 400,
    theme: 'light',
    showVolume: true,
    showCrosshair: true,
  },
};
