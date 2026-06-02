import type { Meta, StoryObj } from "@storybook/react-native";
import { NativeDemoCard } from "./NativeDemoCard";

const meta: Meta<typeof NativeDemoCard> = {
  component: NativeDemoCard,
};

export default meta;

type Story = StoryObj<typeof meta>;

export const DefaultCard: Story = {
  args: {
    title: "Native Demo Card",
    style: { height: 120 },
  },
};

export const TitleInChinese: Story = {
  args: {
    title: "账户总资产",
    style: { height: 120 },
  },
};

