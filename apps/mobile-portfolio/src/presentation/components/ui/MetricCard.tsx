import { ReactNode } from "react";
import { Platform } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import styled from "styled-components/native";
import { Card, LabelText, ValueText, HelperText } from "@/src/presentation/theme/primitives";
import { useTheme } from "@/src/presentation/theme";

const cardShadow = Platform.select({
  ios: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  android: { elevation: 2 },
});

const Header = styled.View`
  flex-direction: row;
  align-items: flex-start;
  justify-content: space-between;
  margin-bottom: 8px;
  min-height: 36px;
`;

const HeaderRight = styled.View`
  flex-direction: row;
  align-items: center;
  gap: 8px;
`;

const InfoButton = styled.TouchableOpacity`
  padding: 4px;
`;

interface MetricCardProps {
  label: string;
  value: string;
  helper?: string;
  tone?: "default" | "positive" | "negative";
  icon?: ReactNode;
  onInfoPress?: () => void;
}

export function MetricCard({
  label,
  value,
  helper,
  tone = "default",
  icon,
  onInfoPress,
}: MetricCardProps) {
  const { colors } = useTheme();
  return (
    <Card style={cardShadow}>
      <Header>
        <LabelText style={styles.labelFlex}>{label}</LabelText>
        <HeaderRight>
          {icon}
          {onInfoPress && (
            <InfoButton onPress={onInfoPress}>
              <MaterialIcons name="info-outline" size={18} color={colors.textSecondary} />
            </InfoButton>
          )}
        </HeaderRight>
      </Header>
      <ValueText tone={tone}>{value}</ValueText>
      {helper ? <HelperText>{helper}</HelperText> : null}
    </Card>
  );
}

const styles = { labelFlex: { flex: 1 as const } };
