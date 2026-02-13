import type { WatchlistItem } from "@/src/features/watchlist/entities/watchlist";
import type { Instrument } from "@/src/features/core/entities/instrument";
import type { StockDetailItem } from "./StockDetailDrawer";
import { WatchlistItemRow } from "./WatchlistItemRow";
import styled from "styled-components/native";

interface WatchlistCardProps {
  title: string;
  items: WatchlistItem[];
  instruments: Instrument[];
  quotes: Record<string, { price: number; change: number }>;
  historyBySymbol?: Record<string, number[]>;
  onItemPress?: (item: StockDetailItem) => void;
}

function getSymbolForInstrument(instruments: Instrument[], instrumentId: string): string {
  const inst = instruments.find((i) => i.instrument_id === instrumentId);
  return inst?.symbol ?? instrumentId.slice(0, 8);
}

function getNameForInstrument(instruments: Instrument[], instrumentId: string): string | null {
  const inst = instruments.find((i) => i.instrument_id === instrumentId);
  return inst?.name ?? null;
}

const Card = styled.View`
  background-color: rgba(255,255,255,0.03);
  border-radius: 0;
  margin-bottom: 0;
  overflow: hidden;
  border-width: 0;
`;

const Title = styled.Text`
  font-size: 13px;
  font-weight: 600;
  color: rgba(255,255,255,0.6);
  padding-horizontal: 16px;
  padding-top: 20px;
  padding-bottom: 8px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

const Empty = styled.Text`
  font-size: 15px;
  color: rgba(255,255,255,0.4);
  padding: 20px;
  text-align: center;
`;

export function WatchlistCard({
  title,
  items,
  instruments,
  quotes,
  historyBySymbol,
  onItemPress,
}: WatchlistCardProps) {
  return (
    <Card>
      <Title>{title}</Title>
      {items.length === 0 ? (
        <Empty>No symbols added yet.</Empty>
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
    </Card>
  );
}
