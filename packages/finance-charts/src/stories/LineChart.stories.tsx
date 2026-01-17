import type { Meta, StoryObj } from '@storybook/react';
import { LineChart } from '../components/line-chart';
import { generateSampleTimeSeriesData } from '../utils/chart-helpers';

const meta = {
  title: 'Finance Charts/折线图',
  component: LineChart,
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
      control: { type: 'number', min: 200, max: 800, step: 50 },
    },
    showGrid: {
      control: 'boolean',
    },
    showCrosshair: {
      control: 'boolean',
    },
  },
} satisfies Meta<typeof LineChart>;

export default meta;
type Story = StoryObj<typeof meta>;

const sampleData = generateSampleTimeSeriesData(100, 100, 0.5);

export const Default: Story = {
  args: {
    data: sampleData,
    height: 400,
    theme: 'light',
    showGrid: true,
    showCrosshair: true,
  },
};

export const DarkTheme: Story = {
  args: {
    data: sampleData,
    height: 400,
    theme: 'dark',
    showGrid: true,
    showCrosshair: true,
  },
};

export const MultipleSeries: Story = {
  args: {
    data: [],
    series: [
      {
        name: '价格 A',
        data: generateSampleTimeSeriesData(100, 100, 0.5),
        color: '#3b82f6',
      },
      {
        name: '价格 B',
        data: generateSampleTimeSeriesData(100, 105, 0.3),
        color: '#10b981',
      },
      {
        name: '价格 C',
        data: generateSampleTimeSeriesData(100, 98, 0.4),
        color: '#f59e0b',
      },
    ],
    height: 400,
    theme: 'light',
    showGrid: true,
    showCrosshair: true,
  },
};

export const WithoutGrid: Story = {
  args: {
    data: sampleData,
    height: 400,
    theme: 'light',
    showGrid: false,
    showCrosshair: true,
  },
};

export const LongDataset: Story = {
  args: {
    data: generateSampleTimeSeriesData(1000, 100, 0.2),
    height: 400,
    theme: 'light',
    showGrid: true,
    showCrosshair: true,
  },
};
