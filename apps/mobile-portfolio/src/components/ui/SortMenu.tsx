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
import { useTheme } from "@/src/theme";

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
  const { colors } = useTheme();
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
        <MaterialIcons name="sort" size={22} color={colors.text} />
      </Pressable>
      <Modal
        visible={visible}
        transparent
        animationType="fade"
        onRequestClose={() => setVisible(false)}
      >
        <Pressable
          style={[styles.overlay, { backgroundColor: colors.backdrop }]}
          onPress={() => setVisible(false)}
        >
          <View style={[styles.sheet, { backgroundColor: colors.card }]}>
            <SafeAreaView edges={["bottom"]}>
              <View style={styles.header}>
                <Text style={[styles.headerTitle, { color: colors.textTertiary }]}>Sort by</Text>
                <Pressable
                  onPress={() => setVisible(false)}
                  hitSlop={8}
                >
                  <MaterialIcons name="close" size={22} color={colors.text} />
                </Pressable>
              </View>
              {SORT_OPTIONS.map((option) => (
                <Pressable
                  key={option.value}
                  style={[styles.option, { borderBottomColor: colors.border }]}
                  onPress={() => handleSelect(option.value)}
                >
                  <Text style={[styles.optionText, { color: colors.text }]}>{option.label}</Text>
                  {currentSort === option.value && (
                    <MaterialIcons
                      name="check"
                      size={20}
                      color={colors.primary}
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
    justifyContent: "flex-end",
  },
  sheet: {
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
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  option: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  optionText: {
    fontSize: 17,
    fontWeight: "400",
  },
});
