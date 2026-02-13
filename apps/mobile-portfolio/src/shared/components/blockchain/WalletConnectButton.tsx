import { ActivityIndicator, TouchableOpacity } from "react-native";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { useWeb3 } from "@/src/shared/hooks/useWeb3";
import { useTheme } from "@/src/shared/theme";
import { useTranslation } from "@/src/shared/i18n";
import styled from "styled-components/native";

const Button = styled(TouchableOpacity)`
  flex-direction: row;
  align-items: center;
  justify-content: center;
  padding-vertical: 12px;
  padding-horizontal: 20px;
  border-radius: 10px;
  gap: 8px;
  background-color: ${(p) => p.theme.colors.primary};
`;

const ButtonText = styled.Text`
  color: #fff;
  font-size: 16px;
  font-weight: 600;
`;

export function WalletConnectButton() {
  const { t } = useTranslation();
  const { loading, connect, disconnect, isConnected } = useWeb3();

  const handlePress = async () => {
    if (isConnected) {
      await disconnect();
    } else {
      await connect();
    }
  };

  return (
    <Button onPress={handlePress} disabled={loading} activeOpacity={0.8}>
      {loading ? (
        <ActivityIndicator size="small" color="#fff" />
      ) : (
        <>
          <MaterialIcons
            name={isConnected ? "account-balance-wallet" : "link"}
            size={20}
            color="#fff"
          />
          <ButtonText>
            {isConnected ? t("blockchain.disconnect") : t("blockchain.connectWallet")}
          </ButtonText>
        </>
      )}
    </Button>
  );
}
