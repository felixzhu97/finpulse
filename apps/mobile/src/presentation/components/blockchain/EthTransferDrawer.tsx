import { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  ScrollView,
  Animated,
  Dimensions,
  Modal,
} from "react-native";
import { ethers } from "ethers";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { useDraggableDrawer } from "@/src/presentation/hooks";
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
import { useWeb3, SEPOLIA_CHAIN_ID } from "@/src/presentation/hooks";
import { useTheme } from "@/src/presentation/theme";
import { useTranslation } from "@/src/presentation/i18n";
import { web3Service } from "@/src/infrastructure/services";

const { height: SCREEN_HEIGHT } = Dimensions.get("window");
const DRAWER_HEIGHT = Math.min(SCREEN_HEIGHT * 0.75, 560);

function shortAddress(addr: string): string {
  if (addr.length < 12) return addr;
  return `${addr.slice(0, 6)}…${addr.slice(-4)}`;
}

interface EthTransferDrawerProps {
  visible: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export function EthTransferDrawer({ visible, onClose, onSuccess }: EthTransferDrawerProps) {
  const { colors } = useTheme();
  const { t } = useTranslation();
  const { walletInfo, loading: web3Loading, error: web3Error, refreshBalance } = useWeb3();
  const { slideAnim, dragOffset, panHandlers, backdropOpacity, closeWithAnimation } =
    useDraggableDrawer({ visible, drawerHeight: DRAWER_HEIGHT, onClose });

  const [toAddress, setToAddress] = useState("");
  const [amount, setAmount] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleClose = () => {
    setToAddress("");
    setAmount("");
    setError(null);
    closeWithAnimation();
  };

  const handleSubmit = async () => {
    setError(null);
    const toRaw = toAddress.trim();
    const amountTrim = amount.trim();
    if (!toRaw || !amountTrim) {
      setError(t("blockchain.fillAllFields"));
      return;
    }

    let normalizedTo: string;
    try {
      normalizedTo = ethers.getAddress(toRaw);
    } catch {
      setError(t("blockchain.invalidAddress"));
      return;
    }

    let amountEth: string;
    try {
      ethers.parseEther(amountTrim);
      amountEth = amountTrim;
    } catch {
      setError(t("blockchain.invalidAmount"));
      return;
    }

    const amountNum = parseFloat(amountEth);
    if (!Number.isFinite(amountNum) || amountNum <= 0) {
      setError(t("blockchain.invalidAmount"));
      return;
    }

    const balanceNum = walletInfo?.balance != null ? parseFloat(walletInfo.balance) : 0;
    if (amountNum > balanceNum) {
      setError(t("blockchain.insufficientBalance"));
      return;
    }

    const networkLabel = walletInfo?.chainName ?? "Ethereum";
    const shortTo = shortAddress(normalizedTo);
    Alert.alert(
      t("blockchain.confirmSendTitle"),
      `${t("blockchain.network")}: ${networkLabel}\n${t("blockchain.toAddress")}: ${shortTo}\n${t("blockchain.amountEth")}: ${amountEth} ETH`,
      [
        { text: t("common.close"), style: "cancel" },
        {
          text: t("blockchain.sendEth"),
          onPress: async () => {
            setSubmitting(true);
            setError(null);
            try {
              const tx = await web3Service.sendTransaction(normalizedTo, amountEth);
              if (tx) {
                onSuccess?.();
                refreshBalance();
                handleClose();
                Alert.alert(t("blockchain.success"), t("blockchain.sendEthSuccess"));
              } else {
                setError(t("blockchain.sendEthFailed"));
              }
            } catch {
              setError(t("blockchain.sendEthFailed"));
            } finally {
              setSubmitting(false);
            }
          },
        },
      ]
    );
  };

  const translateY = Animated.add(slideAnim, dragOffset);
  const isConnected = walletInfo?.isConnected ?? false;

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
            <DrawerHeader>
              <DrawerHeaderTitle>{t("blockchain.sendEth")}</DrawerHeaderTitle>
              <DrawerCloseButton onPress={handleClose}>
                <MaterialIcons name="close" size={24} color={colors.text} />
              </DrawerCloseButton>
            </DrawerHeader>
            <ScrollView
              style={{ flex: 1 }}
              contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 12, paddingBottom: 40 }}
              keyboardShouldPersistTaps="handled"
            >
              {!isConnected ? (
                <View style={{ paddingVertical: 24, alignItems: "center" }}>
                  <Text style={{ fontSize: 16, color: colors.textSecondary, textAlign: "center" }}>
                    {t("blockchain.walletRequired")}
                  </Text>
                </View>
              ) : (
                <>
                  {walletInfo?.chainId === SEPOLIA_CHAIN_ID && (
                    <View style={{ marginBottom: 16, padding: 12, borderRadius: 10, backgroundColor: colors.surface }}>
                      <Text style={{ fontSize: 13, color: colors.textSecondary }}>{t("blockchain.testnetFaucetHint")}</Text>
                    </View>
                  )}
                  {walletInfo?.balance != null && (
                    <DrawerFieldGroup>
                      <DrawerLabel>{t("blockchain.ethBalance")}</DrawerLabel>
                      <Text style={{ fontSize: 18, fontWeight: "600", color: colors.text }}>
                        {walletInfo.balance} ETH
                      </Text>
                    </DrawerFieldGroup>
                  )}
                  <DrawerFieldGroup>
                    <DrawerLabel>{t("blockchain.toAddress")}</DrawerLabel>
                    <DrawerInput
                      value={toAddress}
                      onChangeText={setToAddress}
                      placeholder="0x..."
                      placeholderTextColor={colors.textTertiary}
                      autoCapitalize="none"
                      autoCorrect={false}
                      editable={!submitting}
                    />
                  </DrawerFieldGroup>
                  <DrawerFieldGroup>
                    <DrawerLabel>{t("blockchain.amountEth")}</DrawerLabel>
                    <DrawerInput
                      value={amount}
                      onChangeText={setAmount}
                      placeholder="0"
                      placeholderTextColor={colors.textTertiary}
                      keyboardType="decimal-pad"
                      editable={!submitting}
                    />
                  </DrawerFieldGroup>
                  {web3Error && (
                    <DrawerErrorText>{web3Error}</DrawerErrorText>
                  )}
                  {error && <DrawerErrorText>{error}</DrawerErrorText>}
                  <DrawerSubmitButton
                    onPress={handleSubmit}
                    disabled={submitting || web3Loading}
                    style={{ opacity: submitting || web3Loading ? 0.6 : 1 }}
                  >
                    {submitting ? (
                      <ActivityIndicator size="small" color="#fff" />
                    ) : (
                      <DrawerSubmitButtonText>{t("blockchain.sendEth")}</DrawerSubmitButtonText>
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
