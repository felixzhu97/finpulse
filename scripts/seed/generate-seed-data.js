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

async function postBatch(path, items) {
  if (items.length === 0) return [];
  const res = await fetch(api(path), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(items),
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
  const customers = await postBatch("/api/v1/customers/batch", [
    { name: "Warren Buffett", email: "wb@example.com", kyc_status: "verified" },
    { name: "Ray Dalio", email: "rd@example.com", kyc_status: "pending" },
    { name: "Carl Icahn", email: "ci@example.com", kyc_status: "verified" },
  ]);
  const customerIds = customers.map((c) => c.customer_id);

  await postBatch("/api/v1/user-preferences/batch", [
    { customer_id: customerIds[0], theme: "light", language: "en", notifications_enabled: true },
    { customer_id: customerIds[1], theme: "dark", language: "en", notifications_enabled: false },
    { customer_id: customerIds[2], theme: "system", language: "en", notifications_enabled: true },
  ]);

  const accounts = await postBatch("/api/v1/accounts/batch", [
    { customer_id: customerIds[0], account_type: "brokerage", currency: "USD", status: "active" },
    { customer_id: customerIds[0], account_type: "cash", currency: "USD", status: "active" },
    { customer_id: customerIds[1], account_type: "brokerage", currency: "USD", status: "active" },
    { customer_id: customerIds[1], account_type: "ira", currency: "USD", status: "active" },
    { customer_id: customerIds[2], account_type: "brokerage", currency: "USD", status: "active" },
  ]);
  const accountIds = accounts.map((a) => a.account_id);

  const instruments = await postBatch("/api/v1/instruments/batch", [
    { symbol: "AAPL", name: "Apple Inc.", asset_class: "equity", currency: "USD", exchange: "NASDAQ" },
    { symbol: "MSFT", name: "Microsoft Corporation", asset_class: "equity", currency: "USD", exchange: "NASDAQ" },
    { symbol: "US912828VM18", name: "United States 2-Year Treasury Note", asset_class: "bond", currency: "USD", exchange: "OTC" },
    { symbol: "SPY", name: "SPDR S&P 500 ETF Trust", asset_class: "etf", currency: "USD", exchange: "NYSE Arca" },
    { symbol: "GOOGL", name: "Alphabet Inc. (Google)", asset_class: "equity", currency: "USD", exchange: "NASDAQ" },
    { symbol: "AMZN", name: "Amazon.com, Inc.", asset_class: "equity", currency: "USD", exchange: "NASDAQ" },
    { symbol: "NVDA", name: "NVIDIA Corporation", asset_class: "equity", currency: "USD", exchange: "NASDAQ" },
    { symbol: "QQQ", name: "Invesco QQQ Trust", asset_class: "etf", currency: "USD", exchange: "NASDAQ" },
    { symbol: "US912828XG18", name: "United States 10-Year Treasury Note", asset_class: "bond", currency: "USD", exchange: "OTC" },
    { symbol: "AAPL250117C00230000", name: "AAPL Jan 2026 230 Call", asset_class: "option", currency: "USD", exchange: "CBOE" },
  ]);
  const inst1 = instruments[0];
  const inst2 = instruments[1];
  const inst3 = instruments[2];
  const inst4 = instruments[3];
  const inst5 = instruments[4];
  const inst6 = instruments[5];
  const inst7 = instruments[6];
  const inst8 = instruments[7];
  const inst9 = instruments[8];
  const instOption = instruments[9];

  const portfolios = await postBatch("/api/v1/portfolios/batch", [
    { account_id: accountIds[0], name: "S&P 500 Growth", base_currency: "USD" },
    { account_id: accountIds[2], name: "60/40 Bogleheads", base_currency: "USD" },
    { account_id: accountIds[0], name: "Dividend Growth", base_currency: "USD" },
    { account_id: accountIds[3], name: "IRA Index", base_currency: "USD" },
  ]);
  const portfolioIds = portfolios.map((p) => p.portfolio_id);

  const watchlists = await postBatch("/api/v1/watchlists/batch", [
    { customer_id: customerIds[0], name: "Mega Cap Tech" },
    { customer_id: customerIds[0], name: "Dividend Aristocrats" },
    { customer_id: customerIds[1], name: "All Weather" },
  ]);
  const watchlist1 = watchlists[0];
  const watchlist2 = watchlists[1];
  const watchlist3 = watchlists[2];

  await postBatch("/api/v1/watchlist-items/batch", [
    { watchlist_id: watchlist1.watchlist_id, instrument_id: inst1.instrument_id },
    { watchlist_id: watchlist1.watchlist_id, instrument_id: inst2.instrument_id },
    { watchlist_id: watchlist1.watchlist_id, instrument_id: inst5.instrument_id },
    { watchlist_id: watchlist1.watchlist_id, instrument_id: inst7.instrument_id },
    { watchlist_id: watchlist2.watchlist_id, instrument_id: inst1.instrument_id },
    { watchlist_id: watchlist2.watchlist_id, instrument_id: inst2.instrument_id },
    { watchlist_id: watchlist3.watchlist_id, instrument_id: inst4.instrument_id },
    { watchlist_id: watchlist3.watchlist_id, instrument_id: inst8.instrument_id },
    { watchlist_id: watchlist3.watchlist_id, instrument_id: inst3.instrument_id },
  ]);

  await postBatch("/api/v1/positions/batch", [
    { portfolio_id: portfolioIds[0], instrument_id: inst1.instrument_id, quantity: 100, cost_basis: 215 },
    { portfolio_id: portfolioIds[0], instrument_id: inst2.instrument_id, quantity: 50, cost_basis: 395 },
    { portfolio_id: portfolioIds[0], instrument_id: inst4.instrument_id, quantity: 20, cost_basis: 560 },
    { portfolio_id: portfolioIds[0], instrument_id: inst5.instrument_id, quantity: 30, cost_basis: 165 },
    { portfolio_id: portfolioIds[1], instrument_id: inst4.instrument_id, quantity: 50, cost_basis: 550 },
    { portfolio_id: portfolioIds[1], instrument_id: inst3.instrument_id, quantity: 10, cost_basis: 980 },
    { portfolio_id: portfolioIds[2], instrument_id: inst1.instrument_id, quantity: 25, cost_basis: 210 },
    { portfolio_id: portfolioIds[2], instrument_id: inst2.instrument_id, quantity: 15, cost_basis: 400 },
    { portfolio_id: portfolioIds[3], instrument_id: inst4.instrument_id, quantity: 100, cost_basis: 570 },
    { portfolio_id: portfolioIds[3], instrument_id: inst8.instrument_id, quantity: 40, cost_basis: 485 },
  ]);

  await postBatch("/api/v1/bonds/batch", [
    { instrument_id: inst3.instrument_id, face_value: 1000, coupon_rate: 0.045, ytm: 0.0475, duration: 1.92, convexity: 4.2, maturity_years: 2, frequency: 2 },
    { instrument_id: inst9.instrument_id, face_value: 1000, coupon_rate: 0.0425, ytm: 0.044, duration: 8.5, convexity: 82, maturity_years: 10, frequency: 2 },
  ]);

  const expiry = new Date("2026-01-17T21:00:00.000Z").toISOString();
  await post("/api/v1/options", {
    instrument_id: instOption.instrument_id,
    underlying_instrument_id: inst1.instrument_id,
    strike: 230,
    expiry,
    option_type: "call",
    risk_free_rate: 0.0475,
    volatility: 0.22,
    bs_price: 18.5,
    delta: 0.55,
    gamma: 0.02,
    theta: -0.05,
    vega: 0.12,
    rho: 0.08,
    implied_volatility: 0.21,
  });

  const orders = await postBatch("/api/v1/orders/batch", [
    { account_id: accountIds[0], instrument_id: inst1.instrument_id, side: "buy", quantity: 100, order_type: "market", status: "filled" },
    { account_id: accountIds[0], instrument_id: inst2.instrument_id, side: "buy", quantity: 50, order_type: "limit", status: "filled" },
    { account_id: accountIds[0], instrument_id: inst4.instrument_id, side: "buy", quantity: 20, order_type: "market", status: "filled" },
    { account_id: accountIds[2], instrument_id: inst4.instrument_id, side: "buy", quantity: 50, order_type: "market", status: "filled" },
  ]);
  const order1 = orders[0];
  const order2 = orders[1];
  const order3 = orders[2];
  const order4 = orders[3];

  const trades = await postBatch("/api/v1/trades/batch", [
    { order_id: order1.order_id, quantity: 100, price: 225.0, fee: 0 },
    { order_id: order2.order_id, quantity: 50, price: 398.0, fee: 0 },
    { order_id: order3.order_id, quantity: 20, price: 562.0, fee: 0 },
    { order_id: order4.order_id, quantity: 50, price: 555.0, fee: 0 },
  ]);
  const trade1 = trades[0];
  const trade2 = trades[1];
  const trade3 = trades[2];
  const trade4 = trades[3];

  await postBatch("/api/v1/cash-transactions/batch", [
    { account_id: accountIds[1], type: "deposit", amount: 50000, currency: "USD", status: "completed" },
    { account_id: accountIds[1], type: "withdrawal", amount: 5000, currency: "USD", status: "completed" },
    { account_id: accountIds[2], type: "deposit", amount: 100000, currency: "USD", status: "completed" },
    { account_id: accountIds[4], type: "deposit", amount: 25000, currency: "USD", status: "completed" },
  ]);

  const payments = await postBatch("/api/v1/payments/batch", [
    { account_id: accountIds[0], counterparty: "Interactive Brokers", amount: 22500, currency: "USD", status: "completed" },
    { account_id: accountIds[0], counterparty: "Charles Schwab", amount: 19900, currency: "USD", status: "completed" },
    { account_id: accountIds[0], counterparty: "Fidelity", amount: 11240, currency: "USD", status: "completed" },
    { account_id: accountIds[2], counterparty: "Vanguard", amount: 27750, currency: "USD", status: "completed" },
  ]);
  const payment1 = payments[0];
  const payment2 = payments[1];
  const payment3 = payments[2];
  const payment4 = payments[3];

  await postBatch("/api/v1/settlements/batch", [
    { trade_id: trade1.trade_id, payment_id: payment1.payment_id, status: "settled" },
    { trade_id: trade2.trade_id, payment_id: payment2.payment_id, status: "settled" },
    { trade_id: trade3.trade_id, payment_id: payment3.payment_id, status: "settled" },
    { trade_id: trade4.trade_id, payment_id: payment4.payment_id, status: "settled" },
  ]);

  const now = new Date().toISOString();
  const marketDataItems = [
    { instrument_id: inst1.instrument_id, timestamp: now, open: 227.2, high: 229.5, low: 226.8, close: 228.5, volume: 52000000, change_pct: 0.57 },
    { instrument_id: inst2.instrument_id, timestamp: now, open: 416.5, high: 419.0, low: 415.2, close: 418.2, volume: 18500000, change_pct: 0.41 },
    { instrument_id: inst4.instrument_id, timestamp: now, open: 582.0, high: 586.5, low: 581.0, close: 585.0, volume: 65000000, change_pct: 0.52 },
    { instrument_id: inst5.instrument_id, timestamp: now, open: 174.2, high: 176.0, low: 173.5, close: 175.4, volume: 22000000, change_pct: 0.69 },
    { instrument_id: inst6.instrument_id, timestamp: now, open: 197.0, high: 199.5, low: 196.2, close: 198.6, volume: 45000000, change_pct: 0.81 },
    { instrument_id: inst7.instrument_id, timestamp: now, open: 136.5, high: 139.2, low: 135.8, close: 138.5, volume: 38000000, change_pct: 1.47 },
    { instrument_id: inst8.instrument_id, timestamp: now, open: 518.0, high: 522.5, low: 517.0, close: 521.0, volume: 42000000, change_pct: 0.58 },
  ];
  await postBatch("/api/v1/market-data/batch", marketDataItems);

  await postBatch("/api/v1/risk-metrics/batch", [
    { portfolio_id: portfolioIds[0], risk_level: "balanced", volatility: 0.18, sharpe_ratio: 1.25, var: 2500, beta: 1.05 },
    { portfolio_id: portfolioIds[1], risk_level: "moderate", volatility: 0.12, sharpe_ratio: 1.1, var: 1800, beta: 0.95 },
    { portfolio_id: portfolioIds[3], risk_level: "conservative", volatility: 0.08, sharpe_ratio: 0.95, var: 1200, beta: 0.88 },
  ]);

  const valuationItems = [
    { instrument_id: inst1.instrument_id, method: "DCF", ev: 2.8e11, equity_value: 2.75e11, target_price: 230, discount_rate: 0.08, growth_rate: 0.05 },
    { instrument_id: inst2.instrument_id, method: "DCF", ev: 2.6e11, equity_value: 2.55e11, target_price: 435, discount_rate: 0.08, growth_rate: 0.06 },
    { instrument_id: inst4.instrument_id, method: "multiples", target_price: 600, multiples: 22.5 },
    { instrument_id: inst5.instrument_id, method: "DCF", ev: 1.8e11, equity_value: 1.75e11, target_price: 185, discount_rate: 0.09, growth_rate: 0.12 },
    { instrument_id: inst7.instrument_id, method: "DCF", ev: 3.2e11, equity_value: 3.1e11, target_price: 145, discount_rate: 0.10, growth_rate: 0.20 },
  ];
  await postBatch("/api/v1/valuations/batch", valuationItems);

  console.log("[seed] Domain resources seeded via batch APIs: customers(3), user-preferences(3), accounts(5), instruments(10), portfolios(4), watchlists(3), watchlist-items(9), positions(10), bonds(2), options(1), orders(4), trades(4), cash-transactions(4), payments(4), settlements(4), market-data(7), risk-metrics(3), valuations(5).");
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
