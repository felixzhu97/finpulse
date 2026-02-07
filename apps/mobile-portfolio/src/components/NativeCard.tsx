import type { ViewProps } from "react-native";
import { Platform, requireNativeComponent, Text, View } from "react-native";
import * as React from "react";

export type NativeCardProps = {
  title?: string;
} & ViewProps;

const NativeCardView =
  Platform.OS !== "web"
    ? requireNativeComponent<NativeCardProps>("NativeCard")
    : null;

export function NativeCard(props: NativeCardProps) {
  if (Platform.OS === "web") {
    return (
      <View
        {...props}
        style={[
          props.style,
          { backgroundColor: "#e5e5e5", justifyContent: "center", padding: 16 },
        ]}
      >
        <Text style={{ textAlign: "center", fontSize: 16 }}>
          {props.title ?? "Native Card (Web fallback)"}
        </Text>
      </View>
    );
  }
  const ViewComponent = NativeCardView as React.ComponentType<NativeCardProps>;
  return <ViewComponent {...props} />;
}
