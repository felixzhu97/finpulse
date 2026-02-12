import { StyleSheet, Text, View } from "react-native";
import type { WatchlistItem } from "@/src/domain/entities/watchlist";
import type { Instrument } from "@/src/domain/entities/instrument";
import type { StockDetailItem } from "./StockDetailDrawer";
import { WatchlistItemRow } from "./WatchlistItemRow";

interface WatchlistCardProps {
  title: string;
  items: WatchlistItem[];
  instruments: Instrument[];
  quotes: Record<string, { price: number; change: number }>;
  historyBySymbol?: Record<string, number[]>;
  onItemPress?: (item: StockDetailItem) => void;
}

function getSymbolForInstrument(
  instruments: Instrument[],
  instrumentId: string
): string {
  const inst = instruments.find((i) => i.instrument_id === instrumentId);
  return inst?.symbol ?? instrumentId.slice(0, 8);
}

function getNameForInstrument(
  instruments: Instrument[],
  instrumentId: string
): string | null {
  const inst = instruments.find((i) => i.instrument_id === instrumentId);
  return inst?.name ?? null;
}

export function WatchlistCard({
  title,
  items,
  instruments,
  quotes,
  historyBySymbol,
  onItemPress,
}: WatchlistCardProps) {
  return (
    <View style={styles.card}>
      <Text style={styles.title}>{title}</Text>
      {items.length === 0 ? (
        <Text style={styles.empty}>No symbols added yet.</Text>
      ) : (
        items.map((item) => {
          const symbol = getSymbolForInstrument(instruments, item.instrument_id);
          const name = getNameForInstrument(instruments, item.instrument_id);
          const q = quotes[symbol.toUpperCase()];
          const price = q?.price ?? 0;
          const change = q?.change ?? 0;
          const historyValues = historyBySymbol?.[symbol.toUpperCase()];
          const detailItem: StockDetailItem = {
            symbol,
            name,
            price,
            change,
            historyValues,
          };
          return (
            <WatchlistItemRow
              key={item.watchlist_item_id}
              symbol={symbol}
              name={name}
              price={price}
              change={change}
              historyValues={historyValues}
              onPress={() => onItemPress?.(detailItem)}
            />
          );
        })
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "rgba(255,255,255,0.03)",
    borderRadius: 0,
    marginBottom: 0,
    overflow: "hidden",
    borderWidth: 0,
  },
  title: {
    fontSize: 13,
    fontWeight: "600",
    color: "rgba(255,255,255,0.6)",
    paddingHorizontal: 16,
    paddingTop: 20,
    paddingBottom: 8,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  empty: {
    fontSize: 15,
    color: "rgba(255,255,255,0.4)",
    padding: 20,
    textAlign: "center",
  },
});
