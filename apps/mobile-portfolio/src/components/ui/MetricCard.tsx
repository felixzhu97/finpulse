import { ReactNode } from "react";
import { StyleSheet, Text, View } from "react-native";
import { useTheme } from "@/src/theme";

interface MetricCardProps {
  label: string;
  value: string;
  helper?: string;
  tone?: "default" | "positive" | "negative";
  icon?: ReactNode;
}

export function MetricCard({
  label,
  value,
  helper,
  tone = "default",
  icon,
}: MetricCardProps) {
  const { colors } = useTheme();
  
  const toneColorMap: Record<NonNullable<MetricCardProps["tone"]>, string> = {
    default: colors.text,
    positive: colors.success,
    negative: colors.error,
  };

  return (
    <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
      <View style={styles.header}>
        <Text style={[styles.label, { color: colors.textSecondary }]}>{label}</Text>
        {icon}
      </View>
      <Text style={[styles.value, { color: toneColorMap[tone] }]}>{value}</Text>
      {helper ? <Text style={[styles.helper, { color: colors.textSecondary }]}>{helper}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: 12,
    borderRadius: 12,
    borderWidth: StyleSheet.hairlineWidth,
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
  },
  value: {
    fontSize: 20,
    fontWeight: "600",
  },
  helper: {
    marginTop: 4,
    fontSize: 11,
  },
});
