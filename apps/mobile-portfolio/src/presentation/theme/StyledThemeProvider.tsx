import { ReactNode } from "react";
import { ThemeProvider as StyledThemeProviderBase } from "styled-components/native";
import { useTheme } from "./useTheme";

interface StyledThemeProviderProps {
  children: ReactNode;
}

export function StyledThemeProvider({ children }: StyledThemeProviderProps) {
  const { colors } = useTheme();
  const theme = { colors };
  return (
    <StyledThemeProviderBase theme={theme}>{children}</StyledThemeProviderBase>
  );
}
