import { formatPrice, formatSigned, getStockChangeInfo } from "@/src/presentation/utils";
import { Sparkline } from "../ui/Sparkline";
import {
  ListRowPressable,
  ListRowLeft,
  ListRowRight,
  ListRowSparkline,
  RowTitle,
  RowSubtitle,
  RowValue,
  RowChangeContainer,
  RowChange,
  RowChangePercent,
} from "@/src/presentation/theme/primitives";

interface WatchlistItemRowProps {
  symbol: string;
  name: string | null;
  price: number;
  change: number;
  historyValues?: number[];
  onPress?: () => void;
}

export function WatchlistItemRow({
  symbol,
  name,
  price,
  change,
  historyValues,
  onPress,
}: WatchlistItemRowProps) {
  const { isUp, trend, changeColor, changePercent } = getStockChangeInfo(change, price);

  return (
    <ListRowPressable onPress={onPress}>
      <ListRowLeft>
        <RowTitle numberOfLines={1}>{symbol}</RowTitle>
        {name ? (
          <RowSubtitle numberOfLines={1}>{name}</RowSubtitle>
        ) : null}
      </ListRowLeft>
      <ListRowSparkline>
        <Sparkline data={historyValues} trend={trend} width={80} height={36} />
      </ListRowSparkline>
      <ListRowRight>
        <RowValue>{formatPrice(price)}</RowValue>
        <RowChangeContainer>
          <RowChange color={changeColor}>{formatSigned(change)}</RowChange>
          <RowChangePercent color={changeColor}>
            {isUp ? "+" : ""}{changePercent}%
          </RowChangePercent>
        </RowChangeContainer>
      </ListRowRight>
    </ListRowPressable>
  );
}
