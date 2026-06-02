import type { Meta, StoryObj } from "@storybook/react-native";
import { NativeSparkline } from "./NativeSparkline";

const meta: Meta<typeof NativeSparkline> = {
  component: NativeSparkline,
};

export default meta;

type Story = StoryObj<typeof meta>;

const sampleData = [100, 101.2, 100.8, 102.3, 101.9, 103.5];

export const TrendUp: Story = {
  args: {
    trend: "up",
    data: sampleData,
  },
};

export const TrendDown: Story = {
  args: {
    trend: "down",
    data: sampleData.map((v) => v * 0.995),
  },
};

export const TrendFlat: Story = {
  args: {
    trend: "flat",
    data: sampleData.map(() => 100),
  },
};

