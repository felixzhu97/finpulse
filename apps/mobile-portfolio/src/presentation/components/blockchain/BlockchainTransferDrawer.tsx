import { useState, useEffect } from "react";
import {
  Text,
  View,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  ScrollView,
  Animated,
  Dimensions,
  Modal,
} from "react-native";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { useDraggableDrawer } from "@/src/presentation/hooks/useDraggableDrawer";
import {
  AbsoluteFill,
  DrawerModalRoot,
  DrawerBackdrop,
  DrawerSheet,
  DrawerSafe,
  DrawerDragArea,
  DrawerHandle,
  DrawerFieldGroup,
  DrawerLabel,
  DrawerInput,
  DrawerSubmitButton,
  DrawerSubmitButtonText,
} from "@/src/presentation/theme/primitives";
import { useBlockchain } from "@/src/presentation/hooks/useBlockchain";
import { useTheme } from "@/src/presentation/theme";
import { useTranslation } from "@/src/presentation/i18n";
import type { Account } from "@/src/core/domain/entities/portfolio";
import type { AccountResource } from "@/src/core/domain/entities/accountResource";

const { height: SCREEN_HEIGHT } = Dimensions.get("window");
const DRAWER_HEIGHT = Math.min(SCREEN_HEIGHT * 0.75, 600);

interface BlockchainTransferDrawerProps {
  visible: boolean;
  onClose: () => void;
  accounts: Account[];
  accountResources?: AccountResource[];
  senderAccountId?: string;
}

export function BlockchainTransferDrawer({
  visible,
  onClose,
  accounts,
  accountResources = [],
  senderAccountId,
}: BlockchainTransferDrawerProps) {
  const { colors } = useTheme();
  const { t } = useTranslation();
  const { slideAnim, dragOffset, panHandlers, backdropOpacity, closeWithAnimation } =
    useDraggableDrawer({ visible, drawerHeight: DRAWER_HEIGHT, onClose });
  const { submitTransfer, loading } = useBlockchain();

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

  const [selectedSender, setSelectedSender] = useState<string>(
    senderAccountId ?? (accounts[0] ? getAccountUuid(accounts[0], 0) : "")
  );
  const [selectedReceiver, setSelectedReceiver] = useState<string>("");
  const [amount, setAmount] = useState<string>("");
  const [currency, setCurrency] = useState<string>("SIM_COIN");

  useEffect(() => {
    if (visible && accounts.length > 0) {
      const defaultId = senderAccountId ?? (accounts[0] ? getAccountUuid(accounts[0], 0) : "");
      setSelectedSender(defaultId);
    }
  }, [visible, accounts, senderAccountId, accountResources]);

  const handleClose = () => {
    setAmount("");
    setSelectedReceiver("");
    setCurrency("SIM_COIN");
    closeWithAnimation();
  };

  const handleSubmit = async () => {
    if (!selectedSender || !selectedReceiver || !amount) {
      Alert.alert(t("blockchain.error"), t("blockchain.fillAllFields"));
      return;
    }

    const amountNum = parseFloat(amount);
    if (isNaN(amountNum) || amountNum <= 0) {
      Alert.alert(t("blockchain.error"), t("blockchain.invalidAmount"));
      return;
    }

    try {
      const result = await submitTransfer({
        sender_account_id: selectedSender,
        receiver_account_id: selectedReceiver,
        amount: amountNum,
        currency,
      });

      if (result) {
        Alert.alert(t("blockchain.success"), t("blockchain.transferSuccess"), [
          { text: t("common.close"), onPress: handleClose },
        ]);
        setAmount("");
        setSelectedReceiver("");
      } else {
        Alert.alert(t("blockchain.error"), t("blockchain.transferFailed"));
      }
    } catch (error) {
      Alert.alert(t("blockchain.error"), t("blockchain.transferFailed"));
    }
  };

  const translateY = Animated.add(slideAnim, dragOffset);

  return (
    <Modal visible={visible} transparent animationType="none" onRequestClose={handleClose}>
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
          <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 20, paddingBottom: 40 }}>
        <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
          <Text style={{ fontSize: 24, fontWeight: "700", color: colors.text }}>
            {t("blockchain.transfer")}
          </Text>
          <TouchableOpacity onPress={handleClose} style={{ padding: 4 }}>
            <MaterialIcons name="close" size={24} color={colors.text} />
          </TouchableOpacity>
        </View>

        <DrawerFieldGroup>
          <DrawerLabel>{t("blockchain.senderAccount")}</DrawerLabel>
          <View style={{ borderWidth: 1, borderRadius: 10, overflow: "hidden", backgroundColor: colors.surface, borderColor: colors.border }}>
            {accounts.map((account, index) => {
              const accountUuid = getAccountUuid(account, index);
              return (
                <TouchableOpacity
                  key={account.id}
                  style={{
                    flexDirection: "row",
                    justifyContent: "space-between",
                    alignItems: "center",
                    padding: 12,
                    borderBottomWidth: 1,
                    borderBottomColor: colors.border,
                    backgroundColor: selectedSender === accountUuid ? colors.primary + "20" : undefined,
                  }}
                  onPress={() => setSelectedSender(accountUuid)}
                >
                  <Text style={{ fontSize: 16, color: colors.text }}>
                    {account.name}
                  </Text>
                  {selectedSender === accountUuid && (
                    <MaterialIcons name="check" size={20} color={colors.primary} />
                  )}
                </TouchableOpacity>
              );
            })}
          </View>
        </DrawerFieldGroup>

        <DrawerFieldGroup>
          <DrawerLabel>{t("blockchain.receiverAccount")}</DrawerLabel>
          <View style={{ borderWidth: 1, borderRadius: 10, overflow: "hidden", backgroundColor: colors.surface, borderColor: colors.border }}>
            {accounts.map((account, index) => {
              const accountUuid = getAccountUuid(account, index);
              return (
                <TouchableOpacity
                  key={account.id}
                  style={{
                    flexDirection: "row",
                    justifyContent: "space-between",
                    alignItems: "center",
                    padding: 12,
                    borderBottomWidth: 1,
                    borderBottomColor: colors.border,
                    backgroundColor: selectedReceiver === accountUuid ? colors.primary + "20" : undefined,
                  }}
                  onPress={() => setSelectedReceiver(accountUuid)}
                >
                  <Text style={{ fontSize: 16, color: colors.text }}>
                    {account.name}
                  </Text>
                  {selectedReceiver === accountUuid && (
                    <MaterialIcons name="check" size={20} color={colors.primary} />
                  )}
                </TouchableOpacity>
              );
            })}
          </View>
        </DrawerFieldGroup>

        <DrawerFieldGroup>
          <DrawerLabel>{t("blockchain.amount")}</DrawerLabel>
          <DrawerInput
            value={amount}
            onChangeText={setAmount}
            placeholder={t("blockchain.amountPlaceholder")}
            placeholderTextColor={colors.textSecondary}
            keyboardType="decimal-pad"
          />
        </DrawerFieldGroup>

        <DrawerFieldGroup>
          <DrawerLabel>{t("blockchain.currency")}</DrawerLabel>
          <DrawerInput
            value={currency}
            onChangeText={setCurrency}
            placeholder="SIM_COIN"
            placeholderTextColor={colors.textSecondary}
          />
        </DrawerFieldGroup>

        <DrawerSubmitButton onPress={handleSubmit} disabled={loading}>
          {loading ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <DrawerSubmitButtonText>{t("blockchain.submitTransfer")}</DrawerSubmitButtonText>
          )}
        </DrawerSubmitButton>
      </ScrollView>
          </DrawerSafe>
        </DrawerSheet>
      </DrawerModalRoot>
    </Modal>
  );
}
