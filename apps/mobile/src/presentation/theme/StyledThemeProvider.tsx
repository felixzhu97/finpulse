import { ThemeProvider } from "@emotion/react";
import { ReactNode } from "react";
import { useTheme } from "./useTheme";

interface StyledThemeProviderProps {
  children: ReactNode;
}

export function StyledThemeProvider({ children }: StyledThemeProviderProps) {
  const { colors } = useTheme();
  const theme = { colors };
  return <ThemeProvider theme={theme}>{children}</ThemeProvider>;
}
