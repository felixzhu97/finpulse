import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Text, TouchableOpacity, View } from "react-native";
import StorybookUIRoot from "../.rnstorybook";

export default function StorybookScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#000" }}>
      <View
        style={{
          paddingHorizontal: 16,
          paddingVertical: 12,
          borderBottomWidth: 1,
          borderBottomColor: "rgba(255,255,255,0.1)",
          flexDirection: "row",
          alignItems: "center",
        }}
      >
        <TouchableOpacity
          onPress={() => router.back()}
          style={{ paddingVertical: 4, paddingRight: 16, paddingLeft: 4 }}
        >
          <Text style={{ color: "#fff", fontSize: 16 }}>Back</Text>
        </TouchableOpacity>
        <Text
          style={{
            color: "#fff",
            fontSize: 16,
            fontWeight: "600",
          }}
        >
          Storybook
        </Text>
      </View>
      <View style={{ flex: 1 }}>
        <StorybookUIRoot />
      </View>
    </SafeAreaView>
  );
}

