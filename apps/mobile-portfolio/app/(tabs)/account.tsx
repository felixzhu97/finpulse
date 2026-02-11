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
import { customersApi, portfolioApi } from "@/src/api";
import type { Account, Customer } from "@/src/types";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { SettingsDrawer } from "@/src/components/account/SettingsDrawer";
import { RegisterCustomerDrawer } from "@/src/components/account/RegisterCustomerDrawer";
import { NewPaymentDrawer } from "@/src/components/account/NewPaymentDrawer";
import { NewTradeDrawer } from "@/src/components/account/NewTradeDrawer";
import { formatBalance } from "@/src/utils";
import { useTheme } from "@/src/theme";
import { useTranslation } from "@/src/i18n";

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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [settingsVisible, setSettingsVisible] = useState(false);
  const [registerVisible, setRegisterVisible] = useState(false);
  const [paymentVisible, setPaymentVisible] = useState(false);
  const [tradeVisible, setTradeVisible] = useState(false);

  const loadData = useCallback(async () => {
    const tag = "[AccountTab]";
    console.log(`${tag} loadData start`);
    setLoading(true);
    setError(false);
    try {
      console.log(`${tag} calling customersApi.getFirst()`);
      const customerPromise = customersApi.getFirst();
      console.log(`${tag} calling portfolioApi.getAccounts()`);
      const accountsPromise = portfolioApi.getAccounts();

      const [customerData, accountList] = await Promise.all([
        customerPromise,
        accountsPromise,
      ]);

      console.log(`${tag} customersApi.getFirst() resolved:`, customerData != null);
      console.log(`${tag} portfolioApi.getAccounts() resolved:`, accountList?.length ?? 0, "accounts");

      const data = { customer: customerData, accounts: accountList ?? [] };
      InteractionManager.runAfterInteractions(() => {
        setCustomer(data.customer);
        setAccounts(data.accounts);
        setLoading(false);
      });
      console.log(`${tag} loadData success state:`, {
        hasCustomer: !!customerData,
        accountsLength: data.accounts.length,
      });
    } catch (e) {
      console.log(`${tag} loadData error:`, e);
      setError(true);
      InteractionManager.runAfterInteractions(() => setLoading(false));
    } finally {
      console.log(`${tag} loadData done`);
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

  const showLoading = loading && !customer && accounts.length === 0;
  console.log("[AccountTab] render:", { loading, hasCustomer: !!customer, accountsLength: accounts.length, showLoading });

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
                        size={32}
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
                <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
                  {accounts.map((account, index) => (
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
                      {index < accounts.length - 1 && (
                        <View style={[styles.separator, { backgroundColor: colors.border }]} />
                      )}
                    </View>
                  ))}
                </View>
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
                    <MaterialIcons name="person-add" size={22} color={colors.text} />
                    <Text style={[styles.settingsText, { color: colors.text }]}>{t("account.register")}</Text>
                  </View>
                  <MaterialIcons name="chevron-right" size={20} color={colors.textTertiary} />
                </TouchableOpacity>
                <View style={[styles.separator, { backgroundColor: colors.border, marginLeft: 54 }]} />
                <TouchableOpacity
                  style={styles.actionRow}
                  onPress={() => setPaymentVisible(true)}
                  activeOpacity={0.7}
                >
                  <View style={styles.settingsLeft}>
                    <MaterialIcons name="payment" size={22} color={colors.text} />
                    <Text style={[styles.settingsText, { color: colors.text }]}>{t("account.newPayment")}</Text>
                  </View>
                  <MaterialIcons name="chevron-right" size={20} color={colors.textTertiary} />
                </TouchableOpacity>
                <View style={[styles.separator, { backgroundColor: colors.border, marginLeft: 54 }]} />
                <TouchableOpacity
                  style={styles.actionRow}
                  onPress={() => setTradeVisible(true)}
                  activeOpacity={0.7}
                >
                  <View style={styles.settingsLeft}>
                    <MaterialIcons name="trending-up" size={22} color={colors.text} />
                    <Text style={[styles.settingsText, { color: colors.text }]}>{t("account.newTrade")}</Text>
                  </View>
                  <MaterialIcons name="chevron-right" size={20} color={colors.textTertiary} />
                </TouchableOpacity>
                <View style={[styles.separator, { backgroundColor: colors.border, marginLeft: 54 }]} />
                <TouchableOpacity
                  style={styles.actionRow}
                  onPress={() => setSettingsVisible(true)}
                  activeOpacity={0.7}
                >
                  <View style={styles.settingsLeft}>
                    <MaterialIcons name="settings" size={22} color={colors.text} />
                    <Text style={[styles.settingsText, { color: colors.text }]}>{t("account.settings")}</Text>
                  </View>
                  <MaterialIcons name="chevron-right" size={20} color={colors.textTertiary} />
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
    paddingTop: 8,
    paddingBottom: 40,
  },
  section: {
    marginBottom: 24,
    paddingHorizontal: 16,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
    paddingHorizontal: 4,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: "600",
    letterSpacing: -0.3,
  },
  totalBalance: {
    fontSize: 22,
    fontWeight: "600",
    letterSpacing: -0.3,
  },
  card: {
    borderRadius: 16,
    overflow: "hidden",
    borderWidth: StyleSheet.hairlineWidth,
  },
  userHeader: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 20,
    fontWeight: "600",
    marginBottom: 4,
    letterSpacing: -0.3,
  },
  userEmail: {
    fontSize: 15,
    letterSpacing: -0.2,
  },
  userDetailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingBottom: 16,
    paddingTop: 8,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  userDetailLabel: {
    fontSize: 15,
  },
  userDetailValue: {
    fontSize: 15,
    fontWeight: "500",
  },
  accountRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
    minHeight: 64,
  },
  accountLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    marginRight: 12,
  },
  accountIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  accountInfo: {
    flex: 1,
    minWidth: 0,
  },
  accountName: {
    fontSize: 17,
    fontWeight: "500",
    marginBottom: 4,
    letterSpacing: -0.3,
  },
  accountType: {
    fontSize: 14,
    letterSpacing: -0.2,
  },
  accountRight: {
    alignItems: "flex-end",
  },
  accountBalance: {
    fontSize: 17,
    fontWeight: "600",
    marginBottom: 4,
    letterSpacing: -0.3,
  },
  accountChange: {
    fontSize: 14,
    fontWeight: "500",
    letterSpacing: -0.2,
  },
  separator: {
    height: StyleSheet.hairlineWidth,
    marginLeft: 68,
  },
  actionRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
    minHeight: 56,
  },
  settingsRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
    minHeight: 56,
  },
  settingsLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  settingsText: {
    fontSize: 17,
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
