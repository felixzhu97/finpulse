import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useUserPreferences } from "@/src/hooks";

export default function ProfileScreen() {
  const {
    preference,
    loading,
    error,
    refresh,
    updatePreference,
  } = useUserPreferences();
  const [refreshing, setRefreshing] = useState(false);
  const [theme, setTheme] = useState(preference?.theme ?? "");
  const [language, setLanguage] = useState(preference?.language ?? "");
  const [notifications, setNotifications] = useState(
    preference?.notifications_enabled ?? true
  );
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (preference) {
      setTheme(preference.theme ?? "");
      setLanguage(preference.language ?? "");
      setNotifications(preference.notifications_enabled);
    }
  }, [preference?.preference_id]);

  const themeValue = preference?.theme ?? theme;
  const languageValue = preference?.language ?? language;
  const notificationsValue = preference?.notifications_enabled ?? notifications;

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await refresh();
    setRefreshing(false);
  }, [refresh]);

  const onThemeChange = (value: string) => {
    setTheme(value);
  };

  const onLanguageChange = (value: string) => {
    setLanguage(value);
  };

  const onNotificationsChange = (value: boolean) => {
    setNotifications(value);
    setSaving(true);
    updatePreference(themeValue || null, languageValue || null, value).finally(
      () => setSaving(false)
    );
  };

  const savePreferences = useCallback(async () => {
    setSaving(true);
    const ok = await updatePreference(
      theme.trim() || null,
      language.trim() || null,
      notifications
    );
    setSaving(false);
  }, [theme, language, notifications, updatePreference]);

  if (loading && !preference) {
    return (
      <SafeAreaView style={styles.screen} edges={["top"]}>
        <View style={styles.centered}>
          <ActivityIndicator size="large" color="#0A84FF" />
          <Text style={styles.loadingText}>Loading preferences...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.screen} edges={["top"]}>
        <View style={styles.centered}>
          <Text style={styles.errorText}>
            Unable to load preferences. Start the backend and try again.
          </Text>
          <Text style={styles.body} onPress={onRefresh}>
            Tap to retry
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.screen} edges={["top"]}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#fff"
          />
        }
      >
        <Text style={styles.title}>Profile</Text>
        <View style={styles.section}>
          <Text style={styles.label}>Theme</Text>
          <TextInput
            style={styles.input}
            value={theme || themeValue || ""}
            onChangeText={onThemeChange}
            placeholder="e.g. dark, light"
            placeholderTextColor="rgba(255,255,255,0.4)"
            onBlur={savePreferences}
          />
        </View>
        <View style={styles.section}>
          <Text style={styles.label}>Language</Text>
          <TextInput
            style={styles.input}
            value={language || languageValue || ""}
            onChangeText={onLanguageChange}
            placeholder="e.g. en, zh"
            placeholderTextColor="rgba(255,255,255,0.4)"
            onBlur={savePreferences}
          />
        </View>
        <View style={styles.section}>
          <View style={styles.row}>
            <Text style={styles.label}>Notifications</Text>
            <Switch
              value={notificationsValue}
              onValueChange={onNotificationsChange}
              trackColor={{ false: "#333", true: "#0A84FF" }}
              thumbColor="#fff"
              disabled={saving}
            />
          </View>
        </View>
        {saving && (
          <View style={styles.savingRow}>
            <ActivityIndicator size="small" color="#0A84FF" />
            <Text style={styles.savingText}>Saving...</Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#000000",
  },
  scroll: {
    flex: 1,
  },
  content: {
    padding: 20,
    paddingBottom: 40,
  },
  centered: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    color: "rgba(255,255,255,0.9)",
    marginBottom: 24,
  },
  section: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: "rgba(255,255,255,0.8)",
    marginBottom: 8,
  },
  input: {
    backgroundColor: "rgba(255,255,255,0.08)",
    borderRadius: 12,
    padding: 14,
    fontSize: 16,
    color: "#fff",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  loadingText: {
    color: "rgba(255,255,255,0.7)",
    marginTop: 12,
  },
  errorText: {
    color: "#f87171",
    textAlign: "center",
    marginBottom: 8,
  },
  body: {
    fontSize: 13,
    color: "rgba(255,255,255,0.6)",
    textAlign: "center",
  },
  savingRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 12,
  },
  savingText: {
    fontSize: 13,
    color: "rgba(255,255,255,0.6)",
  },
});
