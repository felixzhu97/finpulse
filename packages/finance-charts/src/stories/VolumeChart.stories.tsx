import type { Meta, StoryObj } from '@storybook/react';
import { VolumeChart } from '../components/volume-chart';
import { generateSamplePriceData } from '../utils/chart-helpers';

const meta = {
  title: 'Finance Charts/成交量图',
  component: VolumeChart,
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
  },
} satisfies Meta<typeof VolumeChart>;

export default meta;
type Story = StoryObj<typeof meta>;

const priceData = generateSamplePriceData(100, 100, 0.03);
const sampleData = priceData.map((item, index) => ({
  time: item.time,
  value: Math.floor(Math.random() * 1000000 + 500000),
  color: item.close >= item.open ? '#10b981' : '#ef4444',
}));

export const Default: Story = {
  args: {
    data: sampleData,
    height: 300,
    theme: 'light',
  },
};

export const DarkTheme: Story = {
  args: {
    data: sampleData,
    height: 300,
    theme: 'dark',
  },
};

export const LargeDataset: Story = {
  args: {
    data: generateSamplePriceData(500, 100, 0.02).map((item, index) => ({
      time: item.time,
      value: Math.floor(Math.random() * 1000000 + 500000),
      color: item.close >= item.open ? '#10b981' : '#ef4444',
    })),
    height: 300,
    theme: 'light',
  },
};

export const HighVolume: Story = {
  args: {
    data: priceData.map((item) => ({
      time: item.time,
      value: Math.floor(Math.random() * 5000000 + 2000000),
      color: item.close >= item.open ? '#10b981' : '#ef4444',
    })),
    height: 300,
    theme: 'light',
  },
};
