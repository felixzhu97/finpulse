import type { Meta, StoryObj } from "@storybook/react-native";
import { NativeAmericanLineChart } from "./NativeAmericanLineChart";

const meta: Meta<typeof NativeAmericanLineChart> = {
  component: NativeAmericanLineChart,
};

export default meta;

type Story = StoryObj<typeof meta>;

const ohlcSessionData = [
  100, 101.5, 99.5, 101,
  101, 102, 100.5, 101.8,
  101.8, 103, 101.2, 102.7,
  102.7, 104, 102, 103.9,
];

const sessionTimestamps = [
  new Date("2024-01-02T09:30:00Z").getTime(),
  new Date("2024-01-02T11:30:00Z").getTime(),
  new Date("2024-01-02T13:30:00Z").getTime(),
  new Date("2024-01-02T15:30:00Z").getTime(),
];

export const SessionOhlcLight: Story = {
  args: {
    data: ohlcSessionData,
    timestamps: sessionTimestamps,
    theme: "light",
    style: { height: 220 },
  },
};

export const SessionOhlcDark: Story = {
  args: {
    data: ohlcSessionData,
    timestamps: sessionTimestamps,
    theme: "dark",
    style: { height: 220 },
  },
};

