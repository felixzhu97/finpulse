import { Animated, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import styled from "@emotion/native";
import type { AppTheme } from "./themeTypes";

export const withTheme = (fn: (theme: AppTheme) => string) => (p: { theme: AppTheme }) => fn(p.theme);

export const StyledView = styled.View``;

export const StyledText = styled.Text``;

export const StyledTextInput = styled.TextInput``;

export const StyledTouchableOpacity = styled.TouchableOpacity``;

export const StyledPressable = styled.Pressable``;

export const ScreenContainer = styled.View`
  flex: 1;
  background-color: ${withTheme((t) => t.colors.background)};
`;

export const Card = styled.View`
  padding: 16px;
  border-radius: 16px;
  min-width: 120px;
  min-height: 100px;
  background-color: ${withTheme((t) => t.colors.card)};
`;

export const ListRow = styled.View`
  flex-direction: row;
  align-items: center;
  padding-vertical: 16px;
  padding-horizontal: 16px;
  min-height: 64px;
  border-bottom-width: 1px;
  border-bottom-color: ${withTheme((t) => t.colors.border)};
`;

export const ListRowPressable = styled(StyledPressable)`
  flex-direction: row;
  align-items: center;
  padding-vertical: 16px;
  padding-horizontal: 16px;
  min-height: 64px;
  border-bottom-width: 1px;
  border-bottom-color: ${withTheme((t) => t.colors.border)};
`;

export const ListRowLeft = styled.View`
  flex: 1;
  min-width: 0;
  padding-right: 12px;
`;

export const ListRowRight = styled.View`
  align-items: flex-end;
  min-width: 90px;
`;

export const ListRowSparkline = styled.View`
  width: 80px;
  align-items: center;
  justify-content: center;
  margin-horizontal: 8px;
`;

export const RowTitle = styled.Text`
  font-size: 17px;
  font-weight: 600;
  letter-spacing: -0.3px;
  color: ${withTheme((t) => t.colors.text)};
`;

export const RowSubtitle = styled.Text`
  font-size: 13px;
  margin-top: 3px;
  letter-spacing: -0.1px;
  color: ${withTheme((t) => t.colors.textSecondary)};
`;

export const RowValue = styled.Text`
  font-size: 17px;
  font-weight: 600;
  letter-spacing: -0.3px;
  color: ${withTheme((t) => t.colors.text)};
`;

export const RowChangeContainer = styled.View`
  align-items: flex-end;
  margin-top: 4px;
`;

export const RowChange = styled.Text<{ color?: string }>`
  font-size: 15px;
  font-weight: 500;
  letter-spacing: -0.2px;
  color: ${(p) => p.color ?? "inherit"};
`;

export const RowChangePercent = styled.Text<{ color?: string }>`
  font-size: 13px;
  font-weight: 400;
  margin-top: 1px;
  letter-spacing: -0.1px;
  color: ${(p) => p.color ?? "inherit"};
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

export const HoldingRow = styled.View`
  padding-vertical: 12px;
  border-bottom-width: 1px;
  border-bottom-color: ${withTheme((t) => t.colors.border)};
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
  min-height: 56px;
`;

export const HoldingRowLeft = styled.View`
  flex: 1;
  min-width: 0;
`;

export const HoldingRowRight = styled.View`
  align-items: flex-end;
  flex-shrink: 0;
`;

export const HoldingName = styled.Text`
  font-size: 15px;
  font-weight: 500;
  color: ${withTheme((t) => t.colors.text)};
`;

export const HoldingMeta = styled.Text`
  margin-top: 2px;
  font-size: 12px;
  color: ${withTheme((t) => t.colors.textSecondary)};
`;

export const HoldingValue = styled.Text`
  font-size: 15px;
  font-weight: 600;
  color: ${withTheme((t) => t.colors.text)};
`;

export const HoldingChange = styled.Text<{ positive?: boolean }>`
  margin-top: 2px;
  font-size: 12px;
  color: ${(p: { theme: AppTheme; positive?: boolean }) =>
    p.positive ? p.theme.colors.success : p.theme.colors.error};
`;

export const BlockRow = styled.View`
  gap: 12px;
`;

export const BlockRowHalf = styled.View`
  flex-direction: row;
  gap: 12px;
`;

export const BlockHalf = styled.View`
  flex: 1;
`;

export const ScreenRoot = styled.View`
  flex: 1;
  background-color: ${withTheme((t) => t.colors.background)};
`;

export const SectionTitle = styled.Text`
  font-size: 13px;
  font-weight: 600;
  letter-spacing: 0.02px;
  margin-bottom: 8px;
  color: ${withTheme((t) => t.colors.textSecondary)};
`;

export const ContentPadding = styled.View`
  padding: 16px;
  padding-bottom: 40px;
`;

export const CenteredContainer = styled.View`
  flex: 1;
  align-items: center;
  justify-content: center;
`;

export const ErrorText = styled.Text`
  text-align: center;
  font-size: 15px;
  margin-bottom: 8px;
  color: ${withTheme((t) => t.colors.textSecondary)};
`;

export const RetryText = styled.Text`
  margin-top: 12px;
  font-size: 15px;
  font-weight: 500;
  color: ${withTheme((t) => t.colors.accent)};
`;

export const ChartCard = styled.View`
  border-radius: 12px;
  padding: 12px;
  margin-top: 12px;
  overflow: hidden;
  background-color: ${withTheme((t) => t.colors.card)};
`;

export const ChartCardTitle = styled.Text`
  font-size: 14px;
  font-weight: 600;
  margin-bottom: 8px;
  color: ${withTheme((t) => t.colors.text)};
`;

export const BlockWithGap = styled.View`
  margin-top: 0;
  gap: 12px;
`;

export const NativeChartPlaceholder = styled.View`
  height: 200px;
  margin-bottom: 12px;
`;

export const CardBordered = styled.View`
  border-radius: 12px;
  padding: 16px;
  border-width: 1px;
  border-color: ${withTheme((t) => t.colors.border)};
  background-color: ${withTheme((t) => t.colors.card)};
`;

export const SafeAreaScreen = styled.View`
  flex: 1;
  background-color: ${withTheme((t) => t.colors.background)};
`;

export const ScreenHeader = styled.View`
  flex-direction: row;
  justify-content: space-between;
  align-items: flex-end;
  padding-horizontal: 16px;
  padding-top: 8px;
  padding-bottom: 16px;
`;

export const HeaderTitleBlock = styled.View``;

export const ScreenTitle = styled.Text`
  font-size: 28px;
  font-weight: 700;
  letter-spacing: -0.6px;
  color: ${withTheme((t) => t.colors.text)};
`;

export const ScreenDate = styled.Text`
  font-size: 13px;
  margin-top: 4px;
  font-weight: 400;
  letter-spacing: -0.1px;
  color: ${withTheme((t) => t.colors.textSecondary)};
`;

export const HeaderActions = styled.View`
  flex-direction: row;
  gap: 8px;
`;

export const IconButton = styled.Pressable`
  width: 44px;
  height: 44px;
  border-radius: 22px;
  align-items: center;
  justify-content: center;
  background-color: transparent;
`;

export const RetryButton = styled.Pressable`
  margin-top: 12px;
  padding-vertical: 12px;
  padding-horizontal: 24px;
  border-radius: 12px;
  background-color: ${withTheme((t) => t.colors.accent)};
  align-items: center;
  justify-content: center;
`;

export const RetryButtonText = styled.Text`
  color: ${withTheme((t) => t.colors.onAccent)};
  font-size: 16px;
  font-weight: 600;
  letter-spacing: -0.2px;
`;

export const EmptyContainer = styled.View`
  padding: 40px;
  align-items: center;
`;

export const EmptyText = styled.Text`
  font-size: 17px;
  font-weight: 600;
  margin-bottom: 4px;
  color: ${withTheme((t) => t.colors.textSecondary)};
`;

export const EmptySubtext = styled.Text`
  font-size: 15px;
  color: ${withTheme((t) => t.colors.textTertiary)};
`;

export const ListContainer = styled.View`
  flex: 1;
`;

export const LoadingWrap = styled.View`
  flex: 1;
  align-items: center;
  justify-content: center;
`;

export const InsightsBlock = styled.View`
  gap: 32px;
`;

export const InsightsSection = styled.View`
  gap: 14px;
`;

export const InsightsSectionHeader = styled.Text`
  font-size: 13px;
  font-weight: 600;
  letter-spacing: 0.02px;
  margin-bottom: 8px;
  color: ${withTheme((t) => t.colors.textSecondary)};
`;

export const OverviewGrid = styled.View`
  flex-direction: row;
  gap: 12px;
  align-items: stretch;
`;

export const OverviewCard = styled.View`
  flex: 1;
`;

export const MetricsGrid = styled.View`
  flex-direction: row;
  flex-wrap: wrap;
  gap: 12px;
  align-items: stretch;
`;

export const MetricCardWrap = styled.View`
  width: 48%;
`;

export const InsightsChartCard = styled.View`
  border-radius: 16px;
  padding: 20px;
  padding-bottom: 12px;
  overflow: hidden;
  width: 100%;
  background-color: ${withTheme((t) => t.colors.card)};
`;

export const InsightsSummaryCard = styled.View`
  padding: 20px;
  border-radius: 16px;
  background-color: ${withTheme((t) => t.colors.card)};
`;

export const SummaryBody = styled.Text`
  font-size: 15px;
  line-height: 22px;
  font-weight: 400;
  letter-spacing: -0.2px;
  color: ${withTheme((t) => t.colors.textSecondary)};
`;

export const InsightsErrorText = styled.Text`
  text-align: center;
  font-size: 17px;
  font-weight: 400;
  color: ${withTheme((t) => t.colors.error)};
`;

export const InsightsRetryText = styled.Text`
  margin-top: 16px;
  font-size: 17px;
  font-weight: 500;
  color: ${withTheme((t) => t.colors.accent)};
`;

export const InsightsCentered = styled.View`
  flex: 1;
  min-height: 200px;
  align-items: center;
  justify-content: center;
  padding: 20px;
  background-color: ${withTheme((t) => t.colors.background)};
`;

export const InsightsLoadingContainer = styled.View`
  flex: 1;
  min-height: 300px;
  align-items: center;
  justify-content: center;
  padding-vertical: 60px;
`;

export const InsightsScrollView = styled.ScrollView`
  flex: 1;
  background-color: ${withTheme((t) => t.colors.background)};
`;

export const AbsoluteFill = styled.Pressable`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
`;

export const AbsoluteFillView = styled.View`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
`;

export const DrawerModalRoot = styled.View`
  flex: 1;
  justify-content: flex-end;
`;

export const DrawerBackdrop = styled(Animated.View)`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: ${withTheme((t) => t.colors.backdrop)};
`;

export const DrawerSheet = styled(Animated.View)`
  border-top-left-radius: 14px;
  border-top-right-radius: 14px;
  overflow: hidden;
  background-color: ${withTheme((t) => t.colors.cardSolid)};
`;

export const DrawerSafe = styled(SafeAreaView)`
  flex: 1;
`;

export const DrawerDragArea = styled.View`
  padding-top: 8px;
  padding-bottom: 8px;
  align-items: center;
  min-height: 40px;
`;

export const DrawerHandle = styled.View`
  width: 36px;
  height: 5px;
  border-radius: 2.5px;
  background-color: ${withTheme((t) => t.colors.textTertiary)};
`;

export const DrawerHeader = styled.View`
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  padding-horizontal: 20px;
  padding-vertical: 16px;
  border-bottom-width: 1px;
  border-bottom-color: ${withTheme((t) => t.colors.border)};
`;

export const DrawerHeaderTitle = styled.Text`
  font-size: 20px;
  font-weight: 600;
  letter-spacing: -0.3px;
  color: ${withTheme((t) => t.colors.text)};
`;

export const DrawerCloseButton = styled(TouchableOpacity)`
  width: 32px;
  height: 32px;
  align-items: center;
  justify-content: center;
`;

export const DrawerContent = styled.View`
  flex: 1;
  padding-horizontal: 20px;
  padding-top: 20px;
  padding-bottom: 40px;
`;

export const DrawerFieldGroup = styled.View`
  margin-bottom: 16px;
`;

export const DrawerLabel = styled.Text`
  font-size: 13px;
  font-weight: 600;
  margin-bottom: 6px;
  color: ${withTheme((t) => t.colors.textSecondary)};
`;

export const DrawerInput = styled.TextInput`
  border-width: 1px;
  border-radius: 10px;
  padding-horizontal: 14px;
  padding-vertical: 12px;
  font-size: 16px;
  border-color: ${withTheme((t) => t.colors.border)};
  background-color: ${withTheme((t) => t.colors.surface)};
  color: ${withTheme((t) => t.colors.text)};
`;

export const DrawerSubmitButton = styled(TouchableOpacity)`
  padding-vertical: 14px;
  border-radius: 12px;
  align-items: center;
  justify-content: center;
  margin-top: 8px;
  background-color: ${withTheme((t) => t.colors.accent)};
`;

export const DrawerSubmitButtonText = styled.Text`
  color: ${withTheme((t) => t.colors.onAccent)};
  font-size: 16px;
  font-weight: 600;
  letter-spacing: -0.2px;
`;

export const DrawerErrorText = styled.Text`
  font-size: 13px;
  margin-bottom: 12px;
  color: ${withTheme((t) => t.colors.error)};
`;
