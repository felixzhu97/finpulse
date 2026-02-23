import { useMemo } from "react";
import { useAppSelector } from "../store";
import { useColorScheme as useSystemColorScheme } from "react-native";
import { LightColors, DarkColors, type ColorScheme } from "./colors";

export function useTheme() {
  const systemColorScheme = useSystemColorScheme();
  const themePreference = useAppSelector((s) => s.preferences.theme);

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
