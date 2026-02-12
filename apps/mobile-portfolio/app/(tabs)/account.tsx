import { useCallback, useState } from "react";
import { useFocusEffect } from "@react-navigation/native";
import {
  ActivityIndicator,
  InteractionManager,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import type { Account, Customer } from "@/src/domain/entities";
import { container } from "@/src/application";
import type { AccountResource } from "@/src/domain/entities/accountResource";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { SettingsDrawer } from "@/src/presentation/components/account/SettingsDrawer";
import { RegisterCustomerDrawer } from "@/src/presentation/components/account/RegisterCustomerDrawer";
import { NewPaymentDrawer } from "@/src/presentation/components/account/NewPaymentDrawer";
import { NewTradeDrawer } from "@/src/presentation/components/account/NewTradeDrawer";
import { BlockchainBalanceCard, BlockchainTransferDrawer } from "@/src/presentation/components/blockchain";
import { formatBalance } from "@/src/infrastructure/utils";
import { useTheme } from "@/src/presentation/theme";
import { useTranslation } from "@/src/presentation/i18n";

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
  const { colors } = useTheme();
  const { t } = useTranslation();
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [accountResources, setAccountResources] = useState<AccountResource[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [settingsVisible, setSettingsVisible] = useState(false);
  const [registerVisible, setRegisterVisible] = useState(false);
  const [paymentVisible, setPaymentVisible] = useState(false);
  const [tradeVisible, setTradeVisible] = useState(false);
  const [blockchainTransferVisible, setBlockchainTransferVisible] = useState(false);

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(false);
    try {
      const customerUseCase = container.getCustomerUseCase();
      const portfolioUseCase = container.getPortfolioUseCase();
      const customerPromise = customerUseCase.execute();
      const accountsPromise = portfolioUseCase.getAccounts();
      const accountsApi = container.getAccountsApi();
      const accountResourcesPromise = accountsApi.list(100, 0);

      const [customerData, accountList, accountResourcesList] = await Promise.all([
        customerPromise,
        accountsPromise,
        accountResourcesPromise,
      ]);

      const data = { customer: customerData, accounts: accountList ?? [], accountResources: accountResourcesList ?? [] };
      InteractionManager.runAfterInteractions(() => {
        setCustomer(data.customer);
        setAccounts(data.accounts);
        setAccountResources(data.accountResources);
        setLoading(false);
      });
    } catch (e) {
      setError(true);
      InteractionManager.runAfterInteractions(() => setLoading(false));
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [loadData])
  );

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  }, [loadData]);

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
    <SafeAreaView style={[styles.screen, { backgroundColor: colors.background }]} edges={["top"]}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.primary}
          />
        }
      >
        {showLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="small" color={colors.textSecondary} />
          </View>
        ) : error && !customer && accounts.length === 0 ? (
          <View style={styles.centered}>
            <Text style={[styles.errorText, { color: colors.error }]}>
              {t("account.unableToLoad")}
            </Text>
            <TouchableOpacity onPress={onRefresh} style={[styles.retryButton, { backgroundColor: colors.primary }]}>
              <Text style={styles.retryButtonText}>{t("common.retry")}</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <>
            {customer && (
              <View style={styles.section}>
                <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
                  <View style={styles.userHeader}>
                    <View style={[styles.avatar, { backgroundColor: colors.surface }]}>
                      <MaterialIcons
                        name="person"
                        size={24}
                        color={colors.text}
                      />
                    </View>
                    <View style={styles.userInfo}>
                      <Text style={[styles.userName, { color: colors.text }]}>{customer.name}</Text>
                      {customer.email && (
                        <Text style={[styles.userEmail, { color: colors.textSecondary }]}>{customer.email}</Text>
                      )}
                    </View>
                  </View>
                  {customer.kyc_status && (
                    <View style={[styles.userDetailRow, { borderTopColor: colors.border }]}>
                      <Text style={[styles.userDetailLabel, { color: colors.textSecondary }]}>{t("account.kycStatus")}</Text>
                      <Text style={[styles.userDetailValue, { color: colors.text }]}>
                        {customer.kyc_status}
                      </Text>
                    </View>
                  )}
                  {customer.ai_identity_score != null && (
                    <View style={[styles.userDetailRow, { borderTopColor: colors.border }]}>
                      <Text style={[styles.userDetailLabel, { color: colors.textSecondary }]}>{t("account.aiIdentityScore")}</Text>
                      <Text style={[styles.userDetailValue, { color: colors.text }]}>
                        {(customer.ai_identity_score * 100).toFixed(0)}%
                      </Text>
                    </View>
                  )}
                </View>
              </View>
            )}

            {accounts.length > 0 && (
              <View style={styles.section}>
                <View style={styles.sectionHeader}>
                  <Text style={[styles.sectionTitle, { color: colors.text }]}>{t("account.accounts")}</Text>
                  <Text style={[styles.totalBalance, { color: colors.text }]}>
                    {formatBalance(totalBalance)}
                  </Text>
                </View>
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
                    <View key={type} style={styles.categorySection}>
                      <Text style={[styles.categoryTitle, { color: colors.textSecondary }]}>
                        {getAccountTypeLabel(type, t)}
                      </Text>
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
                      <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
                        {typeAccounts.map((account, accountIndex) => {
                          const accountIdToUse = getAccountUuid(account, accountIndex);
                          return (
                            <View key={account.id}>
                              <TouchableOpacity
                                style={styles.accountRow}
                                activeOpacity={0.7}
                              >
                                <View style={styles.accountLeft}>
                                  <View style={[styles.accountIcon, { backgroundColor: colors.surface }]}>
                                    <MaterialIcons
                                      name="account-balance-wallet"
                                      size={20}
                                      color={colors.text}
                                    />
                                  </View>
                                  <View style={styles.accountInfo}>
                                    <Text style={[styles.accountName, { color: colors.text }]}>
                                      {account.name}
                                    </Text>
                                    <Text style={[styles.accountType, { color: colors.textSecondary }]}>
                                      {getAccountTypeLabel(account.type, t)}
                                    </Text>
                                  </View>
                                </View>
                                <View style={styles.accountRight}>
                                  <Text style={[styles.accountBalance, { color: colors.text }]}>
                                    {formatBalance(account.balance)}
                                  </Text>
                                  {account.todayChange !== 0 && (
                                    <Text
                                      style={[
                                        styles.accountChange,
                                        {
                                          color:
                                            account.todayChange > 0
                                              ? colors.success
                                              : colors.error,
                                        },
                                      ]}
                                    >
                                      {account.todayChange > 0 ? "+" : ""}
                                      {formatBalance(account.todayChange)}
                                    </Text>
                                  )}
                                </View>
                              </TouchableOpacity>
                              {accountIndex < typeAccounts.length - 1 && (
                                <View style={[styles.separator, { backgroundColor: colors.border }]} />
                              )}
                            </View>
                          );
                        })}
                      </View>
                    </View>
                  );
                })}
              </View>
            )}

            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={[styles.sectionTitle, { color: colors.text }]}>{t("account.actions")}</Text>
              </View>
              <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
                <TouchableOpacity
                  style={styles.actionRow}
                  onPress={() => setRegisterVisible(true)}
                  activeOpacity={0.7}
                >
                  <View style={styles.settingsLeft}>
                    <MaterialIcons name="person-add" size={20} color={colors.text} />
                    <Text style={[styles.settingsText, { color: colors.text }]}>{t("account.register")}</Text>
                  </View>
                  <MaterialIcons name="chevron-right" size={18} color={colors.textTertiary} />
                </TouchableOpacity>
                <View style={[styles.separator, { backgroundColor: colors.border, marginLeft: 52 }]} />
                <TouchableOpacity
                  style={styles.actionRow}
                  onPress={() => setPaymentVisible(true)}
                  activeOpacity={0.7}
                >
                  <View style={styles.settingsLeft}>
                    <MaterialIcons name="payment" size={20} color={colors.text} />
                    <Text style={[styles.settingsText, { color: colors.text }]}>{t("account.newPayment")}</Text>
                  </View>
                  <MaterialIcons name="chevron-right" size={18} color={colors.textTertiary} />
                </TouchableOpacity>
                <View style={[styles.separator, { backgroundColor: colors.border, marginLeft: 52 }]} />
                <TouchableOpacity
                  style={styles.actionRow}
                  onPress={() => setTradeVisible(true)}
                  activeOpacity={0.7}
                >
                  <View style={styles.settingsLeft}>
                    <MaterialIcons name="trending-up" size={20} color={colors.text} />
                    <Text style={[styles.settingsText, { color: colors.text }]}>{t("account.newTrade")}</Text>
                  </View>
                  <MaterialIcons name="chevron-right" size={18} color={colors.textTertiary} />
                </TouchableOpacity>
                <View style={[styles.separator, { backgroundColor: colors.border, marginLeft: 52 }]} />
                <TouchableOpacity
                  style={styles.actionRow}
                  onPress={() => setBlockchainTransferVisible(true)}
                  activeOpacity={0.7}
                >
                  <View style={styles.settingsLeft}>
                    <MaterialIcons name="swap-horiz" size={20} color={colors.text} />
                    <Text style={[styles.settingsText, { color: colors.text }]}>{t("blockchain.transfer")}</Text>
                  </View>
                  <MaterialIcons name="chevron-right" size={18} color={colors.textTertiary} />
                </TouchableOpacity>
                <View style={[styles.separator, { backgroundColor: colors.border, marginLeft: 52 }]} />
                <TouchableOpacity
                  style={styles.actionRow}
                  onPress={() => setSettingsVisible(true)}
                  activeOpacity={0.7}
                >
                  <View style={styles.settingsLeft}>
                    <MaterialIcons name="settings" size={20} color={colors.text} />
                    <Text style={[styles.settingsText, { color: colors.text }]}>{t("account.settings")}</Text>
                  </View>
                  <MaterialIcons name="chevron-right" size={18} color={colors.textTertiary} />
                </TouchableOpacity>
              </View>
            </View>
          </>
        )}
      </ScrollView>

      <SettingsDrawer
        visible={settingsVisible}
        onClose={() => setSettingsVisible(false)}
      />
      <RegisterCustomerDrawer
        visible={registerVisible}
        onClose={() => setRegisterVisible(false)}
        onSuccess={(c) => setCustomer(c)}
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
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  scroll: {
    flex: 1,
  },
  content: {
    paddingTop: 12,
    paddingBottom: 40,
  },
  section: {
    marginBottom: 28,
    paddingHorizontal: 16,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
    paddingHorizontal: 4,
  },
  categorySection: {
    marginBottom: 24,
  },
  categoryTitle: {
    fontSize: 13,
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 8,
    paddingHorizontal: 4,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "600",
    letterSpacing: -0.4,
  },
  totalBalance: {
    fontSize: 20,
    fontWeight: "600",
    letterSpacing: -0.4,
  },
  card: {
    borderRadius: 12,
    overflow: "hidden",
    borderWidth: StyleSheet.hairlineWidth,
  },
  userHeader: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
  },
  avatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 19,
    fontWeight: "600",
    marginBottom: 3,
    letterSpacing: -0.4,
  },
  userEmail: {
    fontSize: 14,
    letterSpacing: -0.2,
  },
  userDetailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingBottom: 14,
    paddingTop: 12,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  userDetailLabel: {
    fontSize: 14,
    letterSpacing: -0.2,
  },
  userDetailValue: {
    fontSize: 14,
    fontWeight: "500",
    letterSpacing: -0.2,
  },
  accountRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 14,
    minHeight: 60,
  },
  accountLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    marginRight: 12,
  },
  accountIcon: {
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  accountInfo: {
    flex: 1,
    minWidth: 0,
  },
  accountName: {
    fontSize: 16,
    fontWeight: "500",
    marginBottom: 3,
    letterSpacing: -0.3,
  },
  accountType: {
    fontSize: 13,
    letterSpacing: -0.2,
  },
  accountRight: {
    alignItems: "flex-end",
  },
  accountBalance: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 3,
    letterSpacing: -0.3,
  },
  accountChange: {
    fontSize: 13,
    fontWeight: "500",
    letterSpacing: -0.2,
  },
  separator: {
    height: StyleSheet.hairlineWidth,
    marginLeft: 60,
  },
  actionRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 14,
    minHeight: 52,
  },
  settingsRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 14,
    minHeight: 52,
  },
  settingsLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  settingsText: {
    fontSize: 16,
    fontWeight: "400",
    letterSpacing: -0.3,
  },
  loadingContainer: {
    flex: 1,
    minHeight: 400,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 60,
  },
  centered: {
    flex: 1,
    minHeight: 300,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 40,
  },
  errorText: {
    textAlign: "center",
    fontSize: 15,
    marginBottom: 16,
    paddingHorizontal: 32,
  },
  retryButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 10,
  },
  retryButtonText: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "600",
  },
});
