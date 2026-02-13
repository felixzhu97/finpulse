import type { Meta, StoryObj } from "@storybook/react-native";
import { NativeBaselineChart } from "./NativeBaselineChart";

const meta: Meta<typeof NativeBaselineChart> = {
  component: NativeBaselineChart,
};

export default meta;

type Story = StoryObj<typeof meta>;

const baselineData = [
  100_000, 100_500, 99_800, 100_700, 101_200, 100_900, 101_600, 101_300,
];

const baselineTimestamps = [
  new Date("2024-01-02").getTime(),
  new Date("2024-01-03").getTime(),
  new Date("2024-01-04").getTime(),
  new Date("2024-01-05").getTime(),
  new Date("2024-01-06").getTime(),
  new Date("2024-01-07").getTime(),
  new Date("2024-01-08").getTime(),
  new Date("2024-01-09").getTime(),
];

export const AboveBaseline: Story = {
  args: {
    data: baselineData,
    baselineValue: 100_000,
    timestamps: baselineTimestamps,
    theme: "light",
    style: { height: 220 },
  },
};

export const CrossBaselineDark: Story = {
  args: {
    data: baselineData.map((v, i) => (i < 3 ? v * 0.995 : v * 1.005)),
    baselineValue: 100_000,
    timestamps: baselineTimestamps,
    theme: "dark",
    style: { height: 220 },
  },
};

