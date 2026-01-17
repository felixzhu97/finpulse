import type { Meta, StoryObj } from '@storybook/react';
import { WaterfallChart } from '../components/waterfall-chart';

const meta = {
  title: 'Finance Charts/瀑布图',
  component: WaterfallChart,
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
} satisfies Meta<typeof WaterfallChart>;

export default meta;
type Story = StoryObj<typeof meta>;

const profitBreakdown = [
  { name: '期初余额', value: 100000, type: 'total' as const },
  { name: '投资收益', value: 15000, type: 'positive' as const },
  { name: '利息收入', value: 5000, type: 'positive' as const },
  { name: '交易费用', value: -2000, type: 'negative' as const },
  { name: '管理费用', value: -3000, type: 'negative' as const },
  { name: '期末余额', value: 115000, type: 'total' as const },
];

export const Default: Story = {
  args: {
    data: profitBreakdown,
    height: 400,
    theme: 'light',
  },
};

export const DarkTheme: Story = {
  args: {
    data: profitBreakdown,
    height: 400,
    theme: 'dark',
  },
};

export const PortfolioReturns: Story = {
  args: {
    data: [
      { name: '初始投资', value: 500000, type: 'total' as const },
      { name: '股票收益', value: 75000, type: 'positive' as const },
      { name: '债券收益', value: 25000, type: 'positive' as const },
      { name: '分红收入', value: 15000, type: 'positive' as const },
      { name: '交易成本', value: -5000, type: 'negative' as const },
      { name: '管理费', value: -10000, type: 'negative' as const },
      { name: '最终价值', value: 600000, type: 'total' as const },
    ],
    height: 400,
    theme: 'light',
  },
};

export const RevenueDecomposition: Story = {
  args: {
    data: [
      { name: '期初收入', value: 1000000, type: 'total' as const },
      { name: '产品销售', value: 500000, type: 'positive' as const },
      { name: '服务收入', value: 300000, type: 'positive' as const },
      { name: '投资收益', value: 200000, type: 'positive' as const },
      { name: '运营成本', value: -400000, type: 'negative' as const },
      { name: '税费', value: -150000, type: 'negative' as const },
      { name: '最终收入', value: 1450000, type: 'total' as const },
    ],
    height: 400,
    theme: 'light',
  },
};

export const MonthlyChange: Story = {
  args: {
    data: [
      { name: '1月', value: 10000, type: 'total' as const },
      { name: '2月', value: 2000, type: 'positive' as const },
      { name: '3月', value: -1000, type: 'negative' as const },
      { name: '4月', value: 3000, type: 'positive' as const },
      { name: '5月', value: 1500, type: 'positive' as const },
      { name: '6月', value: -500, type: 'negative' as const },
      { name: '累计', value: 15000, type: 'total' as const },
    ],
    height: 400,
    theme: 'light',
  },
};

export const ComplexBreakdown: Story = {
  args: {
    data: [
      { name: '起始值', value: 2000000, type: 'total' as const },
      { name: '主营业务', value: 800000, type: 'positive' as const },
      { name: '投资收入', value: 300000, type: 'positive' as const },
      { name: '其他收入', value: 100000, type: 'positive' as const },
      { name: '成本', value: -400000, type: 'negative' as const },
      { name: '税费', value: -250000, type: 'negative' as const },
      { name: '其他支出', value: -150000, type: 'negative' as const },
      { name: '终止值', value: 2500000, type: 'total' as const },
    ],
    height: 450,
    theme: 'light',
  },
};
