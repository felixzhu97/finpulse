import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { useMemo, useState } from "react";
import {
  Animated,
  Dimensions,
  FlatList,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useDraggableDrawer } from "@/src/hooks/useDraggableDrawer";
import type { Instrument } from "@/src/types";

interface AddSymbolModalProps {
  visible: boolean;
  instruments: Instrument[];
  onSelect: (instrumentId: string) => void;
  onClose: () => void;
}

const { height: SCREEN_HEIGHT } = Dimensions.get("window");
const DRAWER_HEIGHT = Math.min(SCREEN_HEIGHT * 0.7, 520);

export function AddSymbolModal({
  visible,
  instruments,
  onSelect,
  onClose,
}: AddSymbolModalProps) {
  const [search, setSearch] = useState("");

  const { slideAnim, dragOffset, panHandlers, backdropOpacity, closeWithAnimation } =
    useDraggableDrawer({ visible, drawerHeight: DRAWER_HEIGHT, onClose });

  const filtered = useMemo(() => {
    const q = search.trim().toUpperCase();
    if (!q) return instruments.slice(0, 50);
    return instruments
      .filter(
        (i) =>
          (i.symbol && i.symbol.toUpperCase().includes(q)) ||
          (i.name && i.name.toUpperCase().includes(q))
      )
      .slice(0, 50);
  }, [instruments, search]);

  const handleSelect = (instrumentId: string) => {
    onSelect(instrumentId);
    setSearch("");
    closeWithAnimation();
  };

  return (
    <Modal visible={visible} animationType="none" transparent onRequestClose={closeWithAnimation}>
      <View style={styles.modalRoot}>
        <Animated.View style={[styles.backdrop, { opacity: backdropOpacity }]} pointerEvents="box-none">
          <Pressable style={StyleSheet.absoluteFill} onPress={closeWithAnimation} />
        </Animated.View>
        <Animated.View
          style={[
            styles.drawer,
            {
              height: DRAWER_HEIGHT,
              transform: [
                { translateY: Animated.add(slideAnim, dragOffset) },
              ],
            },
          ]}
        >
          <SafeAreaView style={styles.safe} edges={["top"]}>
            <View style={styles.dragArea} {...panHandlers}>
              <View style={styles.dragHandle} />
            </View>
            <View style={styles.header}>
              <Text style={styles.title}>Add symbol</Text>
              <Pressable onPress={closeWithAnimation} hitSlop={12} style={styles.closeBtn}>
                <MaterialIcons name="close" size={22} color="#fff" />
              </Pressable>
            </View>
            <TextInput
              style={styles.input}
              value={search}
              onChangeText={setSearch}
              placeholder="Search by symbol or name"
              placeholderTextColor="rgba(255,255,255,0.4)"
              autoCapitalize="characters"
            />
            <FlatList
              data={filtered}
              keyExtractor={(item) => item.instrument_id}
              style={styles.list}
              keyboardShouldPersistTaps="handled"
              renderItem={({ item }) => (
                <Pressable
                  style={styles.row}
                  onPress={() => handleSelect(item.instrument_id)}
                >
                  <Text style={styles.symbol}>{item.symbol}</Text>
                  {item.name ? (
                    <Text style={styles.name} numberOfLines={1}>
                      {item.name}
                    </Text>
                  ) : null}
                </Pressable>
              )}
              ListEmptyComponent={
                <Text style={styles.empty}>
                  {search.trim() ? "No instruments found." : "Loading..."}
                </Text>
              }
            />
          </SafeAreaView>
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalRoot: {
    flex: 1,
    justifyContent: "flex-end",
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "#000",
  },
  drawer: {
    backgroundColor: "#000",
    borderTopLeftRadius: 14,
    borderTopRightRadius: 14,
    overflow: "hidden",
  },
  safe: {
    flex: 1,
  },
  dragArea: {
    paddingTop: 8,
    paddingBottom: 4,
    alignItems: "center",
    minHeight: 32,
  },
  dragHandle: {
    width: 36,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: "rgba(255,255,255,0.3)",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  title: {
    fontSize: 18,
    fontWeight: "600",
    color: "#fff",
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "rgba(255,255,255,0.12)",
    alignItems: "center",
    justifyContent: "center",
  },
  input: {
    marginHorizontal: 16,
    marginBottom: 12,
    backgroundColor: "rgba(255,255,255,0.08)",
    borderRadius: 10,
    padding: 12,
    fontSize: 16,
    color: "#fff",
  },
  list: {
    flex: 1,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "rgba(255,255,255,0.08)",
  },
  symbol: {
    fontSize: 16,
    fontWeight: "600",
    color: "#fff",
    width: 72,
  },
  name: {
    flex: 1,
    fontSize: 14,
    color: "rgba(255,255,255,0.6)",
  },
  empty: {
    padding: 20,
    fontSize: 14,
    color: "rgba(255,255,255,0.5)",
    textAlign: "center",
  },
});
