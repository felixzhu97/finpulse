import { ReactNode } from "react";
import { View, Text } from "react-native";

interface MetricCardProps {
  label: string;
  value: string;
  helper?: string;
  tone?: "default" | "positive" | "negative";
  icon?: ReactNode;
}

const toneColor: Record<NonNullable<MetricCardProps["tone"]>, string> = {
  default: "#111827",
  positive: "#16a34a",
  negative: "#b91c1c",
};

export function MetricCard({
  label,
  value,
  helper,
  tone = "default",
  icon,
}: MetricCardProps) {
  return (
    <View
      style={{
        padding: 12,
        borderRadius: 12,
        backgroundColor: "#ffffff",
        borderWidth: 1,
        borderColor: "rgba(15, 23, 42, 0.06)",
        minWidth: 120,
      }}
    >
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 4,
        }}
      >
        <Text style={{ fontSize: 12, color: "#6b7280" }}>{label}</Text>
        {icon}
      </View>
      <Text
        style={{
          fontSize: 20,
          fontWeight: "600",
          color: toneColor[tone],
        }}
      >
        {value}
      </Text>
      {helper ? (
        <Text
          style={{
            marginTop: 4,
            fontSize: 11,
            color: "#9ca3af",
          }}
        >
          {helper}
        </Text>
      ) : null}
    </View>
  );
}

