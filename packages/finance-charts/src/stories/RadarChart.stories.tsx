import type { Meta, StoryObj } from '@storybook/react';
import { RadarChart } from '../components/radar-chart';

const meta = {
  title: 'Finance Charts/雷达图',
  component: RadarChart,
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
      control: { type: 'number', min: 300, max: 800, step: 50 },
    },
  },
} satisfies Meta<typeof RadarChart>;

export default meta;
type Story = StoryObj<typeof meta>;

const portfolioData = [
  { subject: '收益', value: 85, fullMark: 100 },
  { subject: '风险', value: 45, fullMark: 100 },
  { subject: '流动性', value: 70, fullMark: 100 },
  { subject: '分散度', value: 60, fullMark: 100 },
  { subject: '稳定性', value: 75, fullMark: 100 },
  { subject: '成长性', value: 80, fullMark: 100 },
];

export const Default: Story = {
  args: {
    series: [
      {
        name: '投资组合 A',
        data: portfolioData,
        color: '#3b82f6',
      },
    ],
    height: 400,
    theme: 'light',
  },
};

export const DarkTheme: Story = {
  args: {
    series: [
      {
        name: '投资组合 A',
        data: portfolioData,
        color: '#3b82f6',
      },
    ],
    height: 400,
    theme: 'dark',
  },
};

export const MultipleSeries: Story = {
  args: {
    series: [
      {
        name: '投资组合 A',
        data: portfolioData,
        color: '#3b82f6',
      },
      {
        name: '投资组合 B',
        data: [
          { subject: '收益', value: 70, fullMark: 100 },
          { subject: '风险', value: 55, fullMark: 100 },
          { subject: '流动性', value: 80, fullMark: 100 },
          { subject: '分散度', value: 75, fullMark: 100 },
          { subject: '稳定性', value: 85, fullMark: 100 },
          { subject: '成长性', value: 65, fullMark: 100 },
        ],
        color: '#10b981',
      },
      {
        name: '投资组合 C',
        data: [
          { subject: '收益', value: 60, fullMark: 100 },
          { subject: '风险', value: 70, fullMark: 100 },
          { subject: '流动性', value: 65, fullMark: 100 },
          { subject: '分散度', value: 80, fullMark: 100 },
          { subject: '稳定性', value: 70, fullMark: 100 },
          { subject: '成长性', value: 90, fullMark: 100 },
        ],
        color: '#f59e0b',
      },
    ],
    height: 400,
    theme: 'light',
  },
};

export const RiskAnalysis: Story = {
  args: {
    series: [
      {
        name: '风险分析',
        data: [
          { subject: '市场风险', value: 65, fullMark: 100 },
          { subject: '信用风险', value: 30, fullMark: 100 },
          { subject: '流动性风险', value: 50, fullMark: 100 },
          { subject: '操作风险', value: 25, fullMark: 100 },
          { subject: '合规风险', value: 20, fullMark: 100 },
        ],
        color: '#ef4444',
      },
    ],
    height: 400,
    theme: 'light',
  },
};

export const AssetAllocation: Story = {
  args: {
    series: [
      {
        name: '资产配置',
        data: [
          { subject: '股票', value: 60, fullMark: 100 },
          { subject: '债券', value: 30, fullMark: 100 },
          { subject: '现金', value: 10, fullMark: 100 },
          { subject: '商品', value: 0, fullMark: 100 },
          { subject: '另类', value: 0, fullMark: 100 },
        ],
        color: '#8b5cf6',
      },
    ],
    height: 400,
    theme: 'light',
  },
};
