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
import { SafeAreaView } from "react-native-safe-area-context";
import { getPaymentFormData, createPayment } from "@/src/infrastructure/api";
import type { AccountResource } from "@/src/domain/entities/accountResource";
import type { Payment } from "@/src/domain/entities/payment";
import { useDraggableDrawer } from "@/src/presentation/hooks";
import { useTheme } from "@/src/presentation/theme";
import {
  AbsoluteFill,
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
import styled from "styled-components/native";

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

  useEffect(() => {
    if (visible) {
      setLoadingAccounts(true);
      getPaymentFormData()
        .then(setAccounts)
        .finally(() => setLoadingAccounts(false));
    }
  }, [visible]);

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
      const created = await createPayment({
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
      <DrawerModalRoot>
        <DrawerBackdrop
          style={{ opacity: backdropOpacity }}
          pointerEvents="box-none"
        >
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
              <DrawerHeaderTitle>{t("account.newPayment")}</DrawerHeaderTitle>
              <DrawerCloseButton onPress={handleClose}>
                <MaterialIcons name="close" size={24} color={colors.text} />
              </DrawerCloseButton>
            </DrawerHeader>

          <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 20, paddingBottom: 40 }} keyboardShouldPersistTaps="handled">
            {result ? (
              <ResultSection>
                <MaterialIcons name="check-circle" size={48} color={colors.success} />
                <ResultTitle>{t("account.paymentSuccess")}</ResultTitle>
                {(result.fraud_recommendation != null || result.fraud_score != null) && (
                  <FraudRow>
                    <FraudLabel>{t("account.fraudRecommendation")}</FraudLabel>
                    <FraudValue>
                      {result.fraud_recommendation ?? "-"}
                      {result.fraud_score != null && ` (${(result.fraud_score * 100).toFixed(0)}%)`}
                    </FraudValue>
                  </FraudRow>
                )}
                <DoneButton onPress={handleClose}>
                  <DoneButtonText>{t("common.close")}</DoneButtonText>
                </DoneButton>
              </ResultSection>
            ) : (
              <>
                <DrawerFieldGroup>
                  <DrawerLabel>{t("account.selectAccount")}</DrawerLabel>
                  {loadingAccounts ? (
                    <ActivityIndicator size="small" color={colors.primary} />
                  ) : (
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ flexGrow: 0 }}>
                      {accounts.map((acc) => {
                        const selected = accountId === acc.account_id;
                        return (
                          <AccountChip
                            key={acc.account_id}
                            selected={selected}
                            onPress={() => setAccountId(acc.account_id)}
                          >
                            <AccountChipText selected={selected} numberOfLines={1}>
                              {acc.account_type} · {acc.currency}
                            </AccountChipText>
                          </AccountChip>
                        );
                      })}
                    </ScrollView>
                  )}
                </DrawerFieldGroup>
                <DrawerFieldGroup>
                  <DrawerLabel>{t("account.amount")}</DrawerLabel>
                  <DrawerInput
                    value={amount}
                    onChangeText={setAmount}
                    placeholder="0.00"
                    placeholderTextColor={colors.textTertiary}
                    keyboardType="decimal-pad"
                    editable={!submitting}
                  />
                </DrawerFieldGroup>
                <DrawerFieldGroup>
                  <DrawerLabel>{t("account.counterparty")}</DrawerLabel>
                  <DrawerInput
                    value={counterparty}
                    onChangeText={setCounterparty}
                    placeholder={t("account.counterpartyPlaceholder")}
                    placeholderTextColor={colors.textTertiary}
                    editable={!submitting}
                  />
                </DrawerFieldGroup>
                {error && <DrawerErrorText>{error}</DrawerErrorText>}
                <DrawerSubmitButton
                  style={(submitting || !accountId || !amount) && { opacity: 0.5 }}
                  onPress={handleSubmit}
                  disabled={submitting || !accountId || !amount}
                >
                  {submitting ? (
                    <ActivityIndicator size="small" color="#fff" />
                  ) : (
                    <DrawerSubmitButtonText>{t("account.submit")}</DrawerSubmitButtonText>
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

const ResultSection = styled.View`
  align-items: center;
  padding-top: 20px;
`;

const ResultTitle = styled.Text`
  font-size: 18px;
  font-weight: 600;
  margin-top: 16px;
  color: ${(p) => p.theme.colors.text};
`;

const FraudRow = styled.View`
  margin-top: 16px;
  padding-vertical: 12px;
  padding-horizontal: 20px;
  border-radius: 10px;
  align-self: stretch;
  background-color: ${(p) => p.theme.colors.surface};
`;

const FraudLabel = styled.Text`
  font-size: 13px;
  margin-bottom: 4px;
  color: ${(p) => p.theme.colors.textSecondary};
`;

const FraudValue = styled.Text`
  font-size: 15px;
  font-weight: 600;
  color: ${(p) => p.theme.colors.text};
`;

const DoneButton = styled(TouchableOpacity)`
  margin-top: 24px;
  padding-vertical: 12px;
  padding-horizontal: 32px;
  border-radius: 10px;
  background-color: ${(p) => p.theme.colors.primary};
`;

const DoneButtonText = styled.Text`
  color: #fff;
  font-size: 16px;
  font-weight: 600;
`;

const AccountChip = styled(TouchableOpacity)<{ selected: boolean }>`
  padding-vertical: 10px;
  padding-horizontal: 16px;
  border-radius: 10px;
  margin-right: 8px;
  border-width: 1px;
  background-color: ${(p) => (p.selected ? p.theme.colors.primaryLight : p.theme.colors.surface)};
  border-color: ${(p) => (p.selected ? p.theme.colors.primary : p.theme.colors.border)};
`;

const AccountChipText = styled.Text<{ selected: boolean }>`
  font-size: 14px;
  color: ${(p) => (p.selected ? p.theme.colors.primary : p.theme.colors.text)};
`;
