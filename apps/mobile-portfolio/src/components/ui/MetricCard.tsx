import { ReactNode } from "react";
import { StyleSheet, Text, View } from "react-native";

interface MetricCardProps {
  label: string;
  value: string;
  helper?: string;
  tone?: "default" | "positive" | "negative";
  icon?: ReactNode;
}

const toneColor: Record<NonNullable<MetricCardProps["tone"]>, string> = {
  default: "rgba(255,255,255,0.9)",
  positive: "#4ade80",
  negative: "#f87171",
};

export function MetricCard({
  label,
  value,
  helper,
  tone = "default",
  icon,
}: MetricCardProps) {
  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Text style={styles.label}>{label}</Text>
        {icon}
      </View>
      <Text style={[styles.value, { color: toneColor[tone] }]}>{value}</Text>
      {helper ? <Text style={styles.helper}>{helper}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: 12,
    borderRadius: 12,
    backgroundColor: "#000000",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
    minWidth: 120,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 4,
  },
  label: {
    fontSize: 12,
    color: "rgba(255,255,255,0.6)",
  },
  value: {
    fontSize: 20,
    fontWeight: "600",
  },
  helper: {
    marginTop: 4,
    fontSize: 11,
    color: "rgba(255,255,255,0.5)",
  },
});
