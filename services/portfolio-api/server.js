const express = require("express");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

const demoPortfolio = {
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
          marketValue: 150 * 190,
          profit: 150 * (190 - 160),
          profitRate: (190 - 160) / 160,
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
          marketValue: 80 * 420,
          profit: 80 * (420 - 350),
          profitRate: (420 - 350) / 350,
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
    totalAssets: 125000 + 30000,
    totalLiabilities: 3500,
    netWorth: 125000 + 30000 - 3500,
    todayChange: 1200 + 5,
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

app.get("/api/v1/portfolio", (req, res) => {
  res.json(demoPortfolio);
});

const port = 8080;
app.listen(port, () => {
  console.log(`portfolio-api listening on http://localhost:${port}`);
});

