import { ScrollView, View } from "react-native";
import { PortfolioSummary } from "@/src/components/PortfolioSummary";
import { getPortfolio, getAssetAllocationByAccountType } from "@/src/services/portfolioService";
import { MetricCard } from "@/src/components/MetricCard";

export default function DashboardScreen() {
  const portfolio = getPortfolio();
  const allocation = getAssetAllocationByAccountType();

  const totalValue = allocation.reduce((sum, item) => sum + item.value, 0);

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: "#f3f4f6" }}
      contentContainerStyle={{ padding: 16, paddingBottom: 32 }}
    >
      <PortfolioSummary portfolio={portfolio} />
      <View style={{ marginTop: 24, gap: 12 }}>
        <MetricCard
          label="Accounts"
          value={String(portfolio.accounts.length)}
          helper="Total accounts in this portfolio"
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
          {allocation.map((item) => {
            const ratio = totalValue === 0 ? 0 : item.value / totalValue;
            const label = item.type;
            const percent = (ratio * 100).toFixed(1);

            return (
              <View
                key={item.type}
                style={{
                  marginBottom: 8,
                }}
              >
                <View
                  style={{
                    flexDirection: "row",
                    justifyContent: "space-between",
                    marginBottom: 4,
                  }}
                >
                  <View style={{ flexDirection: "row", gap: 4 }}>
                    <View
                      style={{
                        width: 8,
                        height: 8,
                        borderRadius: 4,
                        backgroundColor: "#4f46e5",
                        marginTop: 6,
                      }}
                    />
                    <View>
                      <MetricCard
                        label={label}
                        value={`${percent}%`}
                        helper=""
                      />
                    </View>
                  </View>
                </View>
              </View>
            );
          })}
        </View>
      </View>
    </ScrollView>
  );
}

