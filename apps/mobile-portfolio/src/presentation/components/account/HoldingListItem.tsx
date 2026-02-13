import { memo } from "react";
import type { Holding } from "@/src/core/domain/entities/portfolio";
import { formatCurrency, formatSigned, formatSignedPercent } from "@/src/presentation/utils";
import {
  HoldingRow,
  HoldingRowLeft,
  HoldingRowRight,
  HoldingName,
  HoldingMeta,
  HoldingValue,
  HoldingChange,
} from "@/src/presentation/theme/primitives";

interface HoldingListItemProps {
  holding: Holding;
  displayPrice?: number;
  displayMarketValue?: number;
  displayProfit?: number;
  displayProfitRate?: number;
}

export const HoldingListItem = memo(function HoldingListItem({
  holding,
  displayPrice,
  displayMarketValue,
  displayProfit,
  displayProfitRate,
}: HoldingListItemProps) {
  const price = displayPrice ?? holding.price;
  const marketValue = displayMarketValue ?? holding.marketValue;
  const profit = displayProfit ?? holding.profit;
  const profitRate = displayProfitRate ?? holding.profitRate;
  const isPositive = profit >= 0;

  return (
    <HoldingRow>
      <HoldingRowLeft>
        <HoldingName numberOfLines={1}>{holding.name}</HoldingName>
        <HoldingMeta numberOfLines={1}>
          {holding.symbol} · {holding.quantity} shares
        </HoldingMeta>
        <HoldingMeta numberOfLines={1}>
          Price {formatCurrency(price, "USD")}
        </HoldingMeta>
      </HoldingRowLeft>
      <HoldingRowRight>
        <HoldingValue numberOfLines={1}>
          {formatCurrency(marketValue, "USD")}
        </HoldingValue>
        <HoldingChange positive={isPositive} numberOfLines={1}>
          {formatSigned(profit, 0)} · {formatSignedPercent(profitRate)}
        </HoldingChange>
      </HoldingRowRight>
    </HoldingRow>
  );
});
