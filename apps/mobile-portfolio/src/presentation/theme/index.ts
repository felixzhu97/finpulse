import { useMemo } from "react";
import { useSelector } from "react-redux";
import { useColorScheme as useSystemColorScheme } from "react-native";
import type { RootState } from "@/src/presentation/store";
import { LightColors, DarkColors, type ColorScheme } from "./colors";

export function useTheme() {
  const systemColorScheme = useSystemColorScheme();
  const themePreference = useSelector(
    (state: RootState) => state.preferences.theme
  );

  const isDark = useMemo(() => {
    if (themePreference === "light") return false;
    if (themePreference === "dark") return true;
    return systemColorScheme === "dark";
  }, [themePreference, systemColorScheme]);

  const colors: ColorScheme = useMemo(
    () => (isDark ? DarkColors : LightColors),
    [isDark]
  );

  return {
    isDark,
    colors,
    themePreference,
  };
}

export { LightColors, DarkColors };
export type { ColorScheme };
