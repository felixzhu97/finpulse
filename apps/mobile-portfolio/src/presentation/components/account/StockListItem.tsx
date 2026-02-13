import { memo } from "react";
import type { Holding } from "@/src/core/domain/entities/portfolio";
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

interface StockListItemProps {
  holding: Holding;
  price: number;
  change: number;
  historyValues?: number[];
  onPress?: () => void;
}

export const StockListItem = memo(function StockListItem({
  holding,
  price,
  change,
  historyValues,
  onPress,
}: StockListItemProps) {
  const { isUp, trend, changeColor, changePercent } = getStockChangeInfo(change, price);

  return (
    <ListRowPressable onPress={onPress}>
      <ListRowLeft>
        <RowTitle numberOfLines={1}>{holding.symbol}</RowTitle>
        <RowSubtitle numberOfLines={1}>{holding.name}</RowSubtitle>
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
});
