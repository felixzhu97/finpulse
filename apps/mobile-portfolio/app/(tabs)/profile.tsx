import { SafeAreaView, Text, View } from "react-native";

export default function ProfileScreen() {
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#f3f4f6" }}>
      <View
        style={{
          flex: 1,
          alignItems: "center",
          justifyContent: "center",
          paddingHorizontal: 16,
        }}
      >
        <Text
          style={{
            fontSize: 18,
            fontWeight: "600",
            marginBottom: 8,
          }}
        >
          Profile
        </Text>
        <Text
          style={{
            fontSize: 13,
            color: "#4b5563",
            textAlign: "center",
          }}
        >
          This screen is a placeholder for settings such as currency
          preferences, notifications, and linked data sources.
        </Text>
      </View>
    </SafeAreaView>
  );
}

