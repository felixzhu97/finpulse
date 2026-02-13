import type { Meta, StoryObj } from "@storybook/react-native";
import { View } from "react-native";
import { NativeLineChart } from "./NativeLineChart";

const meta: Meta<typeof NativeLineChart> = {
  component: NativeLineChart,
};

export default meta;

type Story = StoryObj<typeof meta>;

const baseTimestamps = [
  new Date("2024-01-01T09:30:00Z").getTime(),
  new Date("2024-01-01T10:30:00Z").getTime(),
  new Date("2024-01-01T11:30:00Z").getTime(),
  new Date("2024-01-01T12:30:00Z").getTime(),
  new Date("2024-01-01T13:30:00Z").getTime(),
  new Date("2024-01-01T14:30:00Z").getTime(),
];

const baseData = [100_000, 101_200, 100_800, 102_300, 101_900, 103_500];

export const DayTrendUpLight: Story = {
  args: {
    data: baseData,
    timestamps: baseTimestamps,
    theme: "light",
    baselineValue: 100_000,
    currencySymbol: "$",
    style: { height: 220 },
  },
};

export const DayTrendDownDark: Story = {
  args: {
    data: baseData.map((v) => v * 0.997),
    timestamps: baseTimestamps,
    theme: "dark",
    baselineValue: 103_500,
    currencySymbol: "$",
    style: { height: 220 },
  },
};

export const IntradayHoursView: Story = {
  render: (props) => {
    const now = new Date("2024-01-01T09:30:00Z").getTime();
    const timestamps = Array.from({ length: 12 }, (_, i) => now + i * 30 * 60 * 1000);
    const data = [
      100_200, 100_400, 100_100, 100_800, 101_000, 100_900,
      101_200, 101_800, 101_500, 102_000, 101_700, 102_300,
    ];

    return (
      <View style={{ paddingHorizontal: 16, paddingVertical: 24 }}>
        <NativeLineChart
          {...props}
          data={data}
          timestamps={timestamps}
          theme="light"
          currencySymbol="$"
          style={{ height: 240 }}
        />
      </View>
    );
  },
};

