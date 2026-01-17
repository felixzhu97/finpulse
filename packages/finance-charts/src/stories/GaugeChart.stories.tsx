import type { Meta, StoryObj } from '@storybook/react';
import { GaugeChart } from '../components/gauge-chart';

const meta = {
  title: 'Finance Charts/仪表盘图',
  component: GaugeChart,
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
  argTypes: {
    theme: {
      control: 'select',
      options: ['light', 'dark'],
    },
    height: {
      control: { type: 'number', min: 200, max: 600, step: 50 },
    },
    value: {
      control: { type: 'number', min: 0, max: 100, step: 1 },
    },
    min: {
      control: { type: 'number' },
    },
    max: {
      control: { type: 'number' },
    },
  },
} satisfies Meta<typeof GaugeChart>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    value: 65,
    min: 0,
    max: 100,
    height: 300,
    theme: 'light',
    label: '风险指标',
  },
};

export const DarkTheme: Story = {
  args: {
    value: 65,
    min: 0,
    max: 100,
    height: 300,
    theme: 'dark',
    label: '风险指标',
  },
};

export const LowValue: Story = {
  args: {
    value: 25,
    min: 0,
    max: 100,
    height: 300,
    theme: 'light',
    label: '收益率',
  },
};

export const HighValue: Story = {
  args: {
    value: 85,
    min: 0,
    max: 100,
    height: 300,
    theme: 'light',
    label: '收益率',
  },
};

export const CustomRange: Story = {
  args: {
    value: 150,
    min: 0,
    max: 200,
    height: 300,
    theme: 'light',
    label: '资产总额 (万元)',
  },
};

export const CustomSegments: Story = {
  args: {
    value: 70,
    min: 0,
    max: 100,
    height: 300,
    theme: 'light',
    label: '投资组合风险',
    segments: [
      { min: 0, max: 30, color: '#10b981' },
      { min: 30, max: 60, color: '#f59e0b' },
      { min: 60, max: 80, color: '#ef4444' },
      { min: 80, max: 100, color: '#991b1b' },
    ],
  },
};

export const Percentage: Story = {
  args: {
    value: 42.5,
    min: 0,
    max: 100,
    height: 300,
    theme: 'light',
    label: '投资占比',
  },
};
