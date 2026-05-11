import {
  CurrencyCode,
  AccountType,
  Holding,
  Account,
  PortfolioSummary,
  PortfolioHistoryPoint,
  Portfolio,
  RiskSummary,
  AssetAllocationItem,
} from "../../../domain/entities/portfolio";

describe("Portfolio Entity", () => {
  describe("CurrencyCode type", () => {
    it("should accept valid currency codes", () => {
      const currencies: CurrencyCode[] = ["USD", "EUR", "CNY", "JPY", "HKD"];

      currencies.forEach((currency) => {
        expect(["USD", "EUR", "CNY", "JPY", "HKD"]).toContain(currency);
      });
    });
  });

  describe("AccountType type", () => {
    it("should accept valid account types", () => {
      const types: AccountType[] = ["brokerage", "saving", "checking", "creditCard", "cash"];

      types.forEach((type) => {
        expect(["brokerage", "saving", "checking", "creditCard", "cash"]).toContain(type);
      });
    });
  });

  describe("Holding interface", () => {
    it("should accept valid holding data", () => {
      const holding: Holding = {
        id: "H001",
        symbol: "AAPL",
        name: "Apple Inc.",
        quantity: 100,
        price: 175.5,
        costBasis: 15000,
        marketValue: 17550,
        profit: 2550,
        profitRate: 0.17,
        assetClass: "equity",
        riskLevel: "medium",
      };

      expect(holding.id).toBe("H001");
      expect(holding.symbol).toBe("AAPL");
      expect(holding.quantity).toBe(100);
      expect(holding.price).toBe(175.5);
      expect(holding.profit).toBe(2550);
      expect(holding.assetClass).toBe("equity");
      expect(holding.riskLevel).toBe("medium");
    });

    it("should accept all asset classes", () => {
      const assetClasses: Holding["assetClass"][] = ["equity", "bond", "cash", "fund", "other"];

      assetClasses.forEach((assetClass) => {
        const holding: Holding = {
          id: "H_TEST",
          symbol: "TEST",
          name: "Test Asset",
          quantity: 10,
          price: 100,
          costBasis: 1000,
          marketValue: 1000,
          profit: 0,
          profitRate: 0,
          assetClass,
          riskLevel: "low",
        };

        expect(holding.assetClass).toBe(assetClass);
      });
    });

    it("should accept all risk levels", () => {
      const riskLevels: Holding["riskLevel"][] = ["low", "medium", "high"];

      riskLevels.forEach((riskLevel) => {
        const holding: Holding = {
          id: "H_TEST",
          symbol: "TEST",
          name: "Test Asset",
          quantity: 10,
          price: 100,
          costBasis: 1000,
          marketValue: 1000,
          profit: 0,
          profitRate: 0,
          assetClass: "equity",
          riskLevel,
        };

        expect(holding.riskLevel).toBe(riskLevel);
      });
    });

    it("should handle negative profit for losing positions", () => {
      const holding: Holding = {
        id: "H_LOSS",
        symbol: "TSLA",
        name: "Tesla Inc.",
        quantity: 50,
        price: 180,
        costBasis: 10000,
        marketValue: 9000,
        profit: -1000,
        profitRate: -0.1,
        assetClass: "equity",
        riskLevel: "high",
      };

      expect(holding.profit).toBeLessThan(0);
      expect(holding.profitRate).toBeLessThan(0);
    });
  });

  describe("Account interface", () => {
    it("should accept valid account data", () => {
      const account: Account = {
        id: "ACC001",
        name: "Main Brokerage",
        type: "brokerage",
        currency: "USD",
        balance: 50000,
        todayChange: 1250,
        holdings: [],
      };

      expect(account.id).toBe("ACC001");
      expect(account.type).toBe("brokerage");
      expect(account.currency).toBe("USD");
      expect(account.balance).toBe(50000);
      expect(account.todayChange).toBe(1250);
    });

    it("should include holdings array", () => {
      const holding: Holding = {
        id: "H001",
        symbol: "AAPL",
        name: "Apple Inc.",
        quantity: 100,
        price: 175.5,
        costBasis: 15000,
        marketValue: 17550,
        profit: 2550,
        profitRate: 0.17,
        assetClass: "equity",
        riskLevel: "medium",
      };

      const account: Account = {
        id: "ACC001",
        name: "Investment Account",
        type: "brokerage",
        currency: "USD",
        balance: 20000,
        todayChange: 500,
        holdings: [holding],
      };

      expect(account.holdings).toHaveLength(1);
      expect(account.holdings[0].symbol).toBe("AAPL");
    });

    it("should accept all account types", () => {
      const types: AccountType[] = ["brokerage", "saving", "checking", "creditCard", "cash"];

      types.forEach((type) => {
        const account: Account = {
          id: `ACC_${type}`,
          name: `${type} Account`,
          type,
          currency: "USD",
          balance: 1000,
          todayChange: 0,
          holdings: [],
        };

        expect(account.type).toBe(type);
      });
    });
  });

  describe("PortfolioSummary interface", () => {
    it("should accept valid portfolio summary data", () => {
      const summary: PortfolioSummary = {
        totalAssets: 150000,
        totalLiabilities: 25000,
        netWorth: 125000,
        todayChange: 1500,
        weekChange: 3500,
      };

      expect(summary.totalAssets).toBe(150000);
      expect(summary.totalLiabilities).toBe(25000);
      expect(summary.netWorth).toBe(125000);
      expect(summary.todayChange).toBe(1500);
      expect(summary.weekChange).toBe(3500);
    });

    it("should calculate net worth correctly", () => {
      const totalAssets = 100000;
      const totalLiabilities = 20000;
      const netWorth = totalAssets - totalLiabilities;

      expect(netWorth).toBe(80000);
    });

    it("should handle negative changes", () => {
      const summary: PortfolioSummary = {
        totalAssets: 100000,
        totalLiabilities: 30000,
        netWorth: 70000,
        todayChange: -1500,
        weekChange: -2000,
      };

      expect(summary.todayChange).toBeLessThan(0);
      expect(summary.weekChange).toBeLessThan(0);
    });
  });

  describe("PortfolioHistoryPoint interface", () => {
    it("should accept valid history point data", () => {
      const historyPoint: PortfolioHistoryPoint = {
        date: "2024-01-15",
        value: 125000,
      };

      expect(historyPoint.date).toBe("2024-01-15");
      expect(historyPoint.value).toBe(125000);
    });

    it("should represent chronological data points", () => {
      const history: PortfolioHistoryPoint[] = [
        { date: "2024-01-01", value: 100000 },
        { date: "2024-01-15", value: 110000 },
        { date: "2024-01-30", value: 105000 },
        { date: "2024-02-15", value: 125000 },
      ];

      expect(history).toHaveLength(4);
      expect(history[0].value).toBeLessThan(history[3].value);
    });
  });

  describe("Portfolio interface", () => {
    it("should accept valid portfolio data", () => {
      const portfolio: Portfolio = {
        id: "P001",
        ownerName: "John Doe",
        baseCurrency: "USD",
        accounts: [],
        summary: {
          totalAssets: 150000,
          totalLiabilities: 25000,
          netWorth: 125000,
          todayChange: 1500,
          weekChange: 3500,
        },
        history: [],
      };

      expect(portfolio.id).toBe("P001");
      expect(portfolio.ownerName).toBe("John Doe");
      expect(portfolio.baseCurrency).toBe("USD");
    });

    it("should include multiple accounts", () => {
      const portfolio: Portfolio = {
        id: "P001",
        ownerName: "Jane Smith",
        baseCurrency: "USD",
        accounts: [
          {
            id: "ACC001",
            name: "Brokerage",
            type: "brokerage",
            currency: "USD",
            balance: 100000,
            todayChange: 2000,
            holdings: [],
          },
          {
            id: "ACC002",
            name: "Savings",
            type: "saving",
            currency: "USD",
            balance: 50000,
            todayChange: 100,
            holdings: [],
          },
        ],
        summary: {
          totalAssets: 150000,
          totalLiabilities: 0,
          netWorth: 150000,
          todayChange: 2100,
          weekChange: 5000,
        },
        history: [],
      };

      expect(portfolio.accounts).toHaveLength(2);
      expect(portfolio.summary.totalAssets).toBe(150000);
    });
  });

  describe("RiskSummary interface", () => {
    it("should accept valid risk summary data", () => {
      const riskSummary: RiskSummary = {
        highRatio: 0.25,
        topHoldingsConcentration: 0.35,
      };

      expect(riskSummary.highRatio).toBe(0.25);
      expect(riskSummary.topHoldingsConcentration).toBe(0.35);
    });

    it("should measure concentration risk", () => {
      const lowConcentration: RiskSummary = {
        highRatio: 0.1,
        topHoldingsConcentration: 0.15,
      };

      const highConcentration: RiskSummary = {
        highRatio: 0.45,
        topHoldingsConcentration: 0.65,
      };

      expect(lowConcentration.topHoldingsConcentration).toBeLessThan(
        highConcentration.topHoldingsConcentration
      );
    });
  });

  describe("AssetAllocationItem interface", () => {
    it("should accept valid asset allocation item", () => {
      const item: AssetAllocationItem = {
        type: "equity",
        value: 75000,
      };

      expect(item.type).toBe("equity");
      expect(item.value).toBe(75000);
    });

    it("should represent portfolio allocation breakdown", () => {
      const allocation: AssetAllocationItem[] = [
        { type: "brokerage", value: 75000 },
        { type: "saving", value: 40000 },
        { type: "cash", value: 10000 },
      ];

      const total = allocation.reduce((sum, item) => sum + item.value, 0);

      expect(total).toBe(125000);
    });
  });
});
