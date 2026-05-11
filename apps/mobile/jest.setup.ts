// Jest setup file for pure unit tests
// This setup avoids loading React Native native modules

// Mock the entire react-native module to prevent native module loading
jest.mock("react-native", () => {
  return {
    Animated: {
      View: "View",
      Text: "Text",
      Image: "Image",
      ScrollView: "ScrollView",
      TouchableOpacity: "TouchableOpacity",
      StyleSheet: {
        create: (styles) => styles,
      },
    },
    Dimensions: {
      get: () => ({ width: 375, height: 812 }),
    },
    PanResponder: {
      create: () => ({
        panHandlers: {},
      }),
    },
    Platform: {
      OS: "ios",
      select: (obj) => obj.ios || obj.default,
    },
  };
});

// Mock AsyncStorage
jest.mock("@react-native-async-storage/async-storage", () => ({
  setItem: jest.fn(),
  getItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
}));

// Silence console warnings in tests
global.console = {
  ...console,
  warn: jest.fn(),
  error: jest.fn(),
};
