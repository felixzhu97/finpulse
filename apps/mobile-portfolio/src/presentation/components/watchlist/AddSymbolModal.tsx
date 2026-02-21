import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { useMemo, useState } from "react";
import { useTheme } from "@/src/presentation/theme";
import {
  Animated,
  Dimensions,
  FlatList,
  Modal,
  Pressable,
  Text,
  TextInput,
  View,
} from "react-native";
import { useDraggableDrawer } from "@/src/presentation/hooks";
import type { Instrument } from "@/src/domain/entities/instrument";
import {
  AbsoluteFill,
  DrawerModalRoot,
  DrawerBackdrop,
  DrawerSheet,
  DrawerSafe,
  DrawerDragArea,
  DrawerHandle,
} from "@/src/presentation/theme/primitives";

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
  const { colors } = useTheme();
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

  const translateY = Animated.add(slideAnim, dragOffset);

  return (
    <Modal visible={visible} animationType="none" transparent onRequestClose={closeWithAnimation}>
      <DrawerModalRoot>
        <DrawerBackdrop style={{ opacity: backdropOpacity }} pointerEvents="box-none">
          <AbsoluteFill onPress={closeWithAnimation} />
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
            <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingHorizontal: 16, paddingBottom: 12 }}>
              <Text style={{ fontSize: 18, fontWeight: "600", color: colors.text }}>Add symbol</Text>
              <Pressable onPress={closeWithAnimation} hitSlop={12} style={{ width: 32, height: 32, borderRadius: 16, backgroundColor: colors.surface, alignItems: "center", justifyContent: "center" }}>
                <MaterialIcons name="close" size={22} color={colors.text} />
              </Pressable>
            </View>
            <TextInput
              style={{ marginHorizontal: 16, marginBottom: 12, backgroundColor: colors.surface, borderRadius: 10, padding: 12, fontSize: 16, color: colors.text }}
              value={search}
              onChangeText={setSearch}
              placeholder="Search by symbol or name"
              placeholderTextColor={colors.textTertiary}
              autoCapitalize="characters"
            />
            <FlatList
              data={filtered}
              keyExtractor={(item) => item.instrument_id}
              style={{ flex: 1 }}
              keyboardShouldPersistTaps="handled"
              renderItem={({ item }) => (
                <Pressable
                  style={{ flexDirection: "row", alignItems: "center", paddingVertical: 14, paddingHorizontal: 16, borderBottomWidth: 1, borderBottomColor: colors.border }}
                  onPress={() => handleSelect(item.instrument_id)}
                >
                  <Text style={{ fontSize: 16, fontWeight: "600", color: colors.text, width: 72 }}>{item.symbol}</Text>
                  {item.name ? (
                    <Text style={{ flex: 1, fontSize: 14, color: colors.textSecondary }} numberOfLines={1}>
                      {item.name}
                    </Text>
                  ) : null}
                </Pressable>
              )}
              ListEmptyComponent={
                <Text style={{ padding: 20, fontSize: 14, color: colors.textSecondary, textAlign: "center" }}>
                  {search.trim() ? "No instruments found." : "Loading..."}
                </Text>
              }
            />
          </DrawerSafe>
        </DrawerSheet>
      </DrawerModalRoot>
    </Modal>
  );
}
