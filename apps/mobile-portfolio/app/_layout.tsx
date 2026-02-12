import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import { useEffect, useMemo } from "react";
import "react-native-reanimated";
import { Provider, useSelector } from "react-redux";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  ActivityIndicator,
  StyleSheet,
  useColorScheme,
  View,
} from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { QuoteSocketSubscriber } from "@/src/store/QuoteSocketSubscriber";
import { store, type RootState } from "@/src/store";
import { usePreferences } from "@/src/hooks/usePreferences";
import { DarkColors, LightColors } from "@/src/theme/colors";
import "@/src/i18n/config";
import { i18n } from "@/src/i18n";
import "react-native-get-random-values";

SplashScreen.preventAutoHideAsync();

function AppContent() {
  const { loading } = usePreferences();
  const systemColorScheme = useColorScheme();
  const themePreference = useSelector(
    (state: RootState) => state.preferences.theme
  );
  const language = useSelector(
    (state: RootState) => state.preferences.language
  );

  useEffect(() => {
    if (language) {
      i18n.changeLanguage(language);
    }
  }, [language]);

  const theme = useMemo(() => {
    if (themePreference === "light") {
      return DefaultTheme;
    } else if (themePreference === "dark") {
      return DarkTheme;
    } else {
      return systemColorScheme === "dark" ? DarkTheme : DefaultTheme;
    }
  }, [themePreference, systemColorScheme]);

  const statusBarStyle = useMemo(() => {
    if (themePreference === "light") {
      return "dark";
    } else if (themePreference === "dark") {
      return "light";
    } else {
      return systemColorScheme === "dark" ? "light" : "dark";
    }
  }, [themePreference, systemColorScheme]);

  const colors =
    systemColorScheme === "dark" ? DarkColors : LightColors;

  if (loading) {
    return (
      <View style={[styles.loadingScreen, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.textSecondary} />
      </View>
    );
  }

  return (
    <ThemeProvider value={theme}>
      <StatusBar style={statusBarStyle} translucent />
      <GestureHandlerRootView
        style={[styles.root, { backgroundColor: theme.colors.background }]}
      >
        <SafeAreaView
          style={[styles.root, { backgroundColor: theme.colors.background }]}
        >
          <QuoteSocketSubscriber />
          <Stack initialRouteName="(tabs)">
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            <Stack.Screen name="+not-found" />
          </Stack>
        </SafeAreaView>
      </GestureHandlerRootView>
    </ThemeProvider>
  );
}

export default function RootLayout() {
  const [loaded] = useFonts({
    SpaceMono: require("@/src/assets/fonts/SpaceMono-Regular.ttf"),
  });

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  return (
    <Provider store={store}>
      <AppContent />
    </Provider>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  loadingScreen: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});
