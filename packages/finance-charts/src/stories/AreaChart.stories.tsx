import type { Meta, StoryObj } from '@storybook/react';
import { AreaChart } from '../components/area-chart';
import { generateSampleTimeSeriesData } from '../utils/chart-helpers';

const meta = {
  title: 'Finance Charts/面积图',
  component: AreaChart,
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
    gradient: {
      control: 'boolean',
    },
  },
} satisfies Meta<typeof AreaChart>;

export default meta;
type Story = StoryObj<typeof meta>;

const sampleData = generateSampleTimeSeriesData(100, 100, 0.5);

export const Default: Story = {
  args: {
    data: sampleData,
    height: 400,
    theme: 'light',
    showGrid: true,
    gradient: true,
  },
};

export const DarkTheme: Story = {
  args: {
    data: sampleData,
    height: 400,
    theme: 'dark',
    showGrid: true,
    gradient: true,
  },
};

export const WithoutGradient: Story = {
  args: {
    data: sampleData,
    height: 400,
    theme: 'light',
    showGrid: true,
    gradient: false,
  },
};

export const MultipleSeries: Story = {
  args: {
    data: [],
    series: [
      {
        name: '资产 A',
        data: generateSampleTimeSeriesData(100, 100, 0.5),
        color: '#3b82f6',
      },
      {
        name: '资产 B',
        data: generateSampleTimeSeriesData(100, 105, 0.3),
        color: '#10b981',
      },
      {
        name: '资产 C',
        data: generateSampleTimeSeriesData(100, 98, 0.4),
        color: '#f59e0b',
      },
    ],
    height: 400,
    theme: 'light',
    showGrid: true,
    gradient: true,
  },
};

export const LongDataset: Story = {
  args: {
    data: generateSampleTimeSeriesData(500, 100, 0.3),
    height: 400,
    theme: 'light',
    showGrid: true,
    gradient: true,
  },
};
