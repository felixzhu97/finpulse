import { Animated, Modal, ScrollView, Text } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { useDraggableDrawer } from "@/src/shared/hooks/useDraggableDrawer";
import { useTheme } from "@/src/shared/theme";
import { useTranslation } from "@/src/shared/i18n";
import {
  AbsoluteFill,
  DrawerModalRoot,
  DrawerBackdrop,
  DrawerSheet,
  DrawerSafe,
  DrawerDragArea,
  DrawerHandle,
  DrawerHeader,
  DrawerHeaderTitle,
  DrawerCloseButton,
} from "@/src/shared/theme/primitives";
import styled from "styled-components/native";

interface RiskMetricDetailDrawerProps {
  visible: boolean;
  metricKey: string | null;
  metricValue: number | null;
  onClose: () => void;
}

const DRAWER_HEIGHT = 500;

const Content = styled.ScrollView`
  flex: 1;
  padding: 20px;
  padding-bottom: 40px;
`;

const ValueContainer = styled.View`
  padding: 16px;
  border-radius: 12px;
  margin-bottom: 20px;
  background-color: ${(p) => p.theme.colors.surface};
`;

const ValueLabel = styled.Text`
  font-size: 13px;
  color: ${(p) => p.theme.colors.textSecondary};
  margin-bottom: 4px;
`;

const ValueText = styled.Text`
  font-size: 24px;
  font-weight: 600;
  color: ${(p) => p.theme.colors.text};
`;

const Description = styled.Text`
  font-size: 15px;
  line-height: 22px;
  color: ${(p) => p.theme.colors.text};
`;

const DrawerSheetRounded = styled(DrawerSheet)`
  border-top-left-radius: 20px;
  border-top-right-radius: 20px;
`;

export function RiskMetricDetailDrawer({
  visible,
  metricKey,
  metricValue,
  onClose,
}: RiskMetricDetailDrawerProps) {
  const { colors } = useTheme();
  const { t } = useTranslation();
  const { slideAnim, dragOffset, panHandlers, backdropOpacity, closeWithAnimation } =
    useDraggableDrawer({ visible, drawerHeight: DRAWER_HEIGHT, onClose });

  if (!metricKey) return null;

  const translateY = Animated.add(slideAnim, dragOffset);

  const getMetricInfo = () => {
    switch (metricKey) {
      case "volatility":
        return { title: t("insights.volatility"), description: t("insights.volatilityDescription") };
      case "sharpeRatio":
        return { title: t("insights.sharpeRatio"), description: t("insights.sharpeRatioDescription") };
      case "var":
        return { title: t("insights.var"), description: t("insights.varDescription") };
      case "beta":
        return { title: t("insights.beta"), description: t("insights.betaDescription") };
      case "computedVar":
        return { title: t("insights.computedVar"), description: t("insights.computedVarDescription") };
      default:
        return { title: metricKey, description: "" };
    }
  };

  const { title, description } = getMetricInfo();

  return (
    <Modal visible={visible} animationType="none" transparent onRequestClose={closeWithAnimation}>
      <DrawerModalRoot>
        <DrawerBackdrop style={{ opacity: backdropOpacity }} pointerEvents="box-none">
          <AbsoluteFill onPress={closeWithAnimation} />
        </DrawerBackdrop>

        <DrawerSheetRounded
          style={{
            height: DRAWER_HEIGHT,
            transform: [{ translateY }],
          }}
        >
          <DrawerSafe edges={["top"]}>
            <DrawerDragArea {...panHandlers}>
              <DrawerHandle />
            </DrawerDragArea>
            <DrawerHeader>
              <DrawerHeaderTitle>{title}</DrawerHeaderTitle>
              <DrawerCloseButton onPress={closeWithAnimation}>
                <MaterialIcons name="close" size={24} color={colors.text} />
              </DrawerCloseButton>
            </DrawerHeader>

            <Content>
              {metricValue !== null && (
                <ValueContainer>
                  <ValueLabel>{t("insights.currentValue")}</ValueLabel>
                  <ValueText>
                    {metricKey === "volatility" || metricKey === "var" || metricKey === "computedVar"
                      ? metricValue.toFixed(4)
                      : metricValue.toFixed(2)}
                  </ValueText>
                </ValueContainer>
              )}
              <Description>{description}</Description>
            </Content>
          </DrawerSafe>
        </DrawerSheetRounded>
      </DrawerModalRoot>
    </Modal>
  );
}
