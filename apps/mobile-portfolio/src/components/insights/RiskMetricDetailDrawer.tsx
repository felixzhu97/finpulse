import { Animated, Modal, Pressable, SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { useDraggableDrawer } from "@/src/hooks";
import { useTheme } from "@/src/theme";
import { useTranslation } from "@/src/i18n";

interface RiskMetricDetailDrawerProps {
  visible: boolean;
  metricKey: string | null;
  metricValue: number | null;
  onClose: () => void;
}

const DRAWER_HEIGHT = 500;

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
        return {
          title: t("insights.volatility"),
          description: t("insights.volatilityDescription"),
        };
      case "sharpeRatio":
        return {
          title: t("insights.sharpeRatio"),
          description: t("insights.sharpeRatioDescription"),
        };
      case "var":
        return {
          title: t("insights.var"),
          description: t("insights.varDescription"),
        };
      case "beta":
        return {
          title: t("insights.beta"),
          description: t("insights.betaDescription"),
        };
      case "computedVar":
        return {
          title: t("insights.computedVar"),
          description: t("insights.computedVarDescription"),
        };
      default:
        return {
          title: metricKey,
          description: "",
        };
    }
  };

  const { title, description } = getMetricInfo();

  return (
    <Modal visible={visible} animationType="none" transparent onRequestClose={closeWithAnimation}>
      <View style={styles.modalRoot}>
        <Animated.View
          style={[styles.backdrop, { opacity: backdropOpacity, backgroundColor: colors.backdrop }]}
          pointerEvents="box-none"
        >
          <Pressable style={StyleSheet.absoluteFill} onPress={closeWithAnimation} />
        </Animated.View>

        <Animated.View
          style={[
            styles.drawer,
            {
              height: DRAWER_HEIGHT,
              transform: [{ translateY }],
              backgroundColor: colors.cardSolid,
            },
          ]}
        >
          <SafeAreaView style={styles.safe} edges={["top"]}>
            <View style={styles.dragArea} {...panHandlers}>
              <View style={[styles.dragHandle, { backgroundColor: colors.textTertiary }]} />
            </View>
            <View style={[styles.header, { borderBottomColor: colors.border }]}>
              <Text style={[styles.headerTitle, { color: colors.text }]}>{title}</Text>
              <TouchableOpacity style={styles.closeButton} onPress={closeWithAnimation}>
                <MaterialIcons name="close" size={24} color={colors.text} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
              {metricValue !== null && (
                <View style={[styles.valueContainer, { backgroundColor: colors.surface }]}>
                  <Text style={[styles.valueLabel, { color: colors.textSecondary }]}>
                    {t("insights.currentValue")}
                  </Text>
                  <Text style={[styles.valueText, { color: colors.text }]}>
                    {metricKey === "volatility" || metricKey === "var" || metricKey === "computedVar"
                      ? metricValue.toFixed(4)
                      : metricValue.toFixed(2)}
                  </Text>
                </View>
              )}
              <Text style={[styles.description, { color: colors.text }]}>
                {description.split('\n\n').map((paragraph, index) => (
                  <Text key={index}>
                    {paragraph}
                    {index < description.split('\n\n').length - 1 && '\n\n'}
                  </Text>
                ))}
              </Text>
            </ScrollView>
          </SafeAreaView>
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalRoot: {
    flex: 1,
    justifyContent: "flex-end",
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
  },
  drawer: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    overflow: "hidden",
  },
  safe: {
    flex: 1,
  },
  dragArea: {
    paddingVertical: 12,
    alignItems: "center",
  },
  dragHandle: {
    width: 36,
    height: 4,
    borderRadius: 2,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingBottom: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "600",
    letterSpacing: -0.3,
  },
  closeButton: {
    padding: 4,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 20,
  },
  valueContainer: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
  },
  valueLabel: {
    fontSize: 13,
    fontWeight: "500",
    marginBottom: 8,
    letterSpacing: -0.1,
  },
  valueText: {
    fontSize: 32,
    fontWeight: "600",
    letterSpacing: -0.5,
  },
  description: {
    fontSize: 15,
    lineHeight: 22,
    fontWeight: "400",
    letterSpacing: -0.2,
  },
  example: {
    fontSize: 15,
    lineHeight: 22,
    fontWeight: "400",
    letterSpacing: -0.2,
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
});
