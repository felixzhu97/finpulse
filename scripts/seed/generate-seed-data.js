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
      balance: 99499,
      todayChange: 1200,
      holdings: [
        { id: "h-aapl", symbol: "AAPL", name: "Apple Inc.", quantity: 50, price: 273.34, costBasis: 260, marketValue: 13667, profit: 667, profitRate: 0.0513, assetClass: "equity", riskLevel: "medium" },
        { id: "h-tsla", symbol: "TSLA", name: "Tesla, Inc.", quantity: 20, price: 419.29, costBasis: 400, marketValue: 8386, profit: 386, profitRate: 0.0482, assetClass: "equity", riskLevel: "high" },
        { id: "h-goog", symbol: "GOOG", name: "Alphabet Inc.", quantity: 30, price: 325.71, costBasis: 310, marketValue: 9771, profit: 471, profitRate: 0.0506, assetClass: "equity", riskLevel: "medium" },
        { id: "h-meta", symbol: "META", name: "Meta Platforms, Inc.", quantity: 10, price: 668.60, costBasis: 640, marketValue: 6686, profit: 286, profitRate: 0.0447, assetClass: "equity", riskLevel: "medium" },
        { id: "h-msft", symbol: "MSFT", name: "Microsoft Corp.", quantity: 40, price: 411.71, costBasis: 390, marketValue: 16468, profit: 868, profitRate: 0.0556, assetClass: "equity", riskLevel: "medium" },
        { id: "h-amzn", symbol: "AMZN", name: "Amazon.com, Inc.", quantity: 50, price: 209.72, costBasis: 200, marketValue: 10486, profit: 486, profitRate: 0.0486, assetClass: "equity", riskLevel: "medium" },
        { id: "h-9988hk", symbol: "9988.HK", name: "Alibaba Group Holding Ltd", quantity: 100, price: 157.90, costBasis: 150, marketValue: 15790, profit: 790, profitRate: 0.0527, assetClass: "equity", riskLevel: "high" },
        { id: "h-0700hk", symbol: "0700.HK", name: "Tencent Holdings Ltd", quantity: 20, price: 560.00, costBasis: 530, marketValue: 11200, profit: 600, profitRate: 0.0566, assetClass: "equity", riskLevel: "medium" },
        { id: "h-3690hk", symbol: "3690.HK", name: "Meituan", quantity: 100, price: 91.05, costBasis: 88, marketValue: 9105, profit: 305, profitRate: 0.0347, assetClass: "equity", riskLevel: "high" },
        { id: "h-1810hk", symbol: "1810.HK", name: "Xiaomi Corp.", quantity: 200, price: 35.20, costBasis: 34, marketValue: 7040, profit: 240, profitRate: 0.0706, assetClass: "equity", riskLevel: "medium" },
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
    totalAssets: 129500,
    totalLiabilities: 3500,
    netWorth: 126000,
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
