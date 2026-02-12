import { ReactNode } from "react";
import { Platform, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { useTheme } from "@/src/theme";

interface MetricCardProps {
  label: string;
  value: string;
  helper?: string;
  tone?: "default" | "positive" | "negative";
  icon?: ReactNode;
  onInfoPress?: () => void;
}

export function MetricCard({
  label,
  value,
  helper,
  tone = "default",
  icon,
  onInfoPress,
}: MetricCardProps) {
  const { colors } = useTheme();
  
  const toneColorMap: Record<NonNullable<MetricCardProps["tone"]>, string> = {
    default: colors.text,
    positive: colors.success,
    negative: colors.error,
  };

  return (
    <View style={[styles.card, { backgroundColor: colors.card }]}>
      <View style={styles.header}>
        <Text style={[styles.label, { color: colors.textSecondary }]}>{label}</Text>
        <View style={styles.headerRight}>
          {icon}
          {onInfoPress && (
            <TouchableOpacity onPress={onInfoPress} style={styles.infoButton}>
              <MaterialIcons name="info-outline" size={18} color={colors.textSecondary} />
            </TouchableOpacity>
          )}
        </View>
      </View>
      <Text style={[styles.value, { color: toneColorMap[tone] }]}>{value}</Text>
      {helper ? <Text style={[styles.helper, { color: colors.textSecondary }]}>{helper}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: 16,
    borderRadius: 16,
    minWidth: 120,
    minHeight: 100,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  header: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    marginBottom: 8,
    minHeight: 36,
  },
  headerRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  infoButton: {
    padding: 4,
  },
  label: {
    fontSize: 13,
    fontWeight: "500",
    letterSpacing: -0.1,
    flex: 1,
    lineHeight: 18,
  },
  value: {
    fontSize: 24,
    fontWeight: "600",
    letterSpacing: -0.5,
    marginTop: 4,
  },
  helper: {
    marginTop: 8,
    fontSize: 13,
    lineHeight: 18,
    fontWeight: "400",
    letterSpacing: -0.1,
  },
});
