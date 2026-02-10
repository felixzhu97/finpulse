const baseUrl =
  process.env.PORTFOLIO_API_URL ||
  process.env.EXPO_PUBLIC_PORTFOLIO_API_URL ||
  "http://localhost:8800";

const api = (path) => `${baseUrl.replace(/\/$/, "")}${path}`;

const seedPortfolio = {
  id: "demo-portfolio",
  ownerName: "BlackRock Model Portfolio",
  baseCurrency: "USD",
  accounts: [
    {
      id: "acc-brokerage-1",
      name: "Charles Schwab Brokerage",
      type: "brokerage",
      currency: "USD",
      balance: 128450,
      todayChange: 1850,
      holdings: [
        {
          id: "h-aapl",
          symbol: "AAPL",
          name: "Apple Inc.",
          quantity: 100,
          price: 228.5,
          costBasis: 215,
          marketValue: 22850,
          profit: 1350,
          profitRate: 0.0628,
          assetClass: "equity",
          riskLevel: "medium",
        },
        {
          id: "h-msft",
          symbol: "MSFT",
          name: "Microsoft Corporation",
          quantity: 50,
          price: 418.2,
          costBasis: 395,
          marketValue: 20910,
          profit: 1160,
          profitRate: 0.0587,
          assetClass: "equity",
          riskLevel: "medium",
        },
        {
          id: "h-goog",
          symbol: "GOOGL",
          name: "Alphabet Inc. (Google)",
          quantity: 80,
          price: 175.4,
          costBasis: 165,
          marketValue: 14032,
          profit: 832,
          profitRate: 0.0630,
          assetClass: "equity",
          riskLevel: "medium",
        },
        {
          id: "h-amzn",
          symbol: "AMZN",
          name: "Amazon.com, Inc.",
          quantity: 60,
          price: 198.6,
          costBasis: 185,
          marketValue: 11916,
          profit: 816,
          profitRate: 0.0735,
          assetClass: "equity",
          riskLevel: "medium",
        },
        {
          id: "h-nvda",
          symbol: "NVDA",
          name: "NVIDIA Corporation",
          quantity: 30,
          price: 138.5,
          costBasis: 125,
          marketValue: 4155,
          profit: 405,
          profitRate: 0.1080,
          assetClass: "equity",
          riskLevel: "high",
        },
        {
          id: "h-meta",
          symbol: "META",
          name: "Meta Platforms, Inc.",
          quantity: 25,
          price: 582.0,
          costBasis: 545,
          marketValue: 14550,
          profit: 925,
          profitRate: 0.0679,
          assetClass: "equity",
          riskLevel: "medium",
        },
        {
          id: "h-tsla",
          symbol: "TSLA",
          name: "Tesla, Inc.",
          quantity: 40,
          price: 262.0,
          costBasis: 240,
          marketValue: 10480,
          profit: 880,
          profitRate: 0.0917,
          assetClass: "equity",
          riskLevel: "high",
        },
        {
          id: "h-jpm",
          symbol: "JPM",
          name: "JPMorgan Chase & Co.",
          quantity: 45,
          price: 218.5,
          costBasis: 205,
          marketValue: 9832,
          profit: 607,
          profitRate: 0.0658,
          assetClass: "equity",
          riskLevel: "medium",
        },
        {
          id: "h-spy",
          symbol: "SPY",
          name: "SPDR S&P 500 ETF Trust",
          quantity: 25,
          price: 585.0,
          costBasis: 560,
          marketValue: 14625,
          profit: 625,
          profitRate: 0.0446,
          assetClass: "etf",
          riskLevel: "medium",
        },
        {
          id: "h-berkshire",
          symbol: "BRK.B",
          name: "Berkshire Hathaway Inc. Class B",
          quantity: 5,
          price: 415.0,
          costBasis: 390,
          marketValue: 2075,
          profit: 125,
          profitRate: 0.0641,
          assetClass: "equity",
          riskLevel: "medium",
        },
      ],
    },
    {
      id: "acc-saving-1",
      name: "Goldman Sachs Marcus Savings",
      type: "saving",
      currency: "USD",
      balance: 50000,
      todayChange: 12,
      holdings: [
        {
          id: "h-cash-usd",
          symbol: "CASH",
          name: "Cash",
          quantity: 50000,
          price: 1,
          costBasis: 1,
          marketValue: 50000,
          profit: 0,
          profitRate: 0,
          assetClass: "cash",
          riskLevel: "low",
        },
      ],
    },
    {
      id: "acc-credit-1",
      name: "American Express Platinum",
      type: "creditCard",
      currency: "USD",
      balance: -4250,
      todayChange: 0,
      holdings: [],
    },
  ],
  summary: {
    totalAssets: 203200,
    totalLiabilities: 4250,
    netWorth: 198950,
    todayChange: 1862,
    weekChange: 4200,
  },
  history: [
    { date: "2024-09-01", value: 185000 },
    { date: "2024-09-02", value: 186200 },
    { date: "2024-09-03", value: 184800 },
    { date: "2024-09-04", value: 187500 },
    { date: "2024-09-05", value: 189200 },
    { date: "2024-09-06", value: 191000 },
    { date: "2024-09-07", value: 192500 },
  ],
};

async function post(path, body) {
  const res = await fetch(api(path), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`POST ${path} failed: ${res.status} ${text.slice(0, 300)}`);
  }
  return res.json();
}

async function seedLegacyPortfolio() {
  const url = api("/api/v1/seed");
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(seedPortfolio),
  });
  if (!res.ok) {
    const t = await res.text();
    throw new Error(`Seed portfolio failed: ${res.status} ${t.slice(0, 500)}`);
  }
  console.log("[seed] Legacy demo portfolio written via", url);
}

async function seedResources() {
  const customer1 = await post("/api/v1/customers", {
    name: "Warren Buffett",
    email: "wb@example.com",
    kyc_status: "verified",
  });
  const customer2 = await post("/api/v1/customers", {
    name: "Ray Dalio",
    email: "rd@example.com",
    kyc_status: "pending",
  });
  const customerIds = [customer1.customer_id, customer2.customer_id];

  await post("/api/v1/user-preferences", {
    customer_id: customerIds[0],
    theme: "light",
    language: "en",
    notifications_enabled: true,
  });
  await post("/api/v1/user-preferences", {
    customer_id: customerIds[1],
    theme: "dark",
    language: "en",
    notifications_enabled: false,
  });

  const account1 = await post("/api/v1/accounts", {
    customer_id: customerIds[0],
    account_type: "brokerage",
    currency: "USD",
    status: "active",
  });
  const account2 = await post("/api/v1/accounts", {
    customer_id: customerIds[0],
    account_type: "cash",
    currency: "USD",
    status: "active",
  });
  const account3 = await post("/api/v1/accounts", {
    customer_id: customerIds[1],
    account_type: "brokerage",
    currency: "USD",
    status: "active",
  });
  const accountIds = [account1.account_id, account2.account_id, account3.account_id];

  const inst1 = await post("/api/v1/instruments", {
    symbol: "AAPL",
    name: "Apple Inc.",
    asset_class: "equity",
    currency: "USD",
    exchange: "NASDAQ",
  });
  const inst2 = await post("/api/v1/instruments", {
    symbol: "MSFT",
    name: "Microsoft Corporation",
    asset_class: "equity",
    currency: "USD",
    exchange: "NASDAQ",
  });
  const inst3 = await post("/api/v1/instruments", {
    symbol: "US912828VM18",
    name: "United States 2-Year Treasury Note",
    asset_class: "bond",
    currency: "USD",
    exchange: "OTC",
  });
  const inst4 = await post("/api/v1/instruments", {
    symbol: "SPY",
    name: "SPDR S&P 500 ETF Trust",
    asset_class: "etf",
    currency: "USD",
    exchange: "NYSE Arca",
  });
  const instrumentIds = [inst1.instrument_id, inst2.instrument_id, inst3.instrument_id, inst4.instrument_id];

  const port1 = await post("/api/v1/portfolios", {
    account_id: accountIds[0],
    name: "S&P 500 Growth",
    base_currency: "USD",
  });
  const port2 = await post("/api/v1/portfolios", {
    account_id: accountIds[2],
    name: "60/40 Bogleheads",
    base_currency: "USD",
  });
  const portfolioIds = [port1.portfolio_id, port2.portfolio_id];

  const watchlist = await post("/api/v1/watchlists", {
    customer_id: customerIds[0],
    name: "Mega Cap Tech",
  });

  await post("/api/v1/watchlist-items", {
    watchlist_id: watchlist.watchlist_id,
    instrument_id: instrumentIds[0],
  });
  await post("/api/v1/watchlist-items", {
    watchlist_id: watchlist.watchlist_id,
    instrument_id: instrumentIds[1],
  });

  await post("/api/v1/positions", {
    portfolio_id: portfolioIds[0],
    instrument_id: instrumentIds[0],
    quantity: 100,
    cost_basis: 215,
  });
  await post("/api/v1/positions", {
    portfolio_id: portfolioIds[0],
    instrument_id: instrumentIds[1],
    quantity: 50,
    cost_basis: 395,
  });
  await post("/api/v1/positions", {
    portfolio_id: portfolioIds[0],
    instrument_id: instrumentIds[3],
    quantity: 20,
    cost_basis: 560,
  });

  await post("/api/v1/bonds", {
    instrument_id: instrumentIds[2],
    face_value: 1000,
    coupon_rate: 0.045,
    ytm: 0.0475,
    duration: 1.92,
    convexity: 4.2,
    maturity_years: 2,
    frequency: 2,
  });

  const order = await post("/api/v1/orders", {
    account_id: accountIds[0],
    instrument_id: instrumentIds[0],
    side: "buy",
    quantity: 100,
    order_type: "market",
    status: "filled",
  });

  const trade = await post("/api/v1/trades", {
    order_id: order.order_id,
    quantity: 100,
    price: 225.0,
    fee: 0,
  });

  await post("/api/v1/cash-transactions", {
    account_id: accountIds[1],
    type: "deposit",
    amount: 50000,
    currency: "USD",
    status: "completed",
  });

  const payment = await post("/api/v1/payments", {
    account_id: accountIds[0],
    counterparty: "Interactive Brokers",
    amount: 22500,
    currency: "USD",
    status: "completed",
  });

  await post("/api/v1/settlements", {
    trade_id: trade.trade_id,
    payment_id: payment.payment_id,
    status: "settled",
  });

  const now = new Date().toISOString();
  await post("/api/v1/market-data", {
    instrument_id: instrumentIds[0],
    timestamp: now,
    open: 227.2,
    high: 229.5,
    low: 226.8,
    close: 228.5,
    volume: 52000000,
    change_pct: 0.57,
  });
  await post("/api/v1/market-data", {
    instrument_id: instrumentIds[1],
    timestamp: now,
    open: 416.5,
    high: 419.0,
    low: 415.2,
    close: 418.2,
    volume: 18500000,
    change_pct: 0.41,
  });

  await post("/api/v1/risk-metrics", {
    portfolio_id: portfolioIds[0],
    risk_level: "balanced",
    volatility: 0.18,
    sharpe_ratio: 1.25,
    var: 2500,
    beta: 1.05,
  });

  await post("/api/v1/valuations", {
    instrument_id: instrumentIds[0],
    method: "DCF",
    ev: 2.8e11,
    equity_value: 2.75e11,
    target_price: 230,
    discount_rate: 0.08,
    growth_rate: 0.05,
  });

  console.log("[seed] Domain resources seeded (customers, accounts, instruments, portfolios, watchlists, positions, orders, trades, payments, settlements, market-data, risk-metrics, valuations).");
}

async function main() {
  console.error("[seed] baseUrl:", baseUrl);
  try {
    await seedLegacyPortfolio();
    await seedResources();
    console.log("Seed completed.");
  } catch (e) {
    console.error("[seed] Error:", e.message || e);
    if (e.cause) console.error("[seed] Cause:", e.cause);
    if (e.stack) console.error("[seed] Stack:", e.stack);
    process.exit(1);
  }
}

main();
