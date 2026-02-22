import { useState } from "react";
import { ActivityIndicator, Alert, TouchableOpacity, View } from "react-native";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
// Haptic may be unavailable in Expo Go (native module not registered)
function triggerHaptic(type: string): void {
  try {
    const mod = require("react-native-haptic-feedback");
    mod.default?.trigger?.(type, { enableVibrateFallback: true });
  } catch {
    // no-op
  }
}
import { useWeb3, SEPOLIA_CHAIN_ID } from "@/src/presentation/hooks";
import { useTranslation } from "@/src/presentation/i18n";
import { useTheme } from "@/src/presentation/theme";
import styled from "styled-components/native";

const Button = styled(TouchableOpacity)`
  flex-direction: row;
  align-items: center;
  justify-content: center;
  padding-vertical: 14px;
  padding-horizontal: 22px;
  border-radius: 12px;
  gap: 8px;
  background-color: ${(p) => p.theme.colors.primary};
  min-height: 50px;
`;

const ButtonText = styled.Text`
  color: ${(p) => p.theme.colors.onPrimary};
  font-size: 17px;
  font-weight: 600;
  letter-spacing: -0.41px;
`;

const ErrorText = styled.Text`
  margin-top: 8px;
  font-size: 13px;
  color: ${(p) => p.theme.colors.error};
`;

const ConnectedCard = styled.View`
  margin-top: 0;
`;

const ConnectedRow = styled.View`
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  padding-vertical: 10px;
`;

const ConnectedLabel = styled.Text`
  font-size: 14px;
  color: ${(p) => p.theme.colors.textSecondary};
`;

const ConnectedValue = styled.Text`
  font-size: 15px;
  font-weight: 500;
  color: ${(p) => p.theme.colors.text};
`;

const DisconnectButton = styled(TouchableOpacity)`
  margin-top: 14px;
  padding-vertical: 12px;
  padding-horizontal: 20px;
  border-radius: 12px;
  border-width: 1px;
  border-color: ${(p) => p.theme.colors.border};
  flex-direction: row;
  align-items: center;
  justify-content: center;
  gap: 6px;
  min-height: 48px;
`;

const DisconnectButtonText = styled.Text`
  font-size: 17px;
  font-weight: 500;
  letter-spacing: -0.41px;
  color: ${(p) => p.theme.colors.primary};
`;

const TestnetHint = styled.Text`
  margin-top: 8px;
  font-size: 12px;
  color: ${(p) => p.theme.colors.textSecondary};
`;

function shortAddress(addr: string): string {
  if (!addr || addr.length < 12) return addr;
  return `${addr.slice(0, 6)}…${addr.slice(-4)}`;
}

export function WalletConnectButton() {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const { walletInfo, loading, error, connect, disconnect, isConnected } = useWeb3();
  const [connecting, setConnecting] = useState(false);

  const showLoading = connecting || loading;

  const handleConnect = async () => {
    setConnecting(true);
    try {
      const info = await connect();
      if (info != null) {
        triggerHaptic("notificationSuccess");
      } else {
        Alert.alert(t("blockchain.error"), t("blockchain.connectFailed"));
      }
    } finally {
      setConnecting(false);
    }
  };

  const handleDisconnect = async () => {
    await disconnect();
  };

  if (isConnected && walletInfo) {
    return (
      <View>
        <ConnectedCard>
          <ConnectedRow>
            <ConnectedLabel>{t("blockchain.connected")}</ConnectedLabel>
            <ConnectedValue>{shortAddress(walletInfo.address)}</ConnectedValue>
          </ConnectedRow>
          {walletInfo.chainName != null && (
            <ConnectedRow>
              <ConnectedLabel>{t("blockchain.network")}</ConnectedLabel>
              <ConnectedValue>{walletInfo.chainName}</ConnectedValue>
            </ConnectedRow>
          )}
          {walletInfo.balance != null && (
            <ConnectedRow>
              <ConnectedLabel>{t("blockchain.ethBalance")}</ConnectedLabel>
              <ConnectedValue>{walletInfo.balance} ETH</ConnectedValue>
            </ConnectedRow>
          )}
          {walletInfo.chainId === SEPOLIA_CHAIN_ID && (
            <TestnetHint>{t("blockchain.testnetNotice")}</TestnetHint>
          )}
          <DisconnectButton onPress={handleDisconnect} activeOpacity={0.7}>
            <MaterialIcons name="link-off" size={20} color={colors.primary} />
            <DisconnectButtonText>{t("blockchain.disconnect")}</DisconnectButtonText>
          </DisconnectButton>
        </ConnectedCard>
        {error ? <ErrorText>{error}</ErrorText> : null}
      </View>
    );
  }

  return (
    <View>
      <Button onPress={handleConnect} disabled={showLoading} activeOpacity={0.7}>
        {showLoading ? (
          <ActivityIndicator size="small" color={colors.onPrimary} />
        ) : (
          <>
            <MaterialIcons name="link" size={20} color={colors.onPrimary} />
            <ButtonText>{t("blockchain.connectWallet")}</ButtonText>
          </>
        )}
      </Button>
      {error ? <ErrorText>{error}</ErrorText> : null}
    </View>
  );
}
