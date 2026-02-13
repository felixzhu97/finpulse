import { memo } from "react";
import type { Account } from "@/src/core/domain/entities/portfolio";
import { formatBalance, formatSigned, getStockChangeInfo } from "@/src/presentation/utils";
import { Sparkline } from "../ui/Sparkline";
import {
  ListRow,
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

interface AccountListItemProps {
  account: Account;
  historyValues?: number[];
}

function getAccountTypeLabel(type: Account["type"]) {
  switch (type) {
    case "brokerage":
      return "Brokerage";
    case "saving":
      return "Saving";
    case "checking":
      return "Checking";
    case "creditCard":
      return "Credit card";
    case "cash":
      return "Cash";
    default:
      return "Account";
  }
}

export const AccountListItem = memo(function AccountListItem({ account, historyValues }: AccountListItemProps) {
  const { isUp, trend, changeColor, changePercent } = getStockChangeInfo(
    account.todayChange,
    account.balance
  );

  return (
    <ListRow>
      <ListRowLeft>
        <RowTitle numberOfLines={1}>{account.name}</RowTitle>
        <RowSubtitle numberOfLines={1}>
          {getAccountTypeLabel(account.type)}
        </RowSubtitle>
      </ListRowLeft>
      <ListRowSparkline>
        <Sparkline data={historyValues} trend={trend} width={80} height={36} />
      </ListRowSparkline>
      <ListRowRight>
        <RowValue>{formatBalance(account.balance)}</RowValue>
        <RowChangeContainer>
          <RowChange color={changeColor}>
            {formatSigned(account.todayChange, 0)}
          </RowChange>
          <RowChangePercent color={changeColor}>
            {isUp ? "+" : ""}{changePercent}%
          </RowChangePercent>
        </RowChangeContainer>
      </ListRowRight>
    </ListRow>
  );
});
