import { ScrollView, Text, View } from "react-native";
import { getRiskSummary } from "@/src/services/portfolioService";
import { MetricCard } from "@/src/components/MetricCard";

export default function InsightsScreen() {
  const risk = getRiskSummary();

  const highRiskPercent = (risk.highRatio * 100).toFixed(1);
  const concentrationPercent = (risk.topHoldingsConcentration * 100).toFixed(1);

  const highRiskText =
    risk.highRatio > 0.4
      ? "High exposure to high-risk assets."
      : "High-risk exposure is moderate.";

  const concentrationText =
    risk.topHoldingsConcentration > 0.5
      ? "Portfolio is highly concentrated in top holdings."
      : "Portfolio concentration looks balanced.";

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: "#f3f4f6" }}
      contentContainerStyle={{
        padding: 16,
        paddingBottom: 32,
      }}
    >
      <View style={{ gap: 16 }}>
        <MetricCard
          label="High-risk exposure"
          value={`${highRiskPercent}%`}
          helper={highRiskText}
          tone={risk.highRatio > 0.4 ? "negative" : "default"}
        />
        <MetricCard
          label="Top 5 holdings concentration"
          value={`${concentrationPercent}%`}
          helper={concentrationText}
          tone={risk.topHoldingsConcentration > 0.5 ? "negative" : "default"}
        />
        <View
          style={{
            padding: 12,
            borderRadius: 12,
            backgroundColor: "#ffffff",
            borderWidth: 1,
            borderColor: "rgba(15, 23, 42, 0.06)",
          }}
        >
          <Text
            style={{
              fontSize: 14,
              fontWeight: "600",
              marginBottom: 8,
              color: "#111827",
            }}
          >
            Summary
          </Text>
          <Text
            style={{
              fontSize: 13,
              color: "#4b5563",
              lineHeight: 18,
            }}
          >
            This page gives a quick overview of how your portfolio risk and
            concentration look based on simple rules. It is a starting point and
            can be extended with more analytics later.
          </Text>
        </View>
      </View>
    </ScrollView>
  );
}

