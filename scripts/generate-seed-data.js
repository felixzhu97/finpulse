const baseUrl =
  process.env.PORTFOLIO_API_URL || process.env.EXPO_PUBLIC_PORTFOLIO_API_URL || "http://localhost:8800";

const seedPortfolio = {
  id: "demo-portfolio",
  ownerName: "Demo User",
  baseCurrency: "USD",
  accounts: [
    {
      id: "acc-brokerage-1",
      name: "Brokerage Account",
      type: "brokerage",
      currency: "USD",
      balance: 125000,
      todayChange: 1200,
      holdings: [
        {
          id: "h-aapl",
          symbol: "AAPL",
          name: "Apple Inc.",
          quantity: 150,
          price: 190,
          costBasis: 160,
          marketValue: 28500,
          profit: 4500,
          profitRate: 0.1875,
          assetClass: "equity",
          riskLevel: "medium",
        },
        {
          id: "h-msft",
          symbol: "MSFT",
          name: "Microsoft Corp.",
          quantity: 80,
          price: 420,
          costBasis: 350,
          marketValue: 33600,
          profit: 5600,
          profitRate: 0.2,
          assetClass: "equity",
          riskLevel: "medium",
        },
      ],
    },
    {
      id: "acc-saving-1",
      name: "High Yield Savings",
      type: "saving",
      currency: "USD",
      balance: 30000,
      todayChange: 5,
      holdings: [
        {
          id: "h-cash-usd",
          symbol: "CASH",
          name: "Cash",
          quantity: 30000,
          price: 1,
          costBasis: 1,
          marketValue: 30000,
          profit: 0,
          profitRate: 0,
          assetClass: "cash",
          riskLevel: "low",
        },
      ],
    },
    {
      id: "acc-credit-1",
      name: "Credit Card",
      type: "creditCard",
      currency: "USD",
      balance: -3500,
      todayChange: 0,
      holdings: [],
    },
  ],
  summary: {
    totalAssets: 155000,
    totalLiabilities: 3500,
    netWorth: 151500,
    todayChange: 1205,
    weekChange: 3200,
  },
  history: [
    { date: "2024-09-01", value: 140000 },
    { date: "2024-09-02", value: 141200 },
    { date: "2024-09-03", value: 139800 },
    { date: "2024-09-04", value: 142000 },
    { date: "2024-09-05", value: 143500 },
    { date: "2024-09-06", value: 144200 },
    { date: "2024-09-07", value: 145700 },
  ],
};

async function main() {
  const url = `${baseUrl.replace(/\/$/, "")}/api/v1/seed`;
  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(seedPortfolio),
    });
    if (!res.ok) {
      const t = await res.text();
      throw new Error(`Seed failed: ${res.status} ${t}`);
    }
    console.log("Seed data written to database via", url);
  } catch (e) {
    console.error(e.message || e);
    process.exit(1);
  }
}

main();
