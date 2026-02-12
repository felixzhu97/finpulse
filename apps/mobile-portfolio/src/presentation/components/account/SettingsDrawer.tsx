import { useCallback, useState } from "react";
import {
  ActivityIndicator,
  Animated,
  Dimensions,
  Modal,
  Pressable,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useDraggableDrawer } from "@/src/presentation/hooks/useDraggableDrawer";
import { usePreferences } from "@/src/presentation/hooks/usePreferences";
import { useTheme } from "@/src/presentation/theme";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { useTranslation } from "@/src/presentation/i18n";

const { height: SCREEN_HEIGHT } = Dimensions.get("window");
const DRAWER_HEIGHT = Math.min(SCREEN_HEIGHT * 0.7, 500);

interface SettingsDrawerProps {
  visible: boolean;
  onClose: () => void;
}

export function SettingsDrawer({ visible, onClose }: SettingsDrawerProps) {
  const { colors } = useTheme();
  const { t } = useTranslation();
  const {
    theme,
    language,
    notificationsEnabled,
    isLoading,
    updateTheme,
    updateLanguage,
    updateNotifications,
    refresh,
  } = usePreferences();
  const [saving, setSaving] = useState(false);

  const THEME_OPTIONS = [
    { value: "dark" as const, label: t("theme.dark") },
    { value: "light" as const, label: t("theme.light") },
    { value: "auto" as const, label: t("theme.auto") },
  ];

  const LANGUAGE_OPTIONS = [
    { value: "en" as const, label: t("language.en") },
    { value: "zh" as const, label: t("language.zh") },
  ];

  const { slideAnim, dragOffset, panHandlers, backdropOpacity, closeWithAnimation } =
    useDraggableDrawer({ visible, drawerHeight: DRAWER_HEIGHT, onClose });

  const handleThemeSelect = useCallback(
    async (themeValue: "dark" | "light" | "auto") => {
      if (saving) return;
      setSaving(true);
      try {
        await updateTheme(themeValue);
      } catch (error) {
        console.error("Failed to update theme:", error);
      } finally {
        setSaving(false);
      }
    },
    [updateTheme, saving]
  );

  const handleLanguageSelect = useCallback(
    async (langValue: "en" | "zh") => {
      if (saving) return;
      setSaving(true);
      try {
        await updateLanguage(langValue);
      } catch (error) {
        console.error("Failed to update language:", error);
      } finally {
        setSaving(false);
      }
    },
    [updateLanguage, saving]
  );

  const handleNotificationsChange = useCallback(
    async (value: boolean) => {
      if (saving) return;
      setSaving(true);
      try {
        await updateNotifications(value);
      } catch (error) {
        console.error("Failed to update notifications:", error);
      } finally {
        setSaving(false);
      }
    },
    [updateNotifications, saving]
  );

  const translateY = Animated.add(slideAnim, dragOffset);

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
            <Text style={[styles.headerTitle, { color: colors.text }]}>{t("common.settings")}</Text>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={closeWithAnimation}
            >
              <MaterialIcons name="close" size={24} color={colors.text} />
            </TouchableOpacity>
          </View>

          <View style={styles.content}>
            {isLoading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="small" color={colors.textSecondary} />
              </View>
            ) : (
              <View style={styles.settingsContent}>
                <View style={styles.settingGroup}>
                  <Text style={[styles.groupTitle, { color: colors.textTertiary }]}>{t("common.theme")}</Text>
                  <View style={styles.optionsContainer}>
                    {THEME_OPTIONS.map((option) => {
                      const isSelected = theme === option.value;
                      return (
                        <TouchableOpacity
                          key={option.value}
                          style={[
                            styles.optionButton,
                            {
                              backgroundColor: isSelected ? colors.primaryLight : colors.surface,
                              borderColor: isSelected ? colors.primary : colors.border,
                            },
                            saving && styles.optionButtonDisabled,
                          ]}
                          onPress={() => handleThemeSelect(option.value)}
                          disabled={saving}
                          activeOpacity={0.7}
                        >
                          <Text
                            style={[
                              styles.optionText,
                              {
                                color: isSelected ? colors.primary : colors.textSecondary,
                                fontWeight: isSelected ? "600" : "400",
                              },
                            ]}
                          >
                            {option.label}
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                </View>

                <View style={styles.settingGroup}>
                  <Text style={[styles.groupTitle, { color: colors.textTertiary }]}>{t("common.language")}</Text>
                  <View style={styles.optionsContainer}>
                    {LANGUAGE_OPTIONS.map((option) => {
                      const isSelected = language === option.value;
                      return (
                        <TouchableOpacity
                          key={option.value}
                          style={[
                            styles.optionButton,
                            {
                              backgroundColor: isSelected ? colors.primaryLight : colors.surface,
                              borderColor: isSelected ? colors.primary : colors.border,
                            },
                            saving && styles.optionButtonDisabled,
                          ]}
                          onPress={() => handleLanguageSelect(option.value)}
                          disabled={saving}
                          activeOpacity={0.7}
                        >
                          <Text
                            style={[
                              styles.optionText,
                              {
                                color: isSelected ? colors.primary : colors.textSecondary,
                                fontWeight: isSelected ? "600" : "400",
                              },
                            ]}
                          >
                            {option.label}
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                </View>

                <View style={styles.settingGroup}>
                  <View style={styles.switchRow}>
                    <Text style={[styles.groupTitle, { color: colors.textTertiary }]}>{t("common.notifications")}</Text>
                    <Switch
                      value={notificationsEnabled}
                      onValueChange={handleNotificationsChange}
                      trackColor={{ false: colors.border, true: colors.success }}
                      thumbColor="#fff"
                      disabled={saving}
                    />
                  </View>
                </View>

                {saving && (
                  <View style={styles.savingRow}>
                    <ActivityIndicator size="small" color={colors.primary} />
                    <Text style={[styles.savingText, { color: colors.textSecondary }]}>{t("common.saving")}</Text>
                  </View>
                )}
              </View>
            )}
          </View>
          </SafeAreaView>
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalRoot: { flex: 1, justifyContent: "flex-end" },
  backdrop: { ...StyleSheet.absoluteFillObject },
  drawer: { borderTopLeftRadius: 14, borderTopRightRadius: 14, overflow: "hidden" },
  safe: { flex: 1 },
  dragArea: { paddingTop: 8, paddingBottom: 8, alignItems: "center", minHeight: 40 },
  dragHandle: { width: 36, height: 5, borderRadius: 2.5 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "600",
    letterSpacing: -0.3,
  },
  closeButton: {
    width: 32,
    height: 32,
    alignItems: "center",
    justifyContent: "center",
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 40,
  },
  loadingContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 60,
  },
  settingsContent: {
    gap: 32,
  },
  settingGroup: {
    gap: 12,
  },
  groupTitle: {
    fontSize: 13,
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  optionsContainer: {
    flexDirection: "row",
    gap: 8,
  },
  optionButton: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
  },
  optionButtonDisabled: {
    opacity: 0.5,
  },
  optionText: {
    fontSize: 15,
  },
  switchRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  savingRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 8,
  },
  savingText: {
    fontSize: 13,
  },
});
