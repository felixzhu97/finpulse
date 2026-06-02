import { useEffect } from "react";
import { ActivityIndicator, View } from "react-native";
import { useRouter } from "expo-router";
import { DarkColors } from "@/src/theme/colors";
import {useAuth} from "@/src/hooks";

export default function IndexScreen() {
  const router = useRouter();
  const { token, restored } = useAuth();

  useEffect(() => {
    if (!restored) return;
    if (token) {
      router.replace("/(tabs)");
    } else {
      router.replace("/(auth)/login");
    }
  }, [restored, token, router]);

  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: DarkColors.background }}>
      <ActivityIndicator size="large" color={DarkColors.textSecondary} />
    </View>
  );
}
