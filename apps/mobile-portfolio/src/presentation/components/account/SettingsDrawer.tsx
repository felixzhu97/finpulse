import { useCallback, useState } from "react";
import {
  ActivityIndicator,
  Animated,
  Dimensions,
  Modal,
  ScrollView,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useRouter } from "expo-router";
import { useDraggableDrawer, usePreferences, useAuth } from "@/src/presentation/hooks";
import { useTheme } from "@/src/presentation/theme";
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
} from "@/src/presentation/theme/primitives";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { useTranslation } from "@/src/presentation/i18n";

const { height: SCREEN_HEIGHT } = Dimensions.get("window");
const DRAWER_HEIGHT = Math.min(SCREEN_HEIGHT * 0.7, 500);

interface SettingsDrawerProps {
  visible: boolean;
  onClose: () => void;
}

export function SettingsDrawer({ visible, onClose }: SettingsDrawerProps) {
  const router = useRouter();
  const { colors } = useTheme();
  const { t } = useTranslation();
  const { isAuthenticated, changePassword, logout } = useAuth();
  const {
    theme,
    language,
    notificationsEnabled,
    isLoading,
    updateTheme,
    updateLanguage,
    updateNotifications,
  } = usePreferences();
  const [saving, setSaving] = useState(false);
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [changePasswordError, setChangePasswordError] = useState<string | null>(null);
  const [changePasswordSuccess, setChangePasswordSuccess] = useState(false);

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

  const handleChangePasswordSubmit = useCallback(async () => {
    if (!newPassword || newPassword.length < 6) {
      setChangePasswordError(t("auth.passwordMinLength"));
      return;
    }
    if (newPassword !== confirmPassword) {
      setChangePasswordError(t("auth.passwordsDoNotMatch"));
      return;
    }
    setChangePasswordError(null);
    setSaving(true);
    const result = await changePassword({
      current_password: currentPassword,
      new_password: newPassword,
    });
    setSaving(false);
    if (result.ok) {
      setChangePasswordSuccess(true);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setShowChangePassword(false);
    } else {
      setChangePasswordError(result.error ?? t("auth.changePasswordFailed"));
    }
  }, [changePassword, currentPassword, newPassword, confirmPassword, t]);

  const handleLogout = useCallback(async () => {
    onClose();
    await logout();
    router.replace("/(auth)/login");
  }, [logout, onClose, router]);

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

          <ScrollView
            style={{ flex: 1 }}
            contentContainerStyle={{
              paddingHorizontal: 20,
              paddingTop: 20,
              paddingBottom: 40,
              ...(isLoading ? { flexGrow: 1, justifyContent: "center" as const } : {}),
            }}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            {isLoading ? (
              <View style={{ alignItems: "center", paddingVertical: 60 }}>
                <ActivityIndicator size="small" color={colors.textSecondary} />
              </View>
            ) : (
              <View style={{ gap: 32 }}>
                <View style={{ gap: 12 }}>
                  <Text style={{ fontSize: 13, fontWeight: "600", textTransform: "uppercase", letterSpacing: 0.5, color: colors.textTertiary }}>{t("common.theme")}</Text>
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

                {isAuthenticated && (
                  <>
                    <View style={{ gap: 12 }}>
                      <Text style={{ fontSize: 13, fontWeight: "600", textTransform: "uppercase", letterSpacing: 0.5, color: colors.textTertiary }}>{t("auth.changePassword")}</Text>
                      {!showChangePassword ? (
                        <TouchableOpacity
                          style={{ paddingVertical: 12, paddingHorizontal: 16, borderRadius: 10, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border }}
                          onPress={() => setShowChangePassword(true)}
                          activeOpacity={0.7}
                        >
                          <Text style={{ fontSize: 15, color: colors.primary }}>{t("auth.changePassword")}</Text>
                        </TouchableOpacity>
                      ) : (
                        <View style={{ gap: 12 }}>
                          <TextInput
                            placeholder={t("auth.currentPassword")}
                            placeholderTextColor={colors.textTertiary}
                            value={currentPassword}
                            onChangeText={setCurrentPassword}
                            secureTextEntry
                            style={{ height: 44, borderRadius: 10, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, paddingHorizontal: 12, fontSize: 15, color: colors.text }}
                          />
                          <TextInput
                            placeholder={t("auth.newPassword")}
                            placeholderTextColor={colors.textTertiary}
                            value={newPassword}
                            onChangeText={setNewPassword}
                            secureTextEntry
                            style={{ height: 44, borderRadius: 10, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, paddingHorizontal: 12, fontSize: 15, color: colors.text }}
                          />
                          <TextInput
                            placeholder={t("auth.confirmNewPassword")}
                            placeholderTextColor={colors.textTertiary}
                            value={confirmPassword}
                            onChangeText={setConfirmPassword}
                            secureTextEntry
                            style={{ height: 44, borderRadius: 10, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, paddingHorizontal: 12, fontSize: 15, color: colors.text }}
                          />
                          {changePasswordError ? <Text style={{ fontSize: 13, color: colors.error }}>{changePasswordError}</Text> : null}
                          {changePasswordSuccess ? <Text style={{ fontSize: 13, color: colors.success }}>{t("auth.changePasswordSuccess")}</Text> : null}
                          <View style={{ flexDirection: "row", gap: 8 }}>
                            <TouchableOpacity style={{ flex: 1, paddingVertical: 12, borderRadius: 10, backgroundColor: colors.surface, alignItems: "center" }} onPress={() => { setShowChangePassword(false); setChangePasswordError(null); setChangePasswordSuccess(false); }} activeOpacity={0.7}>
                              <Text style={{ fontSize: 15, color: colors.text }}>{t("account.back")}</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={{ flex: 1, paddingVertical: 12, borderRadius: 10, backgroundColor: colors.primary, alignItems: "center" }} onPress={handleChangePasswordSubmit} disabled={saving} activeOpacity={0.7}>
                              <Text style={{ fontSize: 15, fontWeight: "600", color: colors.onPrimary }}>{t("account.submit")}</Text>
                            </TouchableOpacity>
                          </View>
                        </View>
                      )}
                    </View>
                    <TouchableOpacity
                      style={{ paddingVertical: 14, borderRadius: 10, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.error, alignItems: "center" }}
                      onPress={handleLogout}
                      activeOpacity={0.7}
                    >
                      <Text style={{ fontSize: 16, fontWeight: "600", color: colors.error }}>{t("auth.logOut")}</Text>
                    </TouchableOpacity>
                  </>
                )}

                {saving && (
                  <View style={{ flexDirection: "row", alignItems: "center", gap: 8, marginTop: 8 }}>
                    <ActivityIndicator size="small" color={colors.primary} />
                    <Text style={{ fontSize: 13, color: colors.textSecondary }}>{t("common.saving")}</Text>
                  </View>
                )}
              </View>
            )}
          </ScrollView>
          </DrawerSafe>
        </DrawerSheet>
      </DrawerModalRoot>
    </Modal>
  );
}
