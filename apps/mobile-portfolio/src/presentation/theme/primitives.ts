import styled from "styled-components/native";
import type { AppTheme } from "./themeTypes";

export const withTheme = (fn: (theme: AppTheme) => string) => (p: { theme: AppTheme }) => fn(p.theme);

export const StyledView = styled.View``;

export const StyledText = styled.Text``;

export const StyledTextInput = styled.TextInput``;

export const StyledTouchableOpacity = styled.TouchableOpacity``;

export const StyledPressable = styled.Pressable``;

export const Card = styled.View`
  padding: 16px;
  border-radius: 16px;
  min-width: 120px;
  min-height: 100px;
  background-color: ${withTheme((t) => t.colors.card)};
`;

export const LabelText = styled.Text`
  font-size: 13px;
  font-weight: 500;
  letter-spacing: -0.1px;
  line-height: 18px;
  color: ${withTheme((t) => t.colors.textSecondary)};
`;

export const ValueText = styled.Text<{ tone?: "default" | "positive" | "negative" }>`
  font-size: 24px;
  font-weight: 600;
  letter-spacing: -0.5px;
  margin-top: 4px;
  color: ${(p: { theme: AppTheme; tone?: "default" | "positive" | "negative" }) => {
    if (p.tone === "positive") return p.theme.colors.success;
    if (p.tone === "negative") return p.theme.colors.error;
    return p.theme.colors.text;
  }};
`;

export const HelperText = styled.Text`
  margin-top: 8px;
  font-size: 13px;
  line-height: 18px;
  font-weight: 400;
  letter-spacing: -0.1px;
  color: ${withTheme((t) => t.colors.textSecondary)};
`;
