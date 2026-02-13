import { memo, useEffect, useState } from "react";
import { ActivityIndicator } from "react-native";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { useBlockchain } from "@/src/shared/hooks/useBlockchain";
import { useTheme } from "@/src/shared/theme";
import { useTranslation } from "@/src/shared/i18n";
import { formatBalance } from "@/src/shared/utils";
import type { BlockchainBalance } from "@/src/features/blockchain/entities/blockchain";
import {
  CardBordered,
  RowTitle,
  RowSubtitle,
} from "@/src/shared/theme/primitives";
import styled from "styled-components/native";

const Header = styled.View`
  flex-direction: row;
  align-items: center;
  margin-bottom: 16px;
`;

const IconContainer = styled.View`
  width: 32px;
  height: 32px;
  border-radius: 8px;
  align-items: center;
  justify-content: center;
  margin-right: 12px;
  background-color: ${(p) => p.theme.colors.surface};
`;

const HeaderText = styled.View`
  flex: 1;
`;

const BalanceContainer = styled.View`
  padding-top: 4px;
`;

const BalanceText = styled.Text`
  font-size: 32px;
  font-weight: 700;
  letter-spacing: -0.8px;
  color: ${(p) => p.theme.colors.text};
`;

const NoBalanceText = styled.Text<{ error?: boolean }>`
  font-size: 15px;
  letter-spacing: -0.2px;
  color: ${(p) => (p.error ? p.theme.colors.error : p.theme.colors.textSecondary)};
`;

const LoadingContainer = styled.View`
  padding-vertical: 20px;
  align-items: center;
`;

interface BlockchainBalanceCardProps {
  accountId: string;
  currency?: string;
}

export const BlockchainBalanceCard = memo(function BlockchainBalanceCard({
  accountId,
  currency = "SIM_COIN",
}: BlockchainBalanceCardProps) {
  const { colors } = useTheme();
  const { t } = useTranslation();
  const { getBalance, loading, error } = useBlockchain();
  const [balance, setBalance] = useState<BlockchainBalance | null>(null);

  useEffect(() => {
    loadBalance();
  }, [accountId, currency]);

  const loadBalance = async () => {
    try {
      const result = await getBalance(accountId, currency);
      setBalance(result);
    } catch (err) {
      setBalance(null);
    }
  };

  return (
    <CardBordered style={{ marginBottom: 12, padding: 20 }}>
      <Header>
        <IconContainer>
          <MaterialIcons name="account-balance-wallet" size={20} color={colors.text} />
        </IconContainer>
        <HeaderText>
          <RowTitle>{t("blockchain.blockchainBalance")}</RowTitle>
          <RowSubtitle>{currency}</RowSubtitle>
        </HeaderText>
      </Header>
      {loading ? (
        <LoadingContainer>
          <ActivityIndicator size="small" color={colors.textSecondary} />
        </LoadingContainer>
      ) : error ? (
        <BalanceContainer>
          <NoBalanceText error>
            {t("blockchain.error")}: {error}
          </NoBalanceText>
        </BalanceContainer>
      ) : balance ? (
        <BalanceContainer>
          <BalanceText>{formatBalance(balance.balance)}</BalanceText>
        </BalanceContainer>
      ) : (
        <BalanceContainer>
          <NoBalanceText>{t("blockchain.noBalance")}</NoBalanceText>
        </BalanceContainer>
      )}
    </CardBordered>
  );
});
