import type { Meta, StoryObj } from "@storybook/react-native";
import { NativeLineOnlyChart } from "./NativeLineOnlyChart";

const meta: Meta<typeof NativeLineOnlyChart> = {
  component: NativeLineOnlyChart,
};

export default meta;

type Story = StoryObj<typeof meta>;

const closingPrices = [
  100.2, 100.5, 100.1, 100.8, 101.2, 101.6, 101.3, 101.9, 102.4, 102.1,
];

const closingTimestamps = closingPrices.map((_, index) =>
  new Date(2024, 0, 2 + index).getTime()
);

export const ClosingPriceLineLight: Story = {
  args: {
    data: closingPrices,
    timestamps: closingTimestamps,
    theme: "light",
    style: { height: 200 },
  },
};

export const ClosingPriceLineDark: Story = {
  args: {
    data: closingPrices,
    timestamps: closingTimestamps,
    theme: "dark",
    style: { height: 200 },
  },
};

