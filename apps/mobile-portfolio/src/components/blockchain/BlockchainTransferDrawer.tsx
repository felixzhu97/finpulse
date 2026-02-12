import { useState, useEffect } from "react";
import {
  StyleSheet,
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
  Pressable,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { useDraggableDrawer } from "@/src/hooks";
import { useBlockchain } from "@/src/hooks";
import { useTheme } from "@/src/theme";
import { useTranslation } from "@/src/i18n";
import type { Account } from "@/src/types";
import type { AccountResource } from "@/src/api";

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
      <Pressable style={styles.modalBackdrop} onPress={handleClose}>
        <Animated.View
          style={[
            styles.backdrop,
            {
              opacity: backdropOpacity,
            },
          ]}
        />
      </Pressable>
      <Animated.View
        style={[
          styles.drawer,
          {
            backgroundColor: colors.background,
            height: DRAWER_HEIGHT,
            transform: [{ translateY }],
          },
        ]}
        {...panHandlers}
      >
        <SafeAreaView edges={["bottom"]} style={styles.safeArea}>
          <View style={styles.handleContainer}>
            <View style={[styles.handle, { backgroundColor: colors.border }]} />
          </View>
          <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
        <View style={styles.header}>
          <Text style={[styles.title, { color: colors.text }]}>
            {t("blockchain.transfer")}
          </Text>
          <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
            <MaterialIcons name="close" size={24} color={colors.text} />
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={[styles.label, { color: colors.text }]}>
            {t("blockchain.senderAccount")}
          </Text>
          <View style={[styles.picker, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            {accounts.map((account, index) => {
              const accountUuid = getAccountUuid(account, index);
              return (
                <TouchableOpacity
                  key={account.id}
                  style={[
                    styles.pickerOption,
                    selectedSender === accountUuid && { backgroundColor: colors.primary + "20" },
                  ]}
                  onPress={() => setSelectedSender(accountUuid)}
                >
                  <Text style={[styles.pickerOptionText, { color: colors.text }]}>
                    {account.name}
                  </Text>
                  {selectedSender === accountUuid && (
                    <MaterialIcons name="check" size={20} color={colors.primary} />
                  )}
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={[styles.label, { color: colors.text }]}>
            {t("blockchain.receiverAccount")}
          </Text>
          <View style={[styles.picker, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            {accounts.map((account, index) => {
              const accountUuid = getAccountUuid(account, index);
              return (
                <TouchableOpacity
                  key={account.id}
                  style={[
                    styles.pickerOption,
                    selectedReceiver === accountUuid && { backgroundColor: colors.primary + "20" },
                  ]}
                  onPress={() => setSelectedReceiver(accountUuid)}
                >
                  <Text style={[styles.pickerOptionText, { color: colors.text }]}>
                    {account.name}
                  </Text>
                  {selectedReceiver === accountUuid && (
                    <MaterialIcons name="check" size={20} color={colors.primary} />
                  )}
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={[styles.label, { color: colors.text }]}>
            {t("blockchain.amount")}
          </Text>
          <TextInput
            style={[styles.input, { backgroundColor: colors.surface, color: colors.text, borderColor: colors.border }]}
            value={amount}
            onChangeText={setAmount}
            placeholder={t("blockchain.amountPlaceholder")}
            placeholderTextColor={colors.textSecondary}
            keyboardType="decimal-pad"
          />
        </View>

        <View style={styles.section}>
          <Text style={[styles.label, { color: colors.text }]}>
            {t("blockchain.currency")}
          </Text>
          <TextInput
            style={[styles.input, { backgroundColor: colors.surface, color: colors.text, borderColor: colors.border }]}
            value={currency}
            onChangeText={setCurrency}
            placeholder="SIM_COIN"
            placeholderTextColor={colors.textSecondary}
          />
        </View>

        <TouchableOpacity
          style={[styles.submitButton, { backgroundColor: colors.primary }]}
          onPress={handleSubmit}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Text style={styles.submitButtonText}>{t("blockchain.submitTransfer")}</Text>
          )}
        </TouchableOpacity>
      </ScrollView>
        </SafeAreaView>
      </Animated.View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalBackdrop: {
    ...StyleSheet.absoluteFillObject,
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "#000",
  },
  drawer: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  safeArea: {
    flex: 1,
  },
  handleContainer: {
    alignItems: "center",
    paddingTop: 8,
    paddingBottom: 4,
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 20,
    paddingBottom: 40,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
  },
  closeButton: {
    padding: 4,
  },
  section: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderRadius: 10,
    padding: 12,
    fontSize: 16,
  },
  picker: {
    borderWidth: 1,
    borderRadius: 10,
    overflow: "hidden",
  },
  pickerOption: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#e0e0e0",
  },
  pickerOptionText: {
    fontSize: 16,
  },
  submitButton: {
    paddingVertical: 16,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 8,
  },
  submitButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
});
