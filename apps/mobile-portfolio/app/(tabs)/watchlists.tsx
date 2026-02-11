import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { useCallback, useMemo, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useWatchlists } from "@/src/hooks";
import { useSymbolDisplayData } from "@/src/hooks/useSymbolDisplayData";
import {
  WatchlistCard,
  AddSymbolModal,
  StockDetailDrawer,
  type StockDetailItem,
} from "@/src/components/watchlist";
import type { WatchlistContext } from "@/src/components/watchlist/StockDetailDrawer";
import type { Instrument } from "@/src/types";

function getSymbolsFromItems(
  items: { instrument_id: string }[],
  instruments: Instrument[]
): string[] {
  const symbols: string[] = [];
  for (const item of items) {
    const inst = instruments.find((i) => i.instrument_id === item.instrument_id);
    if (inst?.symbol) symbols.push(inst.symbol.toUpperCase());
  }
  return [...new Set(symbols)];
}

export default function WatchlistsScreen() {
  const {
    watchlists,
    instruments,
    loading,
    error,
    refresh,
    addItem,
    removeItem,
    createWatchlist,
  } = useWatchlists();
  const [refreshing, setRefreshing] = useState(false);
  const [addModalWatchlistId, setAddModalWatchlistId] = useState<string | null>(
    null
  );
  const [newListName, setNewListName] = useState("");
  const [showCreate, setShowCreate] = useState(false);
  const [detailItem, setDetailItem] = useState<StockDetailItem | null>(null);

  const allSymbols = useMemo(
    () =>
      watchlists.flatMap((w) =>
        getSymbolsFromItems(w.items, instruments)
      ),
    [watchlists, instruments]
  );
  const symbols = useMemo(
    () =>
      Array.from(
        new Set([
          ...allSymbols,
          ...(detailItem ? [detailItem.symbol] : []),
        ])
      ),
    [allSymbols, detailItem?.symbol]
  );
  const { quoteMap, historyBySymbol, bySymbol } = useSymbolDisplayData(symbols);

  const watchlistContext = useMemo((): WatchlistContext | null => {
    if (!detailItem || !instruments.length) return null;
    const instrument = instruments.find(
      (i) => i.symbol.toUpperCase() === detailItem!.symbol.toUpperCase()
    );
    if (!instrument) return null;
    const memberships: { watchlistItemId: string; watchlistName: string }[] = [];
    const listIdsWithSymbol = new Set<string>();
    for (const w of watchlists) {
      for (const item of w.items) {
        if (item.instrument_id === instrument.instrument_id) {
          memberships.push({
            watchlistItemId: item.watchlist_item_id,
            watchlistName: w.watchlist.name,
          });
          listIdsWithSymbol.add(w.watchlist.watchlist_id);
        }
      }
    }
    const watchlistOptions = watchlists
      .filter((w) => !listIdsWithSymbol.has(w.watchlist.watchlist_id))
      .map((w) => ({ watchlist_id: w.watchlist.watchlist_id, name: w.watchlist.name }));

    return {
      memberships,
      watchlistOptions,
      onAdd: (watchlistId: string) => {
        addItem(watchlistId, instrument.instrument_id);
      },
      onRemove: (watchlistItemId: string) => {
        removeItem(watchlistItemId);
      },
    };
  }, [detailItem, instruments, watchlists, addItem, removeItem]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await refresh();
    setRefreshing(false);
  }, [refresh]);

  const handleAddSymbol = useCallback(
    async (instrumentId: string) => {
      if (!addModalWatchlistId) return;
      await addItem(addModalWatchlistId, instrumentId);
      setAddModalWatchlistId(null);
    },
    [addModalWatchlistId, addItem]
  );

  const handleCreateWatchlist = useCallback(async () => {
    const name = newListName.trim() || "My list";
    const created = await createWatchlist(name);
    if (created) {
      setNewListName("");
      setShowCreate(false);
    }
  }, [newListName, createWatchlist]);

  if (loading && watchlists.length === 0) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#0A84FF" />
        <Text style={styles.loadingText}>Loading watchlists...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>
          Unable to load watchlists. Start the backend and try again.
        </Text>
        <Pressable style={styles.retryBtn} onPress={onRefresh}>
          <Text style={styles.retryText}>Retry</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={styles.screen}>
      <View style={styles.header}>
        <Text style={styles.title}>Watchlists</Text>
        <Pressable
          style={styles.iconButton}
          onPress={() => setShowCreate(true)}
        >
          <MaterialIcons name="add" size={24} color="#fff" />
        </Pressable>
      </View>
      <FlatList
        data={watchlists}
        keyExtractor={(item) => item.watchlist.watchlist_id}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#fff"
          />
        }
        renderItem={({ item }) => (
          <View style={styles.cardWrap}>
            <WatchlistCard
              title={item.watchlist.name}
              items={item.items}
              instruments={instruments}
              quotes={quoteMap}
              historyBySymbol={historyBySymbol}
              onItemPress={setDetailItem}
            />
            <Pressable
              style={styles.addSymbolBtn}
              onPress={() => setAddModalWatchlistId(item.watchlist.watchlist_id)}
            >
              <MaterialIcons name="add-circle-outline" size={22} color="#0A84FF" />
              <Text style={styles.addSymbolText}>Add symbol</Text>
            </Pressable>
          </View>
        )}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyText}>No watchlists yet.</Text>
            <Text style={styles.emptySub}>
              Create one with the + button, or start the backend and seed data.
            </Text>
          </View>
        }
      />
      <AddSymbolModal
        visible={addModalWatchlistId !== null}
        instruments={instruments}
        onSelect={handleAddSymbol}
        onClose={() => setAddModalWatchlistId(null)}
      />
      <StockDetailDrawer
        visible={detailItem !== null}
        item={detailItem}
        onClose={() => setDetailItem(null)}
        displayData={
          detailItem
            ? bySymbol[detailItem.symbol.toUpperCase()] ?? null
            : null
        }
        watchlistContext={watchlistContext}
      />
      {showCreate && (
        <View style={styles.createOverlay}>
          <View style={styles.createSheet}>
            <Text style={styles.createTitle}>New watchlist</Text>
            <TextInput
              style={styles.createInput}
              value={newListName}
              onChangeText={setNewListName}
              placeholder="List name"
              placeholderTextColor="rgba(255,255,255,0.4)"
              autoFocus
            />
            <View style={styles.createActions}>
              <Pressable
                style={[styles.createBtn, styles.cancelBtn]}
                onPress={() => {
                  setShowCreate(false);
                  setNewListName("");
                }}
              >
                <Text style={styles.cancelBtnText}>Cancel</Text>
              </Pressable>
              <Pressable
                style={[styles.createBtn, styles.confirmBtn]}
                onPress={handleCreateWatchlist}
              >
                <Text style={styles.confirmBtnText}>Create</Text>
              </Pressable>
            </View>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#000",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 12,
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    color: "#fff",
    letterSpacing: -0.5,
  },
  iconButton: {
    width: 44,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
  },
  listContent: {
    paddingBottom: 40,
  },
  cardWrap: {
    marginBottom: 0,
  },
  addSymbolBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingVertical: 10,
    paddingHorizontal: 16,
  },
  addSymbolText: {
    fontSize: 14,
    color: "#0A84FF",
  },
  centered: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  loadingText: {
    color: "rgba(255,255,255,0.7)",
    marginTop: 12,
  },
  errorText: {
    color: "#f87171",
    textAlign: "center",
  },
  retryBtn: {
    marginTop: 16,
    paddingVertical: 10,
    paddingHorizontal: 20,
    backgroundColor: "rgba(255,255,255,0.1)",
    borderRadius: 10,
  },
  retryText: {
    color: "#fff",
    fontWeight: "600",
  },
  empty: {
    paddingVertical: 40,
    alignItems: "center",
  },
  emptyText: {
    fontSize: 16,
    color: "rgba(255,255,255,0.7)",
  },
  emptySub: {
    fontSize: 13,
    color: "rgba(255,255,255,0.5)",
    marginTop: 8,
    textAlign: "center",
  },
  createOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  createSheet: {
    backgroundColor: "#1a1a1a",
    borderRadius: 16,
    padding: 24,
    width: "100%",
    maxWidth: 340,
  },
  createTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#fff",
    marginBottom: 16,
  },
  createInput: {
    backgroundColor: "rgba(255,255,255,0.08)",
    borderRadius: 10,
    padding: 14,
    fontSize: 16,
    color: "#fff",
    marginBottom: 20,
  },
  createActions: {
    flexDirection: "row",
    gap: 12,
    justifyContent: "flex-end",
  },
  createBtn: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 10,
  },
  cancelBtn: {
    backgroundColor: "rgba(255,255,255,0.1)",
  },
  cancelBtnText: {
    color: "rgba(255,255,255,0.8)",
  },
  confirmBtn: {
    backgroundColor: "#0A84FF",
  },
  confirmBtnText: {
    color: "#fff",
    fontWeight: "600",
  },
});
