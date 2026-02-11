import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { useState } from "react";
import {
  Pressable,
  StyleSheet,
  TextInput,
  View,
} from "react-native";

interface SearchBarProps {
  placeholder?: string;
  value: string;
  onChangeText: (text: string) => void;
  onFocus?: () => void;
  onBlur?: () => void;
}

export function SearchBar({
  placeholder = "Search",
  value,
  onChangeText,
  onFocus,
  onBlur,
}: SearchBarProps) {
  const [focused, setFocused] = useState(false);

  const handleFocus = () => {
    setFocused(true);
    onFocus?.();
  };

  const handleBlur = () => {
    setFocused(false);
    onBlur?.();
  };

  const handleClear = () => {
    onChangeText("");
  };

  return (
    <View style={[styles.container, focused && styles.containerFocused]}>
      <MaterialIcons
        name="search"
        size={20}
        color={focused ? "#fff" : "rgba(255,255,255,0.5)"}
        style={styles.icon}
      />
      <TextInput
        style={styles.input}
        placeholder={placeholder}
        placeholderTextColor="rgba(255,255,255,0.4)"
        value={value}
        onChangeText={onChangeText}
        onFocus={handleFocus}
        onBlur={handleBlur}
        autoCapitalize="none"
        autoCorrect={false}
        returnKeyType="search"
      />
      {value.length > 0 && (
        <Pressable onPress={handleClear} hitSlop={8} style={styles.clearBtn}>
          <MaterialIcons name="close" size={18} color="rgba(255,255,255,0.5)" />
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.08)",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginHorizontal: 16,
    marginVertical: 8,
  },
  containerFocused: {
    backgroundColor: "rgba(255,255,255,0.12)",
  },
  icon: {
    marginRight: 8,
  },
  input: {
    flex: 1,
    fontSize: 17,
    color: "#fff",
    padding: 0,
  },
  clearBtn: {
    padding: 4,
    marginLeft: 8,
  },
});
