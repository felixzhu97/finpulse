import { StyleSheet, Text, TouchableOpacity, View, ActivityIndicator } from "react-native";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { useWeb3 } from "@/src/presentation/hooks/useWeb3";
import { useTheme } from "@/src/presentation/theme";
import { useTranslation } from "@/src/presentation/i18n";

export function WalletConnectButton() {
  const { colors } = useTheme();
  const { t } = useTranslation();
  const { walletInfo, loading, connect, disconnect, isConnected } = useWeb3();

  const handlePress = async () => {
    if (isConnected) {
      await disconnect();
    } else {
      await connect();
    }
  };

  return (
    <TouchableOpacity
      style={[styles.button, { backgroundColor: colors.primary }]}
      onPress={handlePress}
      disabled={loading}
      activeOpacity={0.8}
    >
      {loading ? (
        <ActivityIndicator size="small" color="#fff" />
      ) : (
        <>
          <MaterialIcons
            name={isConnected ? "account-balance-wallet" : "link"}
            size={20}
            color="#fff"
          />
          <Text style={styles.buttonText}>
            {isConnected
              ? t("blockchain.disconnect")
              : t("blockchain.connectWallet")}
          </Text>
        </>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 10,
    gap: 8,
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
});
