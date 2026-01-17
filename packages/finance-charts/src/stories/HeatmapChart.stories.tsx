import type { Meta, StoryObj } from '@storybook/react';
import { HeatmapChart } from '../components/heatmap-chart';

const meta = {
  title: 'Finance Charts/热力图',
  component: HeatmapChart,
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
    showTooltip: {
      control: 'boolean',
    },
  },
} satisfies Meta<typeof HeatmapChart>;

export default meta;
type Story = StoryObj<typeof meta>;

// 生成相关性矩阵示例数据
const assetNames = ['股票A', '股票B', '股票C', '股票D', '股票E', '股票F', '股票G'];
const correlationData = {
  rowLabels: assetNames,
  colLabels: assetNames,
  data: assetNames.flatMap((row) =>
    assetNames.map((col) => ({
      row,
      col,
      value: row === col ? 1 : Math.random() * 2 - 1, // -1 到 1 之间的相关系数
    }))
  ),
};

export const Default: Story = {
  args: {
    data: correlationData,
    height: 500,
    theme: 'light',
    showTooltip: true,
  },
};

export const DarkTheme: Story = {
  args: {
    data: correlationData,
    height: 500,
    theme: 'dark',
    showTooltip: true,
  },
};

export const CustomColorScale: Story = {
  args: {
    data: correlationData,
    height: 500,
    theme: 'light',
    colorScale: ['#10b981', '#fbbf24', '#ef4444'],
    showTooltip: true,
  },
};

export const SectorCorrelation: Story = {
  args: {
    data: {
      rowLabels: ['科技', '金融', '医疗', '能源', '消费'],
      colLabels: ['科技', '金融', '医疗', '能源', '消费'],
      data: [
        { row: '科技', col: '科技', value: 1 },
        { row: '科技', col: '金融', value: 0.3 },
        { row: '科技', col: '医疗', value: 0.5 },
        { row: '科技', col: '能源', value: -0.2 },
        { row: '科技', col: '消费', value: 0.4 },
        { row: '金融', col: '科技', value: 0.3 },
        { row: '金融', col: '金融', value: 1 },
        { row: '金融', col: '医疗', value: 0.2 },
        { row: '金融', col: '能源', value: 0.1 },
        { row: '金融', col: '消费', value: 0.6 },
        { row: '医疗', col: '科技', value: 0.5 },
        { row: '医疗', col: '金融', value: 0.2 },
        { row: '医疗', col: '医疗', value: 1 },
        { row: '医疗', col: '能源', value: 0.1 },
        { row: '医疗', col: '消费', value: 0.3 },
        { row: '能源', col: '科技', value: -0.2 },
        { row: '能源', col: '金融', value: 0.1 },
        { row: '能源', col: '医疗', value: 0.1 },
        { row: '能源', col: '能源', value: 1 },
        { row: '能源', col: '消费', value: -0.1 },
        { row: '消费', col: '科技', value: 0.4 },
        { row: '消费', col: '金融', value: 0.6 },
        { row: '消费', col: '医疗', value: 0.3 },
        { row: '消费', col: '能源', value: -0.1 },
        { row: '消费', col: '消费', value: 1 },
      ],
    },
    height: 500,
    theme: 'light',
    showTooltip: true,
  },
};
