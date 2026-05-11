import {
  Watchlist,
  WatchlistItem,
  WatchlistCreate,
  WatchlistItemCreate,
} from "../../../domain/entities/watchlist";

describe("Watchlist Entity", () => {
  describe("Watchlist interface", () => {
    it("should accept valid watchlist data", () => {
      const watchlist: Watchlist = {
        watchlist_id: "WL001",
        customer_id: "C001",
        name: "Tech Stocks",
        created_at: "2024-01-15T10:00:00Z",
      };

      expect(watchlist.watchlist_id).toBe("WL001");
      expect(watchlist.customer_id).toBe("C001");
      expect(watchlist.name).toBe("Tech Stocks");
      expect(watchlist.created_at).toBe("2024-01-15T10:00:00Z");
    });

    it("should represent a sector-based watchlist", () => {
      const sectorWatchlist: Watchlist = {
        watchlist_id: "WL_SECTOR",
        customer_id: "C002",
        name: "Healthcare",
        created_at: "2024-01-16T09:00:00Z",
      };

      expect(sectorWatchlist.name).toBe("Healthcare");
    });

    it("should represent a custom watchlist", () => {
      const customWatchlist: Watchlist = {
        watchlist_id: "WL_CUSTOM",
        customer_id: "C003",
        name: "My Favorites",
        created_at: "2024-01-17T08:00:00Z",
      };

      expect(customWatchlist.name).toBe("My Favorites");
    });
  });

  describe("WatchlistItem interface", () => {
    it("should accept valid watchlist item data", () => {
      const item: WatchlistItem = {
        watchlist_item_id: "WI001",
        watchlist_id: "WL001",
        instrument_id: "INST001",
        added_at: "2024-01-15T10:30:00Z",
      };

      expect(item.watchlist_item_id).toBe("WI001");
      expect(item.watchlist_id).toBe("WL001");
      expect(item.instrument_id).toBe("INST001");
      expect(item.added_at).toBe("2024-01-15T10:30:00Z");
    });

    it("should link to parent watchlist", () => {
      const watchlist: Watchlist = {
        watchlist_id: "WL001",
        customer_id: "C001",
        name: "Tech Stocks",
        created_at: "2024-01-15T10:00:00Z",
      };

      const items: WatchlistItem[] = [
        {
          watchlist_item_id: "WI001",
          watchlist_id: watchlist.watchlist_id,
          instrument_id: "INST_AAPL",
          added_at: "2024-01-15T11:00:00Z",
        },
        {
          watchlist_item_id: "WI002",
          watchlist_id: watchlist.watchlist_id,
          instrument_id: "INST_GOOGL",
          added_at: "2024-01-15T11:30:00Z",
        },
      ];

      items.forEach((item) => {
        expect(item.watchlist_id).toBe(watchlist.watchlist_id);
      });
    });
  });

  describe("WatchlistCreate interface", () => {
    it("should accept valid watchlist creation data", () => {
      const watchlistCreate: WatchlistCreate = {
        customer_id: "C001",
        name: "New Watchlist",
      };

      expect(watchlistCreate.customer_id).toBe("C001");
      expect(watchlistCreate.name).toBe("New Watchlist");
    });

    it("should allow empty name for default naming", () => {
      const watchlistCreate: WatchlistCreate = {
        customer_id: "C002",
        name: "",
      };

      expect(watchlistCreate.name).toBe("");
    });
  });

  describe("WatchlistItemCreate interface", () => {
    it("should accept valid watchlist item creation data", () => {
      const itemCreate: WatchlistItemCreate = {
        watchlist_id: "WL001",
        instrument_id: "INST001",
      };

      expect(itemCreate.watchlist_id).toBe("WL001");
      expect(itemCreate.instrument_id).toBe("INST001");
    });

    it("should link instrument to watchlist", () => {
      const watchlistId = "WL001";
      const instrumentId = "INST_AAPL";

      const itemCreate: WatchlistItemCreate = {
        watchlist_id: watchlistId,
        instrument_id: instrumentId,
      };

      expect(itemCreate.watchlist_id).toBe(watchlistId);
      expect(itemCreate.instrument_id).toBe(instrumentId);
    });
  });
});
