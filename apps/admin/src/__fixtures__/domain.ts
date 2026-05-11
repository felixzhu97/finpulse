// Domain Test Values for FinPulse Admin Application
// Following TDD Skill specifications for standardized mock data

// ============================================================================
// BOUNDARY VALUES
// ============================================================================

export const BOUNDARY_VALUES = {
  EMPTY_STRING: '',
  NULL: null,
  UNDEFINED: undefined,
  ZERO: 0,
  ONE: 1,
  NEGATIVE: -1,
  MINUS_ZERO: -0,
  EMPTY_ARRAY: [] as unknown[],
  EMPTY_OBJECT: {},
  MAX_SAFE_INTEGER: Number.MAX_SAFE_INTEGER,
  MIN_SAFE_INTEGER: Number.MIN_SAFE_INTEGER,
} as const;

// ============================================================================
// TEST DATA GENERATORS
// ============================================================================

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const createDataGenerator =
  <T extends Record<string, any>>(defaults: T) =>
  (overrides: Partial<T> = {}): T => ({
    ...defaults,
    ...overrides,
    id: overrides.id ?? `test_${Date.now()}_${Math.random().toString(36).slice(2)}`,
  });

// ============================================================================
// TRANSACTION DOMAIN
// ============================================================================

export const TRANSACTION_TYPES = ['Buy', 'Sell', 'Deposit', 'Withdrawal'] as const;
export const TRANSACTION_STATUSES = ['Completed', 'Pending', 'Failed'] as const;

export type TransactionType = (typeof TRANSACTION_TYPES)[number];
export type TransactionStatus = (typeof TRANSACTION_STATUSES)[number];

export interface Transaction {
  id: string;
  date: string;
  type: TransactionType;
  symbol: string;
  name: string;
  quantity: number;
  price: number;
  amount: number;
  status: TransactionStatus;
  fee: number;
}

export const createTransaction = createDataGenerator<Transaction>({
  id: 'tx_001',
  date: '2024-01-15',
  type: 'Buy',
  symbol: 'AAPL',
  name: 'Apple Inc.',
  quantity: 10,
  price: 182.52,
  amount: 1825.2,
  status: 'Completed',
  fee: 1.0,
});

export const createTransactions = (count: number, overrides: Partial<Transaction> = {}) =>
  Array.from({ length: count }, (_, i) =>
    createTransaction({
      id: `tx_${String(i + 1).padStart(3, '0')}`,
      symbol: ['AAPL', 'GOOGL', 'MSFT', 'NVDA', 'TSLA'][i % 5],
      type: TRANSACTION_TYPES[i % 4],
      status: TRANSACTION_STATUSES[i % 3],
      ...overrides,
    })
  );

export const TRANSACTION_DOMAIN = {
  VALID: {
    buyTransaction: createTransaction({ type: 'Buy', status: 'Completed' }),
    sellTransaction: createTransaction({ type: 'Sell', status: 'Completed' }),
    depositTransaction: createTransaction({ type: 'Deposit', status: 'Completed' }),
    withdrawalTransaction: createTransaction({ type: 'Withdrawal', status: 'Completed' }),
  },
  BOUNDARY: {
    zeroQuantity: createTransaction({ quantity: 0 }),
    nullQuantity: createTransaction({ quantity: null as unknown as number }),
    zeroAmount: createTransaction({ amount: 0 }),
    largeAmount: createTransaction({ amount: 999999.99 }),
    maxQuantity: createTransaction({ quantity: 10000 }),
  },
  ERROR: {
    failedTransaction: createTransaction({ status: 'Failed' }),
    pendingTransaction: createTransaction({ status: 'Pending' }),
    nullPrice: createTransaction({ price: null as unknown as number }),
    undefinedAmount: createTransaction({ amount: undefined as unknown as number }),
  },
} as const;

// ============================================================================
// REPORT DOMAIN
// ============================================================================

export const REPORT_TYPES = ['Performance', 'Risk', 'Tax', 'Compliance', 'Custom'] as const;
export const REPORT_STATUSES = ['Ready', 'Generating', 'Failed'] as const;

export type ReportType = (typeof REPORT_TYPES)[number];
export type ReportStatus = (typeof REPORT_STATUSES)[number];

export interface Report {
  id: string;
  title: string;
  type: ReportType;
  generatedDate: string;
  period: string;
  status: ReportStatus;
  fileSize: string;
  format: 'PDF' | 'Excel' | 'CSV';
}

export const createReport = createDataGenerator<Report>({
  id: 'report_001',
  title: 'Q4 2025 Performance Report',
  type: 'Performance',
  generatedDate: '2026-01-15',
  period: 'Q4 2025',
  status: 'Ready',
  fileSize: '2.4 MB',
  format: 'PDF',
});

export const createReports = (count: number, overrides: Partial<Report> = {}) =>
  Array.from({ length: count }, (_, i) =>
    createReport({
      id: `report_${String(i + 1).padStart(3, '0')}`,
      type: REPORT_TYPES[i % 5],
      status: REPORT_STATUSES[i % 3],
      ...overrides,
    })
  );

export const REPORT_DOMAIN = {
  VALID: {
    performanceReport: createReport({ type: 'Performance', status: 'Ready' }),
    riskReport: createReport({ type: 'Risk', status: 'Ready' }),
    taxReport: createReport({ type: 'Tax', status: 'Ready' }),
    complianceReport: createReport({ type: 'Compliance', status: 'Ready' }),
    customReport: createReport({ type: 'Custom', status: 'Ready' }),
  },
  BOUNDARY: {
    generatingReport: createReport({ status: 'Generating' }),
    failedReport: createReport({ status: 'Failed' }),
  },
} as const;

// ============================================================================
// CLIENT DOMAIN
// ============================================================================

export const CLIENT_STATUSES = ['Active', 'Inactive', 'Pending'] as const;
export const RISK_PROFILES = ['Conservative', 'Moderate', 'Aggressive'] as const;

export type ClientStatus = (typeof CLIENT_STATUSES)[number];
export type RiskProfile = (typeof RISK_PROFILES)[number];

export interface Client {
  id: string;
  name: string;
  email: string;
  phone: string;
  portfolioValue: number;
  totalAssets: number;
  activeInvestments: number;
  joinDate: string;
  status: ClientStatus;
  riskProfile: RiskProfile;
}

export const createClient = createDataGenerator<Client>({
  id: 'client_001',
  name: 'John Smith',
  email: 'john.smith@example.com',
  phone: '+1 234-567-8900',
  portfolioValue: 1250000,
  totalAssets: 8,
  activeInvestments: 5,
  joinDate: '2024-01-15',
  status: 'Active',
  riskProfile: 'Moderate',
});

export const createClients = (count: number, overrides: Partial<Client> = {}) =>
  Array.from({ length: count }, (_, i) =>
    createClient({
      id: `client_${String(i + 1).padStart(3, '0')}`,
      name: `Client ${i + 1}`,
      status: CLIENT_STATUSES[i % 3],
      riskProfile: RISK_PROFILES[i % 3],
      ...overrides,
    })
  );

export const CLIENT_DOMAIN = {
  VALID: {
    activeConservative: createClient({ status: 'Active', riskProfile: 'Conservative' }),
    activeModerate: createClient({ status: 'Active', riskProfile: 'Moderate' }),
    activeAggressive: createClient({ status: 'Active', riskProfile: 'Aggressive' }),
    inactiveClient: createClient({ status: 'Inactive' }),
    pendingClient: createClient({ status: 'Pending' }),
  },
  BOUNDARY: {
    zeroPortfolio: createClient({ portfolioValue: 0 }),
    largePortfolio: createClient({ portfolioValue: 99999999 }),
    maxAUM: createClient({ totalAssets: 100 }),
  },
} as const;

// ============================================================================
// PORTFOLIO DOMAIN
// ============================================================================

export const SECTORS = ['Technology', 'Healthcare', 'Finance', 'Energy', 'Consumer', 'Automotive', 'E-commerce'] as const;

export type Sector = (typeof SECTORS)[number];

export interface PortfolioHolding {
  id?: string;
  symbol: string;
  name: string;
  quantity: number;
  avgPrice: number;
  currentPrice: number;
  marketValue: number;
  costBasis: number;
  gainLoss: number;
  gainLossPercent: number;
  allocation: number;
  sector: string;
}

export const createPortfolioHolding = createDataGenerator<PortfolioHolding>({
  symbol: 'AAPL',
  name: 'Apple Inc.',
  quantity: 50,
  avgPrice: 175.2,
  currentPrice: 182.52,
  marketValue: 9126,
  costBasis: 8760,
  gainLoss: 366,
  gainLossPercent: 4.18,
  allocation: 18.5,
  sector: 'Technology',
});

export const createPortfolioHoldings = (count: number, overrides: Partial<PortfolioHolding> = {}) =>
  Array.from({ length: count }, (_, i) =>
    createPortfolioHolding({
      symbol: ['AAPL', 'GOOGL', 'MSFT', 'NVDA', 'TSLA', 'AMZN', 'META'][i % 7],
      sector: SECTORS[i % 7],
      gainLoss: i % 2 === 0 ? 100 * (i + 1) : -50 * (i + 1),
      ...overrides,
    })
  );

export const PORTFOLIO_DOMAIN = {
  VALID: {
    stockHolding: createPortfolioHolding({ symbol: 'AAPL', sector: 'Technology' }),
    etfHolding: createPortfolioHolding({ symbol: 'SPY', sector: 'Finance' }),
    bondHolding: createPortfolioHolding({ symbol: 'BND', sector: 'Finance' }),
  },
  BOUNDARY: {
    zeroGain: createPortfolioHolding({ gainLoss: 0 }),
    positiveGain: createPortfolioHolding({ gainLoss: 1000 }),
    negativeGain: createPortfolioHolding({ gainLoss: -500 }),
    maxAllocation: createPortfolioHolding({ allocation: 100 }),
  },
} as const;

// ============================================================================
// WATCHLIST DOMAIN
// ============================================================================

export interface WatchListItem {
  id?: string;
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  volume: string;
}

export const createWatchListItem = createDataGenerator<WatchListItem>({
  symbol: 'AAPL',
  name: 'Apple Inc.',
  price: 182.52,
  change: 2.34,
  changePercent: 1.3,
  volume: '12.5M',
});

export const createWatchListItems = (count: number, overrides: Partial<WatchListItem> = {}) =>
  Array.from({ length: count }, (_, i) =>
    createWatchListItem({
      symbol: ['AAPL', 'TSLA', 'GOOGL', 'MSFT', 'NVDA'][i % 5],
      change: i % 2 === 0 ? 1.5 * (i + 1) : -1.2 * (i + 1),
      changePercent: i % 2 === 0 ? 0.5 * (i + 1) : -0.3 * (i + 1),
      ...overrides,
    })
  );

export const WATCHLIST_DOMAIN = {
  VALID: {
    risingStock: createWatchListItem({ change: 5.5, changePercent: 3.2 }),
    fallingStock: createWatchListItem({ change: -3.2, changePercent: -1.8 }),
    stableStock: createWatchListItem({ change: 0, changePercent: 0 }),
  },
} as const;

// ============================================================================
// MARKET TRENDS DOMAIN
// ============================================================================

export interface MarketTrend {
  name: string;
  value: number;
  change: number;
  changePercent: number;
}

export const createMarketTrend = createDataGenerator<MarketTrend>({
  name: 'Shanghai Composite',
  value: 3150.42,
  change: 25.3,
  changePercent: 0.81,
});

export const MARKET_DOMAIN = {
  VALID: {
    shanghaiComposite: createMarketTrend({ name: 'Shanghai Composite', value: 3150.42 }),
    hangSeng: createMarketTrend({ name: 'Hang Seng Index', value: 18500.0 }),
    nikkei225: createMarketTrend({ name: 'Nikkei 225', value: 38000.0 }),
  },
  BOUNDARY: {
    bullish: createMarketTrend({ change: 100, changePercent: 3.5 }),
    bearish: createMarketTrend({ change: -100, changePercent: -3.5 }),
    flat: createMarketTrend({ change: 0, changePercent: 0 }),
  },
} as const;

// ============================================================================
// USER DOMAIN
// ============================================================================

export const USER_ROLES = ['admin', 'analyst', 'trader', 'viewer', 'Senior Analyst'] as const;

export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  avatar?: string;
}

export const createUser = createDataGenerator<User>({
  id: 'user_001',
  name: 'John Chen',
  email: 'john.chen@finpulse.com',
  role: 'Senior Analyst',
  avatar: 'https://example.com/avatar.jpg',
});

export const USER_DOMAIN = {
  VALID: {
    admin: createUser({ role: 'admin' }),
    analyst: createUser({ role: 'analyst' }),
    trader: createUser({ role: 'trader' }),
    viewer: createUser({ role: 'viewer' }),
    johnChen: createUser({ name: 'John Chen', role: 'Senior Analyst' }),
  },
} as const;

// ============================================================================
// API RESPONSE DOMAINS
// ============================================================================

export const API_RESPONSE_DOMAIN = {
  SUCCESS: {
    emptyData: { data: [] },
    singleItem: { data: [createTransaction()] },
    multipleItems: { data: createTransactions(10) },
  },
  ERROR: {
    networkError: { ok: false, statusText: 'Network Error' },
    serverError: { ok: false, statusText: 'Internal Server Error', status: 500 },
    notFound: { ok: false, statusText: 'Not Found', status: 404 },
  },
  EDGE_CASES: {
    nullData: { data: null },
    undefinedData: {},
    emptyData: { data: [] },
  },
} as const;

// ============================================================================
// DASHBOARD STATS DOMAIN
// ============================================================================

export const DASHBOARD_STATS_DOMAIN = {
  VALID: {
    totalNetAssets: '¥12,847,382',
    todayProfit: '¥128,473',
    cumulativeReturn: '34.82%',
    activeTrades: '47',
  },
  BOUNDARY: {
    zeroProfit: '¥0',
    negativeProfit: '-¥128,473',
    zeroAssets: '¥0',
    maxReturn: '999.99%',
  },
} as const;

// ============================================================================
// RISK ANALYSIS DOMAIN
// ============================================================================

export const RISK_LEVELS = ['Low Risk', 'Medium Risk', 'High Risk'] as const;

export interface RiskMetrics {
  level: string;
  score: number;
  volatility: number;
  sharpeRatio: number;
  maxDrawdown?: number;
  var95?: number;
}

export const RISK_ANALYSIS_DOMAIN = {
  VALID: {
    lowRisk: { level: 'Low Risk', score: 82, volatility: 8.5, sharpeRatio: 2.1 },
    mediumRisk: { level: 'Medium Risk', score: 55, volatility: 15.2, sharpeRatio: 1.4 },
    highRisk: { level: 'High Risk', score: 25, volatility: 28.5, sharpeRatio: 0.8 },
  },
  METRICS: {
    volatility: { label: 'Volatility', value: '8.5%' },
    sharpeRatio: { label: 'Sharpe Ratio', value: '2.1' },
    maxDrawdown: { label: 'Max Drawdown', value: '-5.2%' },
    var95: { label: 'VaR (95%)', value: '-2.8%' },
  },
} as const;

// ============================================================================
// ASSET ALLOCATION DOMAIN
// ============================================================================

export const ASSET_CATEGORIES = ['Stocks', 'Bonds', 'Funds', 'Cash', 'Other'] as const;

export interface AssetAllocation {
  category: string;
  percentage: number;
  value: string;
}

export const ASSET_ALLOCATION_DOMAIN = {
  VALID: {
    balanced: {
      totalAssets: '¥12.8M',
      allocation: [
        { category: 'Stocks', percentage: 45, value: '¥5.76M' },
        { category: 'Bonds', percentage: 25, value: '¥3.2M' },
        { category: 'Funds', percentage: 15, value: '¥1.92M' },
        { category: 'Cash', percentage: 10, value: '¥1.28M' },
        { category: 'Other', percentage: 5, value: '¥640K' },
      ],
    },
  },
  BOUNDARY: {
    allCash: {
      totalAssets: '¥12.8M',
      allocation: [{ category: 'Cash', percentage: 100, value: '¥12.8M' }] as AssetAllocation[],
    },
    allStocks: {
      totalAssets: '¥12.8M',
      allocation: [{ category: 'Stocks', percentage: 100, value: '¥12.8M' }] as AssetAllocation[],
    },
  },
} as const;

// ============================================================================
// BEHAVIOR EVENTS DOMAIN
// ============================================================================

export const BEHAVIOR_EVENT_TYPES = ['page_view', 'click', 'form_submit', 'search', 'trade'] as const;

export interface BehaviorEvent {
  id: string;
  name: string;
  properties: Record<string, unknown>;
  timestamp: number;
}

export const createBehaviorEvent = (overrides: Partial<BehaviorEvent> = {}): BehaviorEvent => ({
  id: overrides.id ?? 'evt_001',
  name: overrides.name ?? 'page_view',
  properties: overrides.properties ?? { source: 'portal' },
  timestamp: overrides.timestamp ?? Date.now(),
});

export const BEHAVIOR_DOMAIN = {
  VALID: {
    pageView: createBehaviorEvent({ name: 'page_view', properties: { source: 'portal', url: '/dashboard' } }),
    click: createBehaviorEvent({ name: 'click', properties: { element: 'button', action: 'buy' } }),
    trade: createBehaviorEvent({ name: 'trade', properties: { symbol: 'AAPL', type: 'buy', amount: 1000 } }),
  },
  EDGE_CASES: {
    emptyProperties: createBehaviorEvent({ properties: {} }),
    nullProperties: createBehaviorEvent({ properties: null as unknown as Record<string, unknown> }),
  },
} as const;

// ============================================================================
// TIME RANGE DOMAIN
// ============================================================================

export const TIME_RANGES = ['1W', '1M', '3M', '6M', '1Y', 'All'] as const;

export type TimeRange = (typeof TIME_RANGES)[number];

export const TIME_RANGE_DOMAIN = {
  VALID: TIME_RANGES,
  DEFAULT: '1Y' as TimeRange,
  BOUNDARY: {
    shortest: '1W' as TimeRange,
    longest: 'All' as TimeRange,
  },
} as const;
