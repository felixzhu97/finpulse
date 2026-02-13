import type { ColorScheme } from "./colors";

export interface AppTheme {
  colors: ColorScheme;
}

declare module "styled-components" {
  interface DefaultTheme extends AppTheme {}
}

declare module "styled-components/native" {
  interface DefaultTheme extends AppTheme {}
}
