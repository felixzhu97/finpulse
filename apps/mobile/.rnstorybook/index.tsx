import { view } from "./storybook.requires";

const memoryStore: Record<string, string> = {};

const storage = {
  getItem: async (key: string) => memoryStore[key] ?? null,
  setItem: async (key: string, value: string) => {
    memoryStore[key] = value;
  },
};

const StorybookUIRoot = view.getStorybookUI({
  storage,
});

export default StorybookUIRoot;

