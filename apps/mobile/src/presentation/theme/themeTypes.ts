import type { ColorScheme } from "./colors";

export interface AppTheme {
  colors: ColorScheme;
}

declare module "@emotion/react" {
  export interface Theme extends AppTheme {}
}
