import type { Meta, StoryObj } from "@storybook/react-native";
import { NativeHistogramChart } from "./NativeHistogramChart";

const meta: Meta<typeof NativeHistogramChart> = {
  component: NativeHistogramChart,
};

export default meta;

type Story = StoryObj<typeof meta>;

const volumeData = [120_000, 80_000, 150_000, 100_000, 90_000, 160_000, 130_000];

export const DailyVolumeLight: Story = {
  args: {
    data: volumeData,
    theme: "light",
    style: { height: 200 },
  },
};

export const DailyVolumeDark: Story = {
  args: {
    data: volumeData,
    theme: "dark",
    style: { height: 200 },
  },
};

