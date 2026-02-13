import { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Animated,
  Dimensions,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { container } from "@/src/application";
import type { AccountResource } from "@/src/domain/entities/accountResource";
import type { Payment } from "@/src/domain/entities/payment";
import { useDraggableDrawer } from "@/src/presentation/hooks/useDraggableDrawer";
import { useTheme } from "@/src/presentation/theme";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { useTranslation } from "@/src/presentation/i18n";

const { height: SCREEN_HEIGHT } = Dimensions.get("window");
const DRAWER_HEIGHT = Math.min(SCREEN_HEIGHT * 0.65, 480);

interface NewPaymentDrawerProps {
  visible: boolean;
  onClose: () => void;
  onSuccess?: (payment: Payment) => void;
}

export function NewPaymentDrawer({ visible, onClose, onSuccess }: NewPaymentDrawerProps) {
  const { colors } = useTheme();
  const { t } = useTranslation();
  const [accounts, setAccounts] = useState<AccountResource[]>([]);
  const [accountId, setAccountId] = useState("");
  const [amount, setAmount] = useState("");
  const [counterparty, setCounterparty] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<Payment | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loadingAccounts, setLoadingAccounts] = useState(false);

  const { slideAnim, dragOffset, panHandlers, backdropOpacity, closeWithAnimation } =
    useDraggableDrawer({ visible, drawerHeight: DRAWER_HEIGHT, onClose });

  const paymentUseCase = useMemo(() => container.getPaymentUseCase(), []);

  useEffect(() => {
    if (visible) {
      setLoadingAccounts(true);
      paymentUseCase
        .getFormData()
        .then(setAccounts)
        .finally(() => setLoadingAccounts(false));
    }
  }, [visible, paymentUseCase]);

  const handleClose = () => {
    setAccountId("");
    setAmount("");
    setCounterparty("");
    setResult(null);
    setError(null);
    closeWithAnimation();
  };

  const handleSubmit = async () => {
    const parsedAmount = parseFloat(amount);
    if (!accountId || isNaN(parsedAmount) || parsedAmount <= 0) return;
    setSubmitting(true);
    setError(null);
    try {
      const created = await paymentUseCase.create({
        accountId,
        amount: parsedAmount,
        currency: "USD",
        counterparty: counterparty.trim() || undefined,
      });
      if (created) {
        setResult(created);
        onSuccess?.(created);
      } else {
        setError(t("account.paymentFailed"));
      }
    } catch {
      setError(t("account.paymentFailed"));
    } finally {
      setSubmitting(false);
    }
  };

  const translateY = Animated.add(slideAnim, dragOffset);

  return (
    <Modal visible={visible} animationType="none" transparent onRequestClose={handleClose}>
      <View style={styles.modalRoot}>
        <Animated.View
          style={[styles.backdrop, { opacity: backdropOpacity, backgroundColor: colors.backdrop }]}
          pointerEvents="box-none"
        >
          <Pressable style={StyleSheet.absoluteFill} onPress={handleClose} />
        </Animated.View>

        <Animated.View
          style={[
            styles.drawer,
            {
              height: DRAWER_HEIGHT,
              transform: [{ translateY }],
              backgroundColor: colors.cardSolid,
            },
          ]}
        >
          <SafeAreaView style={styles.safe} edges={["top"]}>
            <View style={styles.dragArea} {...panHandlers}>
              <View style={[styles.dragHandle, { backgroundColor: colors.textTertiary }]} />
            </View>
            <View style={[styles.header, { borderBottomColor: colors.border }]}>
            <Text style={[styles.headerTitle, { color: colors.text }]}>{t("account.newPayment")}</Text>
            <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
              <MaterialIcons name="close" size={24} color={colors.text} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.content} contentContainerStyle={styles.contentInner} keyboardShouldPersistTaps="handled">
            {result ? (
              <View style={styles.resultSection}>
                <MaterialIcons name="check-circle" size={48} color={colors.success} />
                <Text style={[styles.resultTitle, { color: colors.text }]}>{t("account.paymentSuccess")}</Text>
                {(result.fraud_recommendation != null || result.fraud_score != null) && (
                  <View style={[styles.fraudRow, { backgroundColor: colors.surface }]}>
                    <Text style={[styles.fraudLabel, { color: colors.textSecondary }]}>
                      {t("account.fraudRecommendation")}
                    </Text>
                    <Text style={[styles.fraudValue, { color: colors.text }]}>
                      {result.fraud_recommendation ?? "-"}
                      {result.fraud_score != null && ` (${(result.fraud_score * 100).toFixed(0)}%)`}
                    </Text>
                  </View>
                )}
                <TouchableOpacity style={[styles.doneButton, { backgroundColor: colors.primary }]} onPress={handleClose}>
                  <Text style={styles.doneButtonText}>{t("common.close")}</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <>
                <View style={styles.fieldGroup}>
                  <Text style={[styles.label, { color: colors.textSecondary }]}>{t("account.selectAccount")}</Text>
                  {loadingAccounts ? (
                    <ActivityIndicator size="small" color={colors.primary} />
                  ) : (
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.accountScroll}>
                      {accounts.map((acc) => {
                        const selected = accountId === acc.account_id;
                        return (
                          <TouchableOpacity
                            key={acc.account_id}
                            style={[
                              styles.accountChip,
                              {
                                backgroundColor: selected ? colors.primaryLight : colors.surface,
                                borderColor: selected ? colors.primary : colors.border,
                              },
                            ]}
                            onPress={() => setAccountId(acc.account_id)}
                          >
                            <Text
                              style={[styles.accountChipText, { color: selected ? colors.primary : colors.text }]}
                              numberOfLines={1}
                            >
                              {acc.account_type} · {acc.currency}
                            </Text>
                          </TouchableOpacity>
                        );
                      })}
                    </ScrollView>
                  )}
                </View>
                <View style={styles.fieldGroup}>
                  <Text style={[styles.label, { color: colors.textSecondary }]}>{t("account.amount")}</Text>
                  <TextInput
                    style={[styles.input, { color: colors.text, borderColor: colors.border, backgroundColor: colors.surface }]}
                    value={amount}
                    onChangeText={setAmount}
                    placeholder="0.00"
                    placeholderTextColor={colors.textTertiary}
                    keyboardType="decimal-pad"
                    editable={!submitting}
                  />
                </View>
                <View style={styles.fieldGroup}>
                  <Text style={[styles.label, { color: colors.textSecondary }]}>{t("account.counterparty")}</Text>
                  <TextInput
                    style={[styles.input, { color: colors.text, borderColor: colors.border, backgroundColor: colors.surface }]}
                    value={counterparty}
                    onChangeText={setCounterparty}
                    placeholder={t("account.counterpartyPlaceholder")}
                    placeholderTextColor={colors.textTertiary}
                    editable={!submitting}
                  />
                </View>
                {error && <Text style={[styles.errorText, { color: colors.error }]}>{error}</Text>}
                <TouchableOpacity
                  style={[
                    styles.submitButton,
                    { backgroundColor: colors.primary },
                    (submitting || !accountId || !amount) && styles.submitButtonDisabled,
                  ]}
                  onPress={handleSubmit}
                  disabled={submitting || !accountId || !amount}
                >
                  {submitting ? (
                    <ActivityIndicator size="small" color="#fff" />
                  ) : (
                    <Text style={styles.submitButtonText}>{t("account.submit")}</Text>
                  )}
                </TouchableOpacity>
              </>
            )}
          </ScrollView>
          </SafeAreaView>
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalRoot: { flex: 1, justifyContent: "flex-end" },
  backdrop: { ...StyleSheet.absoluteFillObject },
  drawer: { borderTopLeftRadius: 14, borderTopRightRadius: 14, overflow: "hidden" },
  safe: { flex: 1 },
  dragArea: { paddingTop: 8, paddingBottom: 8, alignItems: "center", minHeight: 40 },
  dragHandle: { width: 36, height: 5, borderRadius: 2.5 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  headerTitle: { fontSize: 20, fontWeight: "600", letterSpacing: -0.3 },
  closeButton: { width: 32, height: 32, alignItems: "center", justifyContent: "center" },
  content: { flex: 1 },
  contentInner: { paddingHorizontal: 20, paddingTop: 20, paddingBottom: 40 },
  fieldGroup: { marginBottom: 16 },
  label: { fontSize: 13, fontWeight: "600", marginBottom: 6 },
  input: {
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
  },
  accountScroll: { flexGrow: 0 },
  accountChip: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 10,
    marginRight: 8,
    borderWidth: 1,
  },
  accountChipText: { fontSize: 14 },
  errorText: { fontSize: 13, marginBottom: 12 },
  submitButton: {
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 8,
  },
  submitButtonDisabled: { opacity: 0.5 },
  submitButtonText: { color: "#fff", fontSize: 16, fontWeight: "600" },
  resultSection: { alignItems: "center", paddingTop: 20 },
  resultTitle: { fontSize: 18, fontWeight: "600", marginTop: 16 },
  fraudRow: {
    marginTop: 16,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 10,
    alignSelf: "stretch",
  },
  fraudLabel: { fontSize: 13, marginBottom: 4 },
  fraudValue: { fontSize: 15, fontWeight: "600" },
  doneButton: { marginTop: 24, paddingVertical: 12, paddingHorizontal: 32, borderRadius: 10 },
  doneButtonText: { color: "#fff", fontSize: 16, fontWeight: "600" },
});
