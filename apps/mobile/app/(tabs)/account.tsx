import { useState } from "react";
import { ActivityIndicator, ScrollView, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import styled from "@emotion/native";
import type { Account } from "@/src/domain/entities";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { useAccountData, useAuth } from "@/src/presentation/hooks";
import { SettingsDrawer } from "@/src/presentation/components/account/SettingsDrawer";
import { RegisterCustomerDrawer } from "@/src/presentation/components/account/RegisterCustomerDrawer";
import { NewPaymentDrawer } from "@/src/presentation/components/account/NewPaymentDrawer";
import { NewTradeDrawer } from "@/src/presentation/components/account/NewTradeDrawer";
import { WalletConnectButton, EthTransferDrawer } from "@/src/presentation/components/blockchain";
import { useWeb3, SEPOLIA_CHAIN_ID } from "@/src/presentation/hooks";
import { formatBalance } from "@/src/presentation/utils";
import { useTheme } from "@/src/presentation/theme";
import { useTranslation } from "@/src/presentation/i18n";
import {
  CardBordered,
  CenteredContainer,
  LoadingWrap,
  RetryButton,
  RetryButtonText,
  SectionTitle,
} from "@/src/presentation/theme/primitives";

const ACCOUNT_CARD_PADDING = 20;
const ACCOUNT_CARD_RADIUS = 16;
const ACTION_INDENT = 56; // icon 20 + gap 14 + text start

const StyledSafeArea = styled(SafeAreaView)`
  flex: 1;
  background-color: ${(p) => p.theme.colors.background};
`;

const StyledScrollView = styled(ScrollView)`
  flex: 1;
`;

const Section = styled.View`
  margin-bottom: 32px;
  padding-horizontal: 16px;
`;

const SectionHeader = styled.View`
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
  padding-horizontal: 4px;
`;

const TotalBalance = styled.Text`
  font-size: 22px;
  font-weight: 700;
  letter-spacing: -0.5px;
  color: ${(p) => p.theme.colors.text};
`;

const CategorySection = styled.View`
  margin-bottom: 28px;
`;

const CategoryTitle = styled.Text`
  font-size: 13px;
  font-weight: 600;
  letter-spacing: 0.02px;
  margin-bottom: 10px;
  padding-horizontal: 4px;
  color: ${(p) => p.theme.colors.textSecondary};
`;

const UserHeader = styled.View`
  flex-direction: row;
  align-items: center;
  padding-bottom: 20px;
`;

const Avatar = styled.View`
  width: 56px;
  height: 56px;
  border-radius: 28px;
  align-items: center;
  justify-content: center;
  margin-right: 16px;
  background-color: ${(p) => p.theme.colors.surface};
  border-width: 1px;
  border-color: ${(p) => p.theme.colors.border};
`;

const UserInfo = styled.View`
  flex: 1;
  min-width: 0;
`;

const UserName = styled.Text`
  font-size: 20px;
  font-weight: 600;
  margin-bottom: 4px;
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
  padding-vertical: 14px;
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
  color: ${(p) => p.theme.colors.text};
`;

const AccountRow = styled(TouchableOpacity)`
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  min-height: 56px;
`;

const AccountLeft = styled.View`
  flex-direction: row;
  align-items: center;
  flex: 1;
  margin-right: 12px;
`;

const AccountIcon = styled.View`
  width: 36px;
  height: 36px;
  border-radius: 10px;
  align-items: center;
  justify-content: center;
  margin-right: 14px;
  background-color: ${(p) => p.theme.colors.surface};
`;

const AccountInfo = styled.View`
  flex: 1;
  min-width: 0;
`;

const AccountName = styled.Text`
  font-size: 16px;
  font-weight: 500;
  margin-bottom: 2px;
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
  font-size: 17px;
  font-weight: 600;
  margin-bottom: 2px;
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
  margin-left: ${(p) => p.indent ?? ACTION_INDENT}px;
  background-color: ${(p) => p.theme.colors.border};
`;

const ActionRow = styled(TouchableOpacity)`
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  min-height: 56px;
`;

const ActionLeft = styled.View`
  flex-direction: row;
  align-items: center;
  gap: 14px;
`;

const ActionText = styled.Text`
  font-size: 16px;
  font-weight: 500;
  letter-spacing: -0.3px;
  color: ${(p) => p.theme.colors.text};
`;

const AccountErrorText = styled.Text`
  text-align: center;
  font-size: 15px;
  margin-bottom: 16px;
  padding-horizontal: 32px;
  color: ${(p) => p.theme.colors.error};
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
  const { isAuthenticated } = useAuth();
  const [settingsVisible, setSettingsVisible] = useState(false);
  const [registerVisible, setRegisterVisible] = useState(false);
  const [paymentVisible, setPaymentVisible] = useState(false);
  const [tradeVisible, setTradeVisible] = useState(false);
  const [tradePrefillDefaults, setTradePrefillDefaults] = useState(false);
  const [ethTransferVisible, setEthTransferVisible] = useState(false);
  const { walletInfo } = useWeb3();

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
        contentContainerStyle={{ paddingTop: 16, paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
      >
        {showLoading ? (
          <LoadingWrap>
            <ActivityIndicator size="small" color={colors.textSecondary} />
          </LoadingWrap>
        ) : error && !customer && accounts.length === 0 ? (
          <CenteredContainer>
            <AccountErrorText>{t("account.unableToLoad")}</AccountErrorText>
            <RetryButton onPress={refresh}>
              <RetryButtonText>{t("common.retry")}</RetryButtonText>
            </RetryButton>
          </CenteredContainer>
        ) : (
          <>
            {customer && (
              <Section>
                <CardBordered style={{ overflow: "hidden", padding: ACCOUNT_CARD_PADDING, borderRadius: ACCOUNT_CARD_RADIUS }}>
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

                  return (
                    <CategorySection key={type}>
                      <CategoryTitle>{getAccountTypeLabel(type, t)}</CategoryTitle>
                      <CardBordered style={{ overflow: "hidden", padding: ACCOUNT_CARD_PADDING, borderRadius: ACCOUNT_CARD_RADIUS }}>
                        {typeAccounts.map((account, accountIndex) => (
                            <AccountItemWrap key={account.id}>
                              <AccountRow activeOpacity={0.7}>
                                <AccountLeft>
                                  <AccountIcon>
                                    <MaterialIcons
                                      name="account-balance-wallet"
                                      size={22}
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
                              {accountIndex < typeAccounts.length - 1 && <Separator indent={ACTION_INDENT} />}
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
                <SectionTitle>{walletInfo?.isConnected ? t("blockchain.wallet") : t("blockchain.connectWallet")}</SectionTitle>
              </SectionHeader>
              <CardBordered style={{ overflow: "hidden", padding: ACCOUNT_CARD_PADDING, borderRadius: ACCOUNT_CARD_RADIUS }}>
                <WalletConnectButton />
              </CardBordered>
            </Section>

            <Section>
              <SectionHeader>
                <SectionTitle>{t("account.actions")}</SectionTitle>
              </SectionHeader>
              <CardBordered style={{ overflow: "hidden", padding: ACCOUNT_CARD_PADDING, borderRadius: ACCOUNT_CARD_RADIUS }}>
                {!isAuthenticated && (
                <>
                  <ActionRow onPress={() => setRegisterVisible(true)} activeOpacity={0.7}>
                    <ActionLeft>
                      <MaterialIcons name="person-add" size={22} color={colors.text} />
                      <ActionText>{t("account.register")}</ActionText>
                    </ActionLeft>
                        <MaterialIcons name="chevron-right" size={20} color={colors.textTertiary} />
                  </ActionRow>
                  <Separator />
                </>
                )}
                <ActionRow onPress={() => setPaymentVisible(true)} activeOpacity={0.7}>
                  <ActionLeft>
                    <MaterialIcons name="payment" size={22} color={colors.text} />
                    <ActionText>{t("account.newPayment")}</ActionText>
                  </ActionLeft>
                  <MaterialIcons name="chevron-right" size={20} color={colors.textTertiary} />
                </ActionRow>
                <Separator />
                <ActionRow onPress={() => { setTradePrefillDefaults(false); setTradeVisible(true); }} activeOpacity={0.7}>
                  <ActionLeft>
                    <MaterialIcons name="trending-up" size={22} color={colors.text} />
                    <ActionText>{t("account.newTrade")}</ActionText>
                  </ActionLeft>
                  <MaterialIcons name="chevron-right" size={20} color={colors.textTertiary} />
                </ActionRow>
                <Separator />
                <ActionRow onPress={() => { setTradePrefillDefaults(true); setTradeVisible(true); }} activeOpacity={0.7}>
                  <ActionLeft>
                    <MaterialIcons name="flash-on" size={22} color={colors.text} />
                    <ActionText>{t("account.quickTrade")}</ActionText>
                  </ActionLeft>
                  <MaterialIcons name="chevron-right" size={20} color={colors.textTertiary} />
                </ActionRow>
                <Separator />
                <ActionRow onPress={() => setEthTransferVisible(true)} activeOpacity={0.7}>
                  <ActionLeft>
                    <MaterialIcons name="send" size={22} color={colors.text} />
                    <ActionText>{t("blockchain.sendEth")}</ActionText>
                  </ActionLeft>
                  <MaterialIcons name="chevron-right" size={20} color={colors.textTertiary} />
                </ActionRow>
                <Separator />
                <ActionRow onPress={() => setSettingsVisible(true)} activeOpacity={0.7}>
                  <ActionLeft>
                    <MaterialIcons name="settings" size={22} color={colors.text} />
                    <ActionText>{t("account.settings")}</ActionText>
                  </ActionLeft>
                  <MaterialIcons name="chevron-right" size={20} color={colors.textTertiary} />
                </ActionRow>
                {__DEV__ && (
                  <>
                    <Separator />
                    <ActionRow onPress={() => router.push("/storybook")} activeOpacity={0.7}>
                      <ActionLeft>
                        <MaterialIcons name="developer-mode" size={22} color={colors.text} />
                        <ActionText>Storybook</ActionText>
                      </ActionLeft>
                        <MaterialIcons name="chevron-right" size={20} color={colors.textTertiary} />
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
        prefillDefaults={tradePrefillDefaults}
      />
      <EthTransferDrawer
        visible={ethTransferVisible}
        onClose={() => setEthTransferVisible(false)}
      />
    </StyledSafeArea>
  );
}
