/** Robinhood-style accent (Robin Neon) */
export const RobinNeon = "#CCFF00";

export const LightColors = {
  background: "#FFFFFF",
  surface: "#F5F5F7",
  card: "#FFFFFF",
  cardSolid: "#FFFFFF",
  text: "#1D1D1F",
  textSecondary: "rgba(29,29,31,0.6)",
  textTertiary: "rgba(29,29,31,0.4)",
  border: "rgba(0,0,0,0.1)",
  borderSecondary: "rgba(0,0,0,0.08)",
  primary: "#1D1D1F",
  onPrimary: "#FFFFFF",
  primaryLight: "rgba(0,0,0,0.06)",
  accent: RobinNeon,
  onAccent: "#000000",
  success: "#34C759",
  error: "#FF3B30",
  warning: "#FF9500",
  tabBar: "#FFFFFF",
  tabBarBorder: "rgba(0,0,0,0.1)",
  tabIconActive: "#1D1D1F",
  tabIconInactive: "rgba(0,0,0,0.5)",
  glass: "rgba(255,255,255,0.7)",
  backdrop: "rgba(0,0,0,0.4)",
};

export const DarkColors = {
  background: "#000000",
  surface: "rgba(255,255,255,0.06)",
  card: "rgba(255,255,255,0.08)",
  cardSolid: "#141414",
  text: "rgba(255,255,255,0.9)",
  textSecondary: "rgba(255,255,255,0.6)",
  textTertiary: "rgba(255,255,255,0.5)",
  border: "rgba(255,255,255,0.1)",
  borderSecondary: "rgba(255,255,255,0.08)",
  primary: "rgba(255,255,255,0.9)",
  onPrimary: "#000000",
  primaryLight: "rgba(255,255,255,0.12)",
  /** Primary CTA (Robinhood-style) */
  accent: RobinNeon,
  onAccent: "#000000",
  success: "#30D158",
  error: "#FF453A",
  warning: "#FF9F0A",
  tabBar: "#000000",
  tabBarBorder: "rgba(255,255,255,0.1)",
  tabIconActive: "rgba(255,255,255,0.9)",
  tabIconInactive: "rgba(255,255,255,0.5)",
  glass: "rgba(0,0,0,0.7)",
  backdrop: "rgba(0,0,0,0.4)",
};

export type ColorScheme = typeof LightColors;
