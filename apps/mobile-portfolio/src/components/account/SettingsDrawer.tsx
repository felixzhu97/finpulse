import { useCallback, useState } from "react";
import {
  ActivityIndicator,
  Animated,
  Dimensions,
  Modal,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useDraggableDrawer } from "@/src/hooks/useDraggableDrawer";
import { usePreferences } from "@/src/hooks/usePreferences";
import { useTheme } from "@/src/styles";
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
} from "@/src/styles/primitives";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { useTranslation } from "@/src/lib/i18n";

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
    { value: "dark" as const, label: t("styles.dark") },
    { value: "light" as const, label: t("styles.light") },
    { value: "auto" as const, label: t("styles.auto") },
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
        console.error("Failed to update styles:", error);
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
      <DrawerModalRoot>
        <DrawerBackdrop style={{ opacity: backdropOpacity }} pointerEvents="box-none">
          <AbsoluteFill onPress={closeWithAnimation} />
        </DrawerBackdrop>

        <DrawerSheet
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
              <DrawerHeaderTitle>{t("common.settings")}</DrawerHeaderTitle>
              <DrawerCloseButton onPress={closeWithAnimation}>
                <MaterialIcons name="close" size={24} color={colors.text} />
              </DrawerCloseButton>
            </DrawerHeader>

          <View style={{ flex: 1, paddingHorizontal: 20, paddingTop: 20, paddingBottom: 40 }}>
            {isLoading ? (
              <View style={{ flex: 1, alignItems: "center", justifyContent: "center", paddingVertical: 60 }}>
                <ActivityIndicator size="small" color={colors.textSecondary} />
              </View>
            ) : (
              <View style={{ gap: 32 }}>
                <View style={{ gap: 12 }}>
                  <Text style={{ fontSize: 13, fontWeight: "600", textTransform: "uppercase", letterSpacing: 0.5, color: colors.textTertiary }}>{t("common.styles")}</Text>
                  <View style={{ flexDirection: "row", gap: 8 }}>
                    {THEME_OPTIONS.map((option) => {
                      const isSelected = theme === option.value;
                      return (
                        <TouchableOpacity
                          key={option.value}
                          style={{
                            flex: 1,
                            paddingVertical: 10,
                            paddingHorizontal: 16,
                            borderRadius: 10,
                            alignItems: "center",
                            justifyContent: "center",
                            borderWidth: 1,
                            backgroundColor: isSelected ? colors.primaryLight : colors.surface,
                            borderColor: isSelected ? colors.primary : colors.border,
                            opacity: saving ? 0.5 : 1,
                          }}
                          onPress={() => handleThemeSelect(option.value)}
                          disabled={saving}
                          activeOpacity={0.7}
                        >
                          <Text
                            style={{
                              fontSize: 15,
                              color: isSelected ? colors.primary : colors.textSecondary,
                              fontWeight: isSelected ? "600" : "400",
                            }}
                          >
                            {option.label}
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                </View>

                <View style={{ gap: 12 }}>
                  <Text style={{ fontSize: 13, fontWeight: "600", textTransform: "uppercase", letterSpacing: 0.5, color: colors.textTertiary }}>{t("common.language")}</Text>
                  <View style={{ flexDirection: "row", gap: 8 }}>
                    {LANGUAGE_OPTIONS.map((option) => {
                      const isSelected = language === option.value;
                      return (
                        <TouchableOpacity
                          key={option.value}
                          style={{
                            flex: 1,
                            paddingVertical: 10,
                            paddingHorizontal: 16,
                            borderRadius: 10,
                            alignItems: "center",
                            justifyContent: "center",
                            borderWidth: 1,
                            backgroundColor: isSelected ? colors.primaryLight : colors.surface,
                            borderColor: isSelected ? colors.primary : colors.border,
                            opacity: saving ? 0.5 : 1,
                          }}
                          onPress={() => handleLanguageSelect(option.value)}
                          disabled={saving}
                          activeOpacity={0.7}
                        >
                          <Text
                            style={{
                              fontSize: 15,
                              color: isSelected ? colors.primary : colors.textSecondary,
                              fontWeight: isSelected ? "600" : "400",
                            }}
                          >
                            {option.label}
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                </View>

                <View style={{ gap: 12 }}>
                  <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
                    <Text style={{ fontSize: 13, fontWeight: "600", textTransform: "uppercase", letterSpacing: 0.5, color: colors.textTertiary }}>{t("common.notifications")}</Text>
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
                  <View style={{ flexDirection: "row", alignItems: "center", gap: 8, marginTop: 8 }}>
                    <ActivityIndicator size="small" color={colors.primary} />
                    <Text style={{ fontSize: 13, color: colors.textSecondary }}>{t("common.saving")}</Text>
                  </View>
                )}
              </View>
            )}
          </View>
          </DrawerSafe>
        </DrawerSheet>
      </DrawerModalRoot>
    </Modal>
  );
}
