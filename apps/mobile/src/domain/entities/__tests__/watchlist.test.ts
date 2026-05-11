import {
  Watchlist,
  WatchlistItem,
  WatchlistCreate,
  WatchlistItemCreate,
} from "../../../domain/entities/watchlist";

// ============================================================
// Domain Test Values - 领域测试值
// ============================================================
const WATCHLIST_DOMAIN = {
  IDS: {
    PREFIX: "WL",
    ITEM_PREFIX: "WI",
    CUSTOMER_PREFIX: "C",
    TEST: "WL001",
    TEST_ITEM: "WI001",
    CUSTOMER: "C001",
    INSTRUMENT: "INST001",
  } as const,
  TIMESTAMPS: {
    NOW: "2024-01-15T10:00:00Z",
    LATER: "2024-01-15T11:00:00Z",
    LATER_30: "2024-01-15T11:30:00Z",
  } as const,
  NAMES: {
    TECH: "Tech Stocks",
    HEALTHCARE: "Healthcare",
    FAVORITES: "My Favorites",
    EMPTY: "",
  } as const,
} as const;

const SCENARIOS = {
  WATCHLISTS: [
    { id: "WL_TECH", name: "Tech Stocks", desc: "sector watchlist" },
    { id: "WL_HEALTH", name: "Healthcare", desc: "healthcare watchlist" },
    { id: "WL_FAV", name: "My Favorites", desc: "custom watchlist" },
  ] as const,
} as const;

// ============================================================
// Factory Functions - 工厂函数
// ============================================================
const createWatchlist = (overrides: Partial<Watchlist> = {}): Watchlist => ({
  watchlist_id: WATCHLIST_DOMAIN.IDS.TEST,
  customer_id: WATCHLIST_DOMAIN.IDS.CUSTOMER,
  name: WATCHLIST_DOMAIN.NAMES.TECH,
  created_at: WATCHLIST_DOMAIN.TIMESTAMPS.NOW,
  ...overrides,
});

const createWatchlistItem = (
  overrides: Partial<WatchlistItem> = {}
): WatchlistItem => ({
  watchlist_item_id: WATCHLIST_DOMAIN.IDS.TEST_ITEM,
  watchlist_id: WATCHLIST_DOMAIN.IDS.TEST,
  instrument_id: WATCHLIST_DOMAIN.IDS.INSTRUMENT,
  added_at: WATCHLIST_DOMAIN.TIMESTAMPS.NOW,
  ...overrides,
});

const createWatchlistCreate = (
  overrides: Partial<WatchlistCreate> = {}
): WatchlistCreate => ({
  customer_id: WATCHLIST_DOMAIN.IDS.CUSTOMER,
  name: WATCHLIST_DOMAIN.NAMES.TECH,
  ...overrides,
});

const createWatchlistItemCreate = (
  overrides: Partial<WatchlistItemCreate> = {}
): WatchlistItemCreate => ({
  watchlist_id: WATCHLIST_DOMAIN.IDS.TEST,
  instrument_id: WATCHLIST_DOMAIN.IDS.INSTRUMENT,
  ...overrides,
});

// ============================================================
// Test Suites
// ============================================================
describe("Watchlist Entity", () => {
  describe("Watchlist interface", () => {
    describe("when providing valid data", () => {
      it("should accept complete watchlist data", () => {
        // Arrange
        const watchlist = createWatchlist();

        // Assert
        expect(watchlist.watchlist_id).toBe(WATCHLIST_DOMAIN.IDS.TEST);
        expect(watchlist.customer_id).toBe(WATCHLIST_DOMAIN.IDS.CUSTOMER);
        expect(watchlist.name).toBe(WATCHLIST_DOMAIN.NAMES.TECH);
        expect(watchlist.created_at).toBe(WATCHLIST_DOMAIN.TIMESTAMPS.NOW);
      });
    });

    describe("when modeling real-world watchlists", () => {
      it.each(SCENARIOS.WATCHLISTS)(
        "should model $desc",
        ({ id, name }) => {
          const watchlist = createWatchlist({
            watchlist_id: id,
            name,
          });
          expect(watchlist.watchlist_id).toBe(id);
          expect(watchlist.name).toBe(name);
        }
      );

      it("should allow empty name for default naming", () => {
        const watchlist = createWatchlist({ name: WATCHLIST_DOMAIN.NAMES.EMPTY });
        expect(watchlist.name).toBe("");
      });
    });
  });

  describe("WatchlistItem interface", () => {
    describe("when providing valid data", () => {
      it("should accept complete watchlist item data", () => {
        // Arrange
        const item = createWatchlistItem();

        // Assert
        expect(item.watchlist_item_id).toBe(WATCHLIST_DOMAIN.IDS.TEST_ITEM);
        expect(item.watchlist_id).toBe(WATCHLIST_DOMAIN.IDS.TEST);
        expect(item.instrument_id).toBe(WATCHLIST_DOMAIN.IDS.INSTRUMENT);
        expect(item.added_at).toBe(WATCHLIST_DOMAIN.TIMESTAMPS.NOW);
      });
    });

    describe("when linking to parent watchlist", () => {
      it("should link multiple items to same watchlist", () => {
        // Arrange
        const watchlist = createWatchlist();

        // Act
        const items: WatchlistItem[] = [
          createWatchlistItem({
            watchlist_id: watchlist.watchlist_id,
            instrument_id: "INST_AAPL",
            added_at: WATCHLIST_DOMAIN.TIMESTAMPS.LATER,
          }),
          createWatchlistItem({
            watchlist_id: watchlist.watchlist_id,
            instrument_id: "INST_GOOGL",
            added_at: WATCHLIST_DOMAIN.TIMESTAMPS.LATER_30,
          }),
        ];

        // Assert
        expect(items).toHaveLength(2);
        items.forEach((item) => {
          expect(item.watchlist_id).toBe(watchlist.watchlist_id);
        });
      });
    });
  });

  describe("WatchlistCreate interface", () => {
    describe("when providing valid data", () => {
      it("should accept complete watchlist creation data", () => {
        // Arrange
        const watchlistCreate = createWatchlistCreate();

        // Assert
        expect(watchlistCreate.customer_id).toBe(WATCHLIST_DOMAIN.IDS.CUSTOMER);
        expect(watchlistCreate.name).toBe(WATCHLIST_DOMAIN.NAMES.TECH);
      });
    });

    describe("when validating name field", () => {
      it.each([
        { name: "Tech Stocks", desc: "specific name" },
        { name: "", desc: "empty name" },
        { name: "My Custom List", desc: "custom name" },
      ])("should accept $desc", ({ name }) => {
        const create = createWatchlistCreate({ name });
        expect(create.name).toBe(name);
      });
    });
  });

  describe("WatchlistItemCreate interface", () => {
    describe("when providing valid data", () => {
      it("should accept complete item creation data", () => {
        // Arrange
        const itemCreate = createWatchlistItemCreate();

        // Assert
        expect(itemCreate.watchlist_id).toBe(WATCHLIST_DOMAIN.IDS.TEST);
        expect(itemCreate.instrument_id).toBe(WATCHLIST_DOMAIN.IDS.INSTRUMENT);
      });
    });

    describe("when linking instruments", () => {
      it("should link instrument to watchlist", () => {
        const watchlistId = "WL001";
        const instrumentId = "INST_AAPL";

        const itemCreate = createWatchlistItemCreate({
          watchlist_id: watchlistId,
          instrument_id: instrumentId,
        });

        expect(itemCreate.watchlist_id).toBe(watchlistId);
        expect(itemCreate.instrument_id).toBe(instrumentId);
      });
    });
  });
});
