import { BlurView } from "expo-blur";
import type { ReactNode } from "react";
import { Platform, StyleSheet, type StyleProp, type ViewStyle, View } from "react-native";

interface GlassViewProps {
  style?: StyleProp<ViewStyle>;
  intensity?: number;
  tint?: "light" | "dark" | "default";
  children?: ReactNode;
}

export function GlassView({
  style,
  intensity = 60,
  tint = "dark",
  children,
}: GlassViewProps) {
  if (Platform.OS === "web") {
    return <View style={[styles.fallback, style]}>{children}</View>;
  }

  return (
    <BlurView intensity={intensity} tint={tint} style={[styles.blur, style]}>
      {children}
    </BlurView>
  );
}

const styles = StyleSheet.create({
  blur: {
    overflow: "hidden",
  },
  fallback: {
    backgroundColor: "rgba(30,30,30,0.72)",
  },
});
