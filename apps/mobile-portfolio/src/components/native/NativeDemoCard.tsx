import type { ComponentType } from "react";
import type { ViewProps } from "react-native";
import { Platform, requireNativeComponent, StyleSheet, Text, View } from "react-native";

export type NativeDemoCardProps = { title?: string } & ViewProps;

const NativeView =
  Platform.OS !== "web" ? requireNativeComponent<NativeDemoCardProps>("NativeDemoCard") : null;

export function NativeDemoCard(props: NativeDemoCardProps) {
  if (Platform.OS === "web") {
    return (
      <View {...props} style={[props.style, styles.webFallback]}>
        <Text style={styles.webText}>{props.title ?? "Native Demo Card"}</Text>
      </View>
    );
  }
  const C = NativeView as ComponentType<NativeDemoCardProps>;
  return <C {...props} />;
}

const styles = StyleSheet.create({
  webFallback: {
    backgroundColor: "#e5e5e5",
    justifyContent: "center",
    padding: 16,
  },
  webText: {
    textAlign: "center",
    fontSize: 16,
  },
});
