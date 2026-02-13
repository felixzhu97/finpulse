import { useState } from "react";
import { ActivityIndicator, ScrollView, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import styled from "styled-components/native";
import type { Account } from "@/src/types";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { useAccountData } from "@/src/hooks";
import { SettingsDrawer } from "@/src/components/account/SettingsDrawer";
import { RegisterCustomerDrawer } from "@/src/components/account/RegisterCustomerDrawer";
import { NewPaymentDrawer } from "@/src/components/account/NewPaymentDrawer";
import { NewTradeDrawer } from "@/src/components/account/NewTradeDrawer";
import { BlockchainBalanceCard, BlockchainTransferDrawer } from "@/src/components/blockchain";
import { formatBalance } from "@/src/lib/utils";
import { useTheme } from "@/src/styles";
import { useTranslation } from "@/src/lib/i18n";
import { CardBordered } from "@/src/styles/primitives";

const ACCOUNT_CARD_PADDING = 20;

const StyledSafeArea = styled(SafeAreaView)`
  flex: 1;
  background-color: ${(p) => p.theme.colors.background};
`;

const StyledScrollView = styled(ScrollView)`
  flex: 1;
`;

const Section = styled.View`
  margin-bottom: 28px;
  padding-horizontal: 16px;
`;

const SectionHeader = styled.View`
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
  padding-horizontal: 4px;
`;

const SectionTitle = styled.Text`
  font-size: 20px;
  font-weight: 600;
  letter-spacing: -0.4px;
  color: ${(p) => p.theme.colors.text};
`;

const TotalBalance = styled.Text`
  font-size: 20px;
  font-weight: 600;
  letter-spacing: -0.4px;
  color: ${(p) => p.theme.colors.text};
`;

const CategorySection = styled.View`
  margin-bottom: 24px;
`;

const CategoryTitle = styled.Text`
  font-size: 13px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 8px;
  padding-horizontal: 4px;
  color: ${(p) => p.theme.colors.textSecondary};
`;

const UserHeader = styled.View`
  flex-direction: row;
  align-items: center;
  padding-bottom: 16px;
`;

const Avatar = styled.View`
  width: 52px;
  height: 52px;
  border-radius: 26px;
  align-items: center;
  justify-content: center;
  margin-right: 14px;
  background-color: ${(p) => p.theme.colors.surface};
`;

const UserInfo = styled.View`
  flex: 1;
  min-width: 0;
`;

const UserName = styled.Text`
  font-size: 19px;
  font-weight: 600;
  margin-bottom: 5px;
  letter-spacing: -0.4px;
  color: ${(p) => p.theme.colors.text};
`;

const UserEmail = styled.Text`
  font-size: 14px;
  font-weight: 400;
  letter-spacing: -0.2px;
  line-height: 20px;
  color: ${(p) => p.theme.colors.textSecondary};
`;

const UserDetailRow = styled.View`
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  padding-vertical: 16px;
  border-top-width: 1px;
  border-top-color: ${(p) => p.theme.colors.border};
`;

const UserDetailLabel = styled.Text`
  font-size: 14px;
  font-weight: 400;
  letter-spacing: -0.2px;
  color: ${(p) => p.theme.colors.textSecondary};
`;

const UserDetailValue = styled.Text`
  font-size: 14px;
  font-weight: 500;
  letter-spacing: -0.2px;
  color: ${(p) => p.theme.colors.textSecondary};
`;

const AccountRow = styled(TouchableOpacity)`
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  min-height: 60px;
`;

const AccountLeft = styled.View`
  flex-direction: row;
  align-items: center;
  flex: 1;
  margin-right: 12px;
`;

const AccountIcon = styled.View`
  width: 32px;
  height: 32px;
  border-radius: 8px;
  align-items: center;
  justify-content: center;
  margin-right: 12px;
  background-color: ${(p) => p.theme.colors.surface};
`;

const AccountInfo = styled.View`
  flex: 1;
  min-width: 0;
`;

const AccountName = styled.Text`
  font-size: 16px;
  font-weight: 500;
  margin-bottom: 3px;
  letter-spacing: -0.3px;
  color: ${(p) => p.theme.colors.text};
`;

const AccountType = styled.Text`
  font-size: 13px;
  letter-spacing: -0.2px;
  color: ${(p) => p.theme.colors.textSecondary};
`;

const AccountRight = styled.View`
  align-items: flex-end;
`;

const AccountBalance = styled.Text`
  font-size: 16px;
  font-weight: 600;
  margin-bottom: 3px;
  letter-spacing: -0.3px;
  color: ${(p) => p.theme.colors.text};
`;

const AccountChange = styled.Text<{ positive: boolean }>`
  font-size: 13px;
  font-weight: 500;
  letter-spacing: -0.2px;
  color: ${(p) => (p.positive ? p.theme.colors.success : p.theme.colors.error)};
`;

const Separator = styled.View<{ indent?: number }>`
  height: 1px;
  margin-left: ${(p) => p.indent ?? 60}px;
  background-color: ${(p) => p.theme.colors.border};
`;

const ActionRow = styled(TouchableOpacity)`
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  min-height: 52px;
`;

const ActionLeft = styled.View`
  flex-direction: row;
  align-items: center;
  gap: 12px;
`;

const ActionText = styled.Text`
  font-size: 16px;
  font-weight: 400;
  letter-spacing: -0.3px;
  color: ${(p) => p.theme.colors.text};
`;

const LoadingWrap = styled.View`
  flex: 1;
  min-height: 400px;
  align-items: center;
  justify-content: center;
  padding-vertical: 60px;
`;

const CenteredWrap = styled.View`
  flex: 1;
  min-height: 300px;
  align-items: center;
  justify-content: center;
  padding-vertical: 40px;
`;

const ErrorText = styled.Text`
  text-align: center;
  font-size: 15px;
  margin-bottom: 16px;
  padding-horizontal: 32px;
  color: ${(p) => p.theme.colors.error};
`;

const RetryButton = styled(TouchableOpacity)`
  padding-horizontal: 24px;
  padding-vertical: 12px;
  border-radius: 10px;
  background-color: ${(p) => p.theme.colors.primary};
`;

const RetryButtonText = styled.Text`
  color: #fff;
  font-size: 15px;
  font-weight: 600;
`;

const AccountItemWrap = styled.View``;

function getAccountTypeLabel(type: Account["type"], t: (key: string) => string) {
  switch (type) {
    case "brokerage":
      return t("account.accountTypes.brokerage");
    case "saving":
      return t("account.accountTypes.saving");
    case "checking":
      return t("account.accountTypes.checking");
    case "creditCard":
      return t("account.accountTypes.creditCard");
    case "cash":
      return t("account.accountTypes.cash");
    default:
      return t("account.accountTypes.account");
  }
}

export default function AccountScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const { t } = useTranslation();
  const { customer, accounts, accountResources, loading, error, refresh } = useAccountData();
  const [settingsVisible, setSettingsVisible] = useState(false);
  const [registerVisible, setRegisterVisible] = useState(false);
  const [paymentVisible, setPaymentVisible] = useState(false);
  const [tradeVisible, setTradeVisible] = useState(false);
  const [blockchainTransferVisible, setBlockchainTransferVisible] = useState(false);

  const totalBalance = accounts.reduce((sum, acc) => sum + acc.balance, 0);

  const groupedAccounts = accounts.reduce((groups, account) => {
    const type = account.type;
    if (!groups[type]) {
      groups[type] = [];
    }
    groups[type].push(account);
    return groups;
  }, {} as Record<Account["type"], Account[]>);

  const accountTypeOrder: Account["type"][] = ["brokerage", "saving", "checking", "cash", "creditCard"];

  const showLoading = loading && !customer && accounts.length === 0;

  return (
    <StyledSafeArea edges={["top"]}>
      <StyledScrollView
        contentContainerStyle={{ paddingTop: 12, paddingBottom: 40 }}
      >
        {showLoading ? (
          <LoadingWrap>
            <ActivityIndicator size="small" color={colors.textSecondary} />
          </LoadingWrap>
        ) : error && !customer && accounts.length === 0 ? (
          <CenteredWrap>
            <ErrorText>{t("account.unableToLoad")}</ErrorText>
            <RetryButton onPress={refresh}>
              <RetryButtonText>{t("common.retry")}</RetryButtonText>
            </RetryButton>
          </CenteredWrap>
        ) : (
          <>
            {customer && (
              <Section>
                <CardBordered style={{ overflow: "hidden", padding: ACCOUNT_CARD_PADDING }}>
                  <UserHeader>
                    <Avatar>
                      <MaterialIcons name="person" size={24} color={colors.text} />
                    </Avatar>
                    <UserInfo>
                      <UserName>{customer.name}</UserName>
                      {customer.email && <UserEmail>{customer.email}</UserEmail>}
                    </UserInfo>
                  </UserHeader>
                  {customer.kyc_status && (
                    <UserDetailRow>
                      <UserDetailLabel>{t("account.kycStatus")}</UserDetailLabel>
                      <UserDetailValue>{customer.kyc_status}</UserDetailValue>
                    </UserDetailRow>
                  )}
                  {customer.ai_identity_score != null && (
                    <UserDetailRow>
                      <UserDetailLabel>{t("account.aiIdentityScore")}</UserDetailLabel>
                      <UserDetailValue>{(customer.ai_identity_score * 100).toFixed(0)}%</UserDetailValue>
                    </UserDetailRow>
                  )}
                </CardBordered>
              </Section>
            )}

            {accounts.length > 0 && (
              <Section>
                <SectionHeader>
                  <SectionTitle>{t("account.accounts")}</SectionTitle>
                  <TotalBalance>{formatBalance(totalBalance)}</TotalBalance>
                </SectionHeader>
                {accountTypeOrder.map((type) => {
                  const typeAccounts = groupedAccounts[type] || [];
                  if (typeAccounts.length === 0) return null;

                  const getAccountUuid = (account: Account, index: number): string => {
                    const accountTypeMap: Record<string, string[]> = {
                      brokerage: ["brokerage"],
                      saving: ["saving", "cash"],
                      checking: ["checking", "cash"],
                      creditCard: ["creditCard", "cash"],
                      cash: ["cash", "saving"],
                    };
                    const possibleTypes = accountTypeMap[account.type] || [account.type];
                    let accountResource = accountResources.find(
                      (ar) => possibleTypes.includes(ar.account_type)
                    );
                    if (!accountResource && accountResources.length > index) {
                      accountResource = accountResources[index];
                    }
                    return accountResource?.account_id || account.id;
                  };

                  return (
                    <CategorySection key={type}>
                      <CategoryTitle>{getAccountTypeLabel(type, t)}</CategoryTitle>
                      {typeAccounts.map((account, accountIndex) => {
                        const accountIdToUse = getAccountUuid(account, accountIndex);
                        return (
                          <BlockchainBalanceCard
                            key={`blockchain-${account.id}`}
                            accountId={accountIdToUse}
                            currency="SIM_COIN"
                          />
                        );
                      })}
                      <CardBordered style={{ overflow: "hidden", padding: ACCOUNT_CARD_PADDING }}>
                        {typeAccounts.map((account, accountIndex) => (
                            <AccountItemWrap key={account.id}>
                              <AccountRow activeOpacity={0.7}>
                                <AccountLeft>
                                  <AccountIcon>
                                    <MaterialIcons
                                      name="account-balance-wallet"
                                      size={20}
                                      color={colors.text}
                                    />
                                  </AccountIcon>
                                  <AccountInfo>
                                    <AccountName>{account.name}</AccountName>
                                    <AccountType>{getAccountTypeLabel(account.type, t)}</AccountType>
                                  </AccountInfo>
                                </AccountLeft>
                                <AccountRight>
                                  <AccountBalance>{formatBalance(account.balance)}</AccountBalance>
                                  {account.todayChange !== 0 && (
                                    <AccountChange positive={account.todayChange > 0}>
                                      {account.todayChange > 0 ? "+" : ""}
                                      {formatBalance(account.todayChange)}
                                    </AccountChange>
                                  )}
                                </AccountRight>
                              </AccountRow>
                              {accountIndex < typeAccounts.length - 1 && <Separator indent={60} />}
                            </AccountItemWrap>
                          ))}
                      </CardBordered>
                    </CategorySection>
                  );
                })}
              </Section>
            )}

            <Section>
              <SectionHeader>
                <SectionTitle>{t("account.actions")}</SectionTitle>
              </SectionHeader>
              <CardBordered style={{ overflow: "hidden", padding: ACCOUNT_CARD_PADDING }}>
                <ActionRow onPress={() => setRegisterVisible(true)} activeOpacity={0.7}>
                  <ActionLeft>
                    <MaterialIcons name="person-add" size={20} color={colors.text} />
                    <ActionText>{t("account.register")}</ActionText>
                  </ActionLeft>
                  <MaterialIcons name="chevron-right" size={18} color={colors.textTertiary} />
                </ActionRow>
                <Separator indent={52} />
                <ActionRow onPress={() => setPaymentVisible(true)} activeOpacity={0.7}>
                  <ActionLeft>
                    <MaterialIcons name="payment" size={20} color={colors.text} />
                    <ActionText>{t("account.newPayment")}</ActionText>
                  </ActionLeft>
                  <MaterialIcons name="chevron-right" size={18} color={colors.textTertiary} />
                </ActionRow>
                <Separator indent={52} />
                <ActionRow onPress={() => setTradeVisible(true)} activeOpacity={0.7}>
                  <ActionLeft>
                    <MaterialIcons name="trending-up" size={20} color={colors.text} />
                    <ActionText>{t("account.newTrade")}</ActionText>
                  </ActionLeft>
                  <MaterialIcons name="chevron-right" size={18} color={colors.textTertiary} />
                </ActionRow>
                <Separator indent={52} />
                <ActionRow onPress={() => setBlockchainTransferVisible(true)} activeOpacity={0.7}>
                  <ActionLeft>
                    <MaterialIcons name="swap-horiz" size={20} color={colors.text} />
                    <ActionText>{t("blockchain.transfer")}</ActionText>
                  </ActionLeft>
                  <MaterialIcons name="chevron-right" size={18} color={colors.textTertiary} />
                </ActionRow>
                <Separator indent={52} />
                <ActionRow onPress={() => setSettingsVisible(true)} activeOpacity={0.7}>
                  <ActionLeft>
                    <MaterialIcons name="settings" size={20} color={colors.text} />
                    <ActionText>{t("account.settings")}</ActionText>
                  </ActionLeft>
                  <MaterialIcons name="chevron-right" size={18} color={colors.textTertiary} />
                </ActionRow>
                {__DEV__ && (
                  <>
                    <Separator indent={52} />
                    <ActionRow onPress={() => router.push("/storybook")} activeOpacity={0.7}>
                      <ActionLeft>
                        <MaterialIcons name="developer-mode" size={20} color={colors.text} />
                        <ActionText>Storybook</ActionText>
                      </ActionLeft>
                      <MaterialIcons name="chevron-right" size={18} color={colors.textTertiary} />
                    </ActionRow>
                  </>
                )}
              </CardBordered>
            </Section>
          </>
        )}
      </StyledScrollView>

      <SettingsDrawer
        visible={settingsVisible}
        onClose={() => setSettingsVisible(false)}
      />
      <RegisterCustomerDrawer
        visible={registerVisible}
        onClose={() => setRegisterVisible(false)}
        onSuccess={refresh}
      />
      <NewPaymentDrawer
        visible={paymentVisible}
        onClose={() => setPaymentVisible(false)}
      />
      <NewTradeDrawer
        visible={tradeVisible}
        onClose={() => setTradeVisible(false)}
      />
      <BlockchainTransferDrawer
        visible={blockchainTransferVisible}
        onClose={() => setBlockchainTransferVisible(false)}
        accounts={accounts}
        accountResources={accountResources}
      />
    </StyledSafeArea>
  );
}
