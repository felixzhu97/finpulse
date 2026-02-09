import { Dimensions, ScrollView, StyleSheet, Text, View } from "react-native";
import { useEffect, useState } from "react";
import { BarChart } from "react-native-chart-kit";
import { getRiskSummary } from "@/src/services/portfolioService";
import { MetricCard } from "@/src/components/ui/MetricCard";

export default function InsightsScreen() {
  const [highRatio, setHighRatio] = useState(0);
  const [topConcentration, setTopConcentration] = useState(0);

  useEffect(() => {
    let active = true;

    const load = async () => {
      const risk = await getRiskSummary();
      if (!active) {
        return;
      }
      setHighRatio(risk.highRatio);
      setTopConcentration(risk.topHoldingsConcentration);
    };

    load();

    return () => {
      active = false;
    };
  }, []);

  const highRiskPercent = (highRatio * 100).toFixed(1);
  const concentrationPercent = (topConcentration * 100).toFixed(1);

  const highRiskText =
    highRatio > 0.4
      ? "High exposure to high-risk assets."
      : "High-risk exposure is moderate.";

  const concentrationText =
    topConcentration > 0.5
      ? "Portfolio is highly concentrated in top holdings."
      : "Portfolio concentration looks balanced.";

  const width = Dimensions.get("window").width - 32;

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <View style={styles.block}>
        <MetricCard
          label="High-risk exposure"
          value={`${highRiskPercent}%`}
          helper={highRiskText}
          tone={highRatio > 0.4 ? "negative" : "default"}
        />
        <MetricCard
          label="Top 5 holdings concentration"
          value={`${concentrationPercent}%`}
          helper={concentrationText}
          tone={topConcentration > 0.5 ? "negative" : "default"}
        />
        <View style={styles.chartCard}>
          <BarChart
            data={{
              labels: ["High risk", "Top 5"],
              datasets: [
                {
                  data: [
                    Number(highRiskPercent),
                    Number(concentrationPercent),
                  ],
                },
              ],
            }}
            width={width}
            height={200}
            fromZero
            yAxisLabel=""
            yAxisSuffix="%"
            chartConfig={{
              backgroundGradientFrom: "#ffffff",
              backgroundGradientTo: "#ffffff",
              color: () => "#4f46e5",
              labelColor: () => "#4b5563",
              decimalPlaces: 1,
              propsForBackgroundLines: {
                strokeWidth: 0,
              },
            }}
            withInnerLines={false}
            showBarTops={false}
            style={styles.barChart}
          />
        </View>
        <View style={styles.summaryCard}>
          <Text style={styles.summaryTitle}>Summary</Text>
          <Text style={styles.summaryBody}>
            This page gives a quick overview of how your portfolio risk and
            concentration look based on simple rules. It is a starting point and
            can be extended with more analytics later.
          </Text>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#f3f4f6",
  },
  content: {
    padding: 16,
    paddingBottom: 32,
  },
  block: {
    gap: 16,
  },
  chartCard: {
    borderRadius: 12,
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "rgba(15, 23, 42, 0.06)",
    paddingVertical: 8,
    overflow: "hidden",
    width: "100%",
  },
  barChart: {
    marginLeft: -16,
  },
  summaryCard: {
    padding: 12,
    borderRadius: 12,
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "rgba(15, 23, 42, 0.06)",
  },
  summaryTitle: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 8,
    color: "#111827",
  },
  summaryBody: {
    fontSize: 13,
    color: "#4b5563",
    lineHeight: 18,
  },
});
