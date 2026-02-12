import { useEffect, useState } from "react";
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
import type { Instrument } from "@/src/domain/entities/instrument";
import type { Order } from "@/src/domain/entities/order";
import type { Trade } from "@/src/domain/entities/trade";
import { useDraggableDrawer } from "@/src/presentation/hooks/useDraggableDrawer";
import { useTheme } from "@/src/presentation/theme";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { useTranslation } from "@/src/presentation/i18n";

const { height: SCREEN_HEIGHT } = Dimensions.get("window");
const DRAWER_HEIGHT = Math.min(SCREEN_HEIGHT * 0.75, 560);

interface NewTradeDrawerProps {
  visible: boolean;
  onClose: () => void;
  onSuccess?: (trade: Trade) => void;
}

export function NewTradeDrawer({ visible, onClose, onSuccess }: NewTradeDrawerProps) {
  const { colors } = useTheme();
  const { t } = useTranslation();
  const [step, setStep] = useState<"order" | "trade">("order");
  const [accounts, setAccounts] = useState<{ account_id: string; account_type: string; currency: string }[]>([]);
  const [instruments, setInstruments] = useState<Instrument[]>([]);
  const [accountId, setAccountId] = useState("");
  const [instrumentId, setInstrumentId] = useState("");
  const [side, setSide] = useState<"buy" | "sell">("buy");
  const [quantity, setQuantity] = useState("");
  const [price, setPrice] = useState("");
  const [createdOrder, setCreatedOrder] = useState<Order | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<Trade | null>(null);
  const [error, setError] = useState<string | null>(null);

  const { slideAnim, dragOffset, panHandlers, backdropOpacity, closeWithAnimation } =
    useDraggableDrawer({ visible, drawerHeight: DRAWER_HEIGHT, onClose });

  useEffect(() => {
    if (visible) {
      const accountsApi = container.getAccountsApi();
      const instrumentRepository = container.getInstrumentRepository();
      Promise.all([accountsApi.list(20, 0), instrumentRepository.list(50, 0)]).then(([accs, insts]) => {
        setAccounts(accs);
        setInstruments(insts);
      });
    }
  }, [visible]);

  const handleClose = () => {
    setStep("order");
    setAccountId("");
    setInstrumentId("");
    setQuantity("");
    setPrice("");
    setCreatedOrder(null);
    setResult(null);
    setError(null);
    closeWithAnimation();
  };

  const handleCreateOrder = async () => {
    const qty = parseFloat(quantity);
    if (!accountId || !instrumentId || isNaN(qty) || qty <= 0) return;
    setSubmitting(true);
    setError(null);
    try {
      const orderRepository = container.getOrderRepository();
      const order = await orderRepository.create({
        account_id: accountId,
        instrument_id: instrumentId,
        side,
        quantity: qty,
      });
      if (order) {
        setCreatedOrder(order);
        setStep("trade");
        setPrice("");
      } else {
        setError(t("account.orderFailed"));
      }
    } catch {
      setError(t("account.orderFailed"));
    } finally {
      setSubmitting(false);
    }
  };

  const handleCreateTrade = async () => {
    const qty = parseFloat(quantity);
    const prc = parseFloat(price);
    const oid = createdOrder?.order_id;
    if (!oid || isNaN(qty) || qty <= 0 || isNaN(prc) || prc <= 0) return;
    setSubmitting(true);
    setError(null);
    try {
      const tradeRepository = container.getTradeRepository();
      const trade = await tradeRepository.create({
        order_id: oid,
        quantity: qty,
        price: prc,
      });
      if (trade) {
        setResult(trade);
        onSuccess?.(trade);
      } else {
        setError(t("account.tradeFailed"));
      }
    } catch {
      setError(t("account.tradeFailed"));
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
            <Text style={[styles.headerTitle, { color: colors.text }]}>
              {step === "order" ? t("account.createOrder") : t("account.executeTrade")}
            </Text>
            <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
              <MaterialIcons name="close" size={24} color={colors.text} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.content} contentContainerStyle={styles.contentInner} keyboardShouldPersistTaps="handled">
            {result ? (
              <View style={styles.resultSection}>
                <MaterialIcons name="check-circle" size={48} color={colors.success} />
                <Text style={[styles.resultTitle, { color: colors.text }]}>{t("account.tradeSuccess")}</Text>
                {(result.surveillance_alert != null || result.surveillance_score != null) && (
                  <View style={[styles.surveillanceRow, { backgroundColor: colors.surface }]}>
                    <Text style={[styles.surveillanceLabel, { color: colors.textSecondary }]}>
                      {t("account.surveillanceAlert")}
                    </Text>
                    <Text style={[styles.surveillanceValue, { color: colors.text }]}>
                      {result.surveillance_alert ?? "-"}
                      {result.surveillance_score != null && ` (${result.surveillance_score.toFixed(2)})`}
                    </Text>
                  </View>
                )}
                <TouchableOpacity style={[styles.doneButton, { backgroundColor: colors.primary }]} onPress={handleClose}>
                  <Text style={styles.doneButtonText}>{t("common.close")}</Text>
                </TouchableOpacity>
              </View>
            ) : step === "order" ? (
              <>
                <View style={styles.fieldGroup}>
                  <Text style={[styles.label, { color: colors.textSecondary }]}>{t("account.side")}</Text>
                  <View style={styles.sideRow}>
                    <TouchableOpacity
                      style={[
                        styles.sideButton,
                        { backgroundColor: side === "buy" ? colors.primaryLight : colors.surface, borderColor: colors.border },
                      ]}
                      onPress={() => setSide("buy")}
                    >
                      <Text style={{ color: side === "buy" ? colors.primary : colors.text }}>{t("account.buy")}</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[
                        styles.sideButton,
                        {
                          backgroundColor: side === "sell" ? "rgba(255,59,48,0.15)" : colors.surface,
                          borderColor: side === "sell" ? colors.error : colors.border,
                        },
                      ]}
                      onPress={() => setSide("sell")}
                    >
                      <Text style={{ color: side === "sell" ? colors.error : colors.text }}>{t("account.sell")}</Text>
                    </TouchableOpacity>
                  </View>
                </View>
                <View style={styles.fieldGroup}>
                  <Text style={[styles.label, { color: colors.textSecondary }]}>{t("account.selectAccount")}</Text>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipScroll}>
                    {accounts.map((acc) => {
                      const selected = accountId === acc.account_id;
                      return (
                        <TouchableOpacity
                          key={acc.account_id}
                          style={[
                            styles.chip,
                            { backgroundColor: selected ? colors.primaryLight : colors.surface, borderColor: colors.border },
                          ]}
                          onPress={() => setAccountId(acc.account_id)}
                        >
                          <Text style={[styles.chipText, { color: selected ? colors.primary : colors.text }]}>
                            {acc.account_type}
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                  </ScrollView>
                </View>
                <View style={styles.fieldGroup}>
                  <Text style={[styles.label, { color: colors.textSecondary }]}>{t("account.selectInstrument")}</Text>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipScroll}>
                    {instruments.slice(0, 20).map((i) => {
                      const selected = instrumentId === i.instrument_id;
                      return (
                        <TouchableOpacity
                          key={i.instrument_id}
                          style={[
                            styles.chip,
                            { backgroundColor: selected ? colors.primaryLight : colors.surface, borderColor: colors.border },
                          ]}
                          onPress={() => setInstrumentId(i.instrument_id)}
                        >
                          <Text style={[styles.chipText, { color: selected ? colors.primary : colors.text }]}>
                            {i.symbol}
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                  </ScrollView>
                </View>
                <View style={styles.fieldGroup}>
                  <Text style={[styles.label, { color: colors.textSecondary }]}>{t("account.quantity")}</Text>
                  <TextInput
                    style={[styles.input, { color: colors.text, borderColor: colors.border, backgroundColor: colors.surface }]}
                    value={quantity}
                    onChangeText={setQuantity}
                    placeholder="0"
                    placeholderTextColor={colors.textTertiary}
                    keyboardType="decimal-pad"
                    editable={!submitting}
                  />
                </View>
                {error && <Text style={[styles.errorText, { color: colors.error }]}>{error}</Text>}
                <TouchableOpacity
                  style={[
                    styles.submitButton,
                    { backgroundColor: colors.primary },
                    (submitting || !accountId || !instrumentId || !quantity) && styles.submitButtonDisabled,
                  ]}
                  onPress={handleCreateOrder}
                  disabled={submitting || !accountId || !instrumentId || !quantity}
                >
                  {submitting ? (
                    <ActivityIndicator size="small" color="#fff" />
                  ) : (
                    <Text style={styles.submitButtonText}>{t("account.next")}</Text>
                  )}
                </TouchableOpacity>
              </>
            ) : (
              <>
                <View style={styles.fieldGroup}>
                  <Text style={[styles.label, { color: colors.textSecondary }]}>{t("account.orderQuantity")}</Text>
                  <TextInput
                    style={[styles.input, { color: colors.text, borderColor: colors.border, backgroundColor: colors.surface }]}
                    value={quantity}
                    onChangeText={setQuantity}
                    placeholder="0"
                    placeholderTextColor={colors.textTertiary}
                    keyboardType="decimal-pad"
                    editable={!submitting}
                  />
                </View>
                <View style={styles.fieldGroup}>
                  <Text style={[styles.label, { color: colors.textSecondary }]}>{t("account.price")}</Text>
                  <TextInput
                    style={[styles.input, { color: colors.text, borderColor: colors.border, backgroundColor: colors.surface }]}
                    value={price}
                    onChangeText={setPrice}
                    placeholder="0.00"
                    placeholderTextColor={colors.textTertiary}
                    keyboardType="decimal-pad"
                    editable={!submitting}
                  />
                </View>
                {error && <Text style={[styles.errorText, { color: colors.error }]}>{error}</Text>}
                <TouchableOpacity
                  style={[styles.backButton, { borderColor: colors.border }]}
                  onPress={() => setStep("order")}
                  disabled={submitting}
                >
                  <Text style={[styles.backButtonText, { color: colors.text }]}>{t("account.back")}</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.submitButton,
                    { backgroundColor: colors.primary },
                    (submitting || !price) && styles.submitButtonDisabled,
                  ]}
                  onPress={handleCreateTrade}
                  disabled={submitting || !price}
                >
                  {submitting ? (
                    <ActivityIndicator size="small" color="#fff" />
                  ) : (
                    <Text style={styles.submitButtonText}>{t("account.executeTrade")}</Text>
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
  sideRow: { flexDirection: "row", gap: 12 },
  sideButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: "center",
    borderWidth: 1,
  },
  chipScroll: { flexGrow: 0 },
  chip: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 10,
    marginRight: 8,
    borderWidth: 1,
  },
  chipText: { fontSize: 14 },
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
  backButton: {
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: "center",
    borderWidth: 1,
    marginTop: 8,
  },
  backButtonText: { fontSize: 16 },
  resultSection: { alignItems: "center", paddingTop: 20 },
  resultTitle: { fontSize: 18, fontWeight: "600", marginTop: 16 },
  surveillanceRow: {
    marginTop: 16,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 10,
    alignSelf: "stretch",
  },
  surveillanceLabel: { fontSize: 13, marginBottom: 4 },
  surveillanceValue: { fontSize: 15, fontWeight: "600" },
  doneButton: { marginTop: 24, paddingVertical: 12, paddingHorizontal: 32, borderRadius: 10 },
  doneButtonText: { color: "#fff", fontSize: 16, fontWeight: "600" },
});
