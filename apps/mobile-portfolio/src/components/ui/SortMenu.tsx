import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { useState } from "react";
import {
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export type SortOption = "name" | "price" | "change" | "changePercent";

interface SortMenuProps {
  currentSort: SortOption;
  onSelect: (option: SortOption) => void;
  onOpen?: () => void;
}

const SORT_OPTIONS: { value: SortOption; label: string }[] = [
  { value: "name", label: "Name" },
  { value: "price", label: "Price" },
  { value: "change", label: "Change" },
  { value: "changePercent", label: "Change %" },
];

export function SortMenu({ currentSort, onSelect, onOpen }: SortMenuProps) {
  const [visible, setVisible] = useState(false);

  const handleSelect = (option: SortOption) => {
    onSelect(option);
    setVisible(false);
  };

  const handleOpen = () => {
    onOpen?.();
    setVisible(true);
  };

  return (
    <>
      <Pressable
        onPress={handleOpen}
        style={styles.button}
        hitSlop={8}
      >
        <MaterialIcons name="sort" size={22} color="#fff" />
      </Pressable>
      <Modal
        visible={visible}
        transparent
        animationType="fade"
        onRequestClose={() => setVisible(false)}
      >
        <Pressable
          style={styles.overlay}
          onPress={() => setVisible(false)}
        >
          <View style={styles.sheet}>
            <SafeAreaView edges={["bottom"]}>
              <View style={styles.header}>
                <Text style={styles.headerTitle}>Sort by</Text>
                <Pressable
                  onPress={() => setVisible(false)}
                  hitSlop={8}
                >
                  <MaterialIcons name="close" size={22} color="#fff" />
                </Pressable>
              </View>
              {SORT_OPTIONS.map((option) => (
                <Pressable
                  key={option.value}
                  style={styles.option}
                  onPress={() => handleSelect(option.value)}
                >
                  <Text style={styles.optionText}>{option.label}</Text>
                  {currentSort === option.value && (
                    <MaterialIcons
                      name="check"
                      size={20}
                      color="#0A84FF"
                    />
                  )}
                </Pressable>
              ))}
            </SafeAreaView>
          </View>
        </Pressable>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  button: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
  },
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  sheet: {
    backgroundColor: "#1c1c1e",
    borderTopLeftRadius: 14,
    borderTopRightRadius: 14,
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  headerTitle: {
    fontSize: 13,
    fontWeight: "600",
    color: "rgba(255,255,255,0.5)",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  option: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "rgba(255,255,255,0.08)",
  },
  optionText: {
    fontSize: 17,
    color: "#fff",
    fontWeight: "400",
  },
});
