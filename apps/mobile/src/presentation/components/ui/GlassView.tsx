import { BlurView } from "expo-blur";
import type { ReactNode } from "react";
import { Platform, type StyleProp, type ViewStyle } from "react-native";
import styled from "@emotion/native";

interface GlassViewProps {
  style?: StyleProp<ViewStyle>;
  intensity?: number;
  tint?: "light" | "dark" | "default";
  children?: ReactNode;
}

const BlurBase = styled(BlurView)`
  overflow: hidden;
`;

const Fallback = styled.View`
  background-color: rgba(30,30,30,0.72);
`;

export function GlassView({ style, intensity = 60, tint = "dark", children }: GlassViewProps) {
  if (Platform.OS === "web") {
    return <Fallback style={style}>{children}</Fallback>;
  }

  return (
    <BlurBase intensity={intensity} tint={tint} style={style}>
      {children}
    </BlurBase>
  );
}
