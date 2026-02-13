import type { Meta, StoryObj } from "@storybook/react-native";
import { NativeCandleChart } from "./NativeCandleChart";

const meta: Meta<typeof NativeCandleChart> = {
  component: NativeCandleChart,
};

export default meta;

type Story = StoryObj<typeof meta>;

const ohlcDayData = [
  102, 105, 101, 103,
  103, 106, 102, 105,
  105, 108, 104, 107,
  107, 109, 106, 108,
  108, 110, 107, 109,
];

const timestamps = [
  new Date("2024-01-02").getTime(),
  new Date("2024-01-03").getTime(),
  new Date("2024-01-04").getTime(),
  new Date("2024-01-05").getTime(),
  new Date("2024-01-06").getTime(),
];

export const DailyCandlesLight: Story = {
  args: {
    data: ohlcDayData,
    timestamps,
    theme: "light",
    style: { height: 220 },
  },
};

export const DailyCandlesDark: Story = {
  args: {
    data: ohlcDayData,
    timestamps,
    theme: "dark",
    style: { height: 220 },
  },
};

