import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Animated,
  Dimensions,
  Modal,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import {
  getTradeFormData,
  createOrder,
  executeTrade,
} from "@/src/infrastructure/api";
import type { Instrument } from "@/src/domain/entities/instrument";
import type { Order } from "@/src/domain/entities/order";
import type { Trade } from "@/src/domain/entities/trade";
import { useDraggableDrawer } from "@/src/presentation/hooks";
import { useTheme } from "@/src/presentation/theme";
import {
  AbsoluteFill,
  BlockRowHalf,
  DrawerModalRoot,
  DrawerBackdrop,
  DrawerSheet,
  DrawerSafe,
  DrawerDragArea,
  DrawerHandle,
  DrawerHeader,
  DrawerHeaderTitle,
  DrawerCloseButton,
  DrawerFieldGroup,
  DrawerLabel,
  DrawerInput,
  DrawerSubmitButton,
  DrawerSubmitButtonText,
  DrawerErrorText,
} from "@/src/presentation/theme/primitives";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { useTranslation } from "@/src/presentation/i18n";

const { height: SCREEN_HEIGHT } = Dimensions.get("window");
const DRAWER_HEIGHT = Math.min(SCREEN_HEIGHT * 0.75, 560);

interface NewTradeDrawerProps {
  visible: boolean;
  onClose: () => void;
  onSuccess?: (trade: Trade) => void;
  prefillDefaults?: boolean;
}

export function NewTradeDrawer({ visible, onClose, onSuccess, prefillDefaults }: NewTradeDrawerProps) {
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
      getTradeFormData().then(({ accounts: accs, instruments: insts }) => {
        const accList = accs.map((a) => ({ account_id: a.account_id, account_type: a.account_type, currency: a.currency }));
        setAccounts(accList);
        setInstruments(insts);
        if (prefillDefaults && accList.length > 0 && insts.length > 0) {
          setAccountId(accList[0].account_id);
          setInstrumentId(insts[0].instrument_id);
        }
      });
    }
  }, [visible, prefillDefaults]);

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
    if (!accountId || !instrumentId || !quantity.trim()) return;
    if (isNaN(qty) || qty <= 0 || !Number.isFinite(qty) || qty > 1e12) return;
    setError(null);
    setSubmitting(true);
    try {
      const order = await createOrder({
        accountId,
        instrumentId,
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
    if (!oid || !price.trim()) return;
    if (isNaN(qty) || qty <= 0 || !Number.isFinite(qty) || qty > 1e12) return;
    if (isNaN(prc) || prc <= 0 || !Number.isFinite(prc) || prc > 1e12) return;
    setError(null);
    setSubmitting(true);
    setError(null);
    try {
      const trade = await executeTrade({
        orderId: oid,
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
      <DrawerModalRoot>
        <DrawerBackdrop style={{ opacity: backdropOpacity }} pointerEvents="box-none">
          <AbsoluteFill onPress={handleClose} />
        </DrawerBackdrop>

        <DrawerSheet
          style={{
            height: DRAWER_HEIGHT,
            transform: [{ translateY }],
          }}
        >
          <DrawerSafe edges={["top"]}>
            <DrawerDragArea {...panHandlers}>
              <DrawerHandle />
            </DrawerDragArea>
            <DrawerHeader>
              <DrawerHeaderTitle>
                {step === "order" ? t("account.createOrder") : t("account.executeTrade")}
              </DrawerHeaderTitle>
              <DrawerCloseButton onPress={handleClose}>
                <MaterialIcons name="close" size={24} color={colors.text} />
              </DrawerCloseButton>
            </DrawerHeader>

          <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 20, paddingBottom: 40 }} keyboardShouldPersistTaps="handled">
            {result ? (
              <View style={{ alignItems: "center", paddingTop: 20 }}>
                <MaterialIcons name="check-circle" size={48} color={colors.success} />
                <Text style={{ fontSize: 18, fontWeight: "600", marginTop: 16, color: colors.text }}>{t("account.tradeSuccess")}</Text>
                {(result.surveillance_alert != null || result.surveillance_score != null) && (
                  <View style={{ marginTop: 16, paddingVertical: 12, paddingHorizontal: 20, borderRadius: 10, alignSelf: "stretch", backgroundColor: colors.surface }}>
                    <Text style={{ fontSize: 13, marginBottom: 4, color: colors.textSecondary }}>
                      {t("account.surveillanceAlert")}
                    </Text>
                    <Text style={{ fontSize: 15, fontWeight: "600", color: colors.text }}>
                      {result.surveillance_alert ?? "-"}
                      {result.surveillance_score != null && ` (${result.surveillance_score.toFixed(2)})`}
                    </Text>
                  </View>
                )}
                <TouchableOpacity style={{ marginTop: 24, paddingVertical: 12, paddingHorizontal: 32, borderRadius: 12, backgroundColor: colors.accent }} onPress={handleClose}>
                  <Text style={{ color: colors.onAccent, fontSize: 16, fontWeight: "600" }}>{t("common.close")}</Text>
                </TouchableOpacity>
              </View>
            ) : step === "order" ? (
              <>
                <DrawerFieldGroup>
                  <DrawerLabel>{t("account.side")}</DrawerLabel>
                  <BlockRowHalf>
                    <TouchableOpacity
                      style={{
                        flex: 1,
                        paddingVertical: 12,
                        borderRadius: 10,
                        alignItems: "center",
                        borderWidth: 1,
                        backgroundColor: side === "buy" ? colors.primaryLight : colors.surface,
                        borderColor: side === "buy" ? colors.accent : colors.border,
                      }}
                      onPress={() => setSide("buy")}
                    >
                      <Text style={{ color: side === "buy" ? colors.accent : colors.text }}>{t("account.buy")}</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={{
                        flex: 1,
                        paddingVertical: 12,
                        borderRadius: 10,
                        alignItems: "center",
                        borderWidth: 1,
                        backgroundColor: side === "sell" ? "rgba(255,59,48,0.15)" : colors.surface,
                        borderColor: side === "sell" ? colors.error : colors.border,
                      }}
                      onPress={() => setSide("sell")}
                    >
                      <Text style={{ color: side === "sell" ? colors.error : colors.text }}>{t("account.sell")}</Text>
                    </TouchableOpacity>
                  </BlockRowHalf>
                </DrawerFieldGroup>
                <DrawerFieldGroup>
                  <DrawerLabel>{t("account.selectAccount")}</DrawerLabel>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ flexGrow: 0 }}>
                    {accounts.map((acc) => {
                      const selected = accountId === acc.account_id;
                      return (
                        <TouchableOpacity
                          key={acc.account_id}
                          style={{
                            paddingVertical: 10,
                            paddingHorizontal: 16,
                            borderRadius: 10,
                            marginRight: 8,
                            borderWidth: 1,
                            backgroundColor: selected ? colors.primaryLight : colors.surface,
                            borderColor: selected ? colors.accent : colors.border,
                          }}
                          onPress={() => setAccountId(acc.account_id)}
                        >
                          <Text style={{ fontSize: 14, color: selected ? colors.accent : colors.text }}>
                            {acc.account_type}
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                  </ScrollView>
                </DrawerFieldGroup>
                <DrawerFieldGroup>
                  <DrawerLabel>{t("account.selectInstrument")}</DrawerLabel>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ flexGrow: 0 }}>
                    {instruments.slice(0, 20).map((i) => {
                      const selected = instrumentId === i.instrument_id;
                      return (
                        <TouchableOpacity
                          key={i.instrument_id}
                          style={{
                            paddingVertical: 10,
                            paddingHorizontal: 16,
                            borderRadius: 10,
                            marginRight: 8,
                            borderWidth: 1,
                            backgroundColor: selected ? colors.primaryLight : colors.surface,
                            borderColor: selected ? colors.accent : colors.border,
                          }}
                          onPress={() => setInstrumentId(i.instrument_id)}
                        >
                          <Text style={{ fontSize: 14, color: selected ? colors.accent : colors.text }}>
                            {i.symbol}
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                  </ScrollView>
                </DrawerFieldGroup>
                <DrawerFieldGroup>
                  <DrawerLabel>{t("account.quantity")}</DrawerLabel>
                  <DrawerInput
                    value={quantity}
                    onChangeText={setQuantity}
                    placeholder="0"
                    placeholderTextColor={colors.textTertiary}
                    keyboardType="decimal-pad"
                    editable={!submitting}
                  />
                </DrawerFieldGroup>
                {error && <DrawerErrorText>{error}</DrawerErrorText>}
                <DrawerSubmitButton
                  style={{ opacity: (submitting || !accountId || !instrumentId || !quantity) ? 0.5 : 1 }}
                  onPress={handleCreateOrder}
                  disabled={submitting || !accountId || !instrumentId || !quantity}
                >
                  {submitting ? (
                    <ActivityIndicator size="small" color="#fff" />
                  ) : (
                    <DrawerSubmitButtonText>{t("account.next")}</DrawerSubmitButtonText>
                  )}
                </DrawerSubmitButton>
              </>
            ) : (
              <>
                <DrawerFieldGroup>
                  <DrawerLabel>{t("account.orderQuantity")}</DrawerLabel>
                  <DrawerInput
                    value={quantity}
                    onChangeText={setQuantity}
                    placeholder="0"
                    placeholderTextColor={colors.textTertiary}
                    keyboardType="decimal-pad"
                    editable={!submitting}
                  />
                </DrawerFieldGroup>
                <DrawerFieldGroup>
                  <DrawerLabel>{t("account.price")}</DrawerLabel>
                  <DrawerInput
                    value={price}
                    onChangeText={setPrice}
                    placeholder="0.00"
                    placeholderTextColor={colors.textTertiary}
                    keyboardType="decimal-pad"
                    editable={!submitting}
                  />
                </DrawerFieldGroup>
                {error && <DrawerErrorText>{error}</DrawerErrorText>}
                <TouchableOpacity
                  style={{
                    paddingVertical: 12,
                    borderRadius: 10,
                    alignItems: "center",
                    borderWidth: 1,
                    marginTop: 8,
                    borderColor: colors.border,
                  }}
                  onPress={() => setStep("order")}
                  disabled={submitting}
                >
                  <Text style={{ fontSize: 16, color: colors.text }}>{t("account.back")}</Text>
                </TouchableOpacity>
                <DrawerSubmitButton
                  style={{ opacity: (submitting || !price) ? 0.5 : 1 }}
                  onPress={handleCreateTrade}
                  disabled={submitting || !price}
                >
                  {submitting ? (
                    <ActivityIndicator size="small" color="#fff" />
                  ) : (
                    <DrawerSubmitButtonText>{t("account.executeTrade")}</DrawerSubmitButtonText>
                  )}
                </DrawerSubmitButton>
              </>
            )}
          </ScrollView>
          </DrawerSafe>
        </DrawerSheet>
      </DrawerModalRoot>
    </Modal>
  );
}
