import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { useState } from "react";
import { Pressable, TextInput } from "react-native";
import styled from "@emotion/native";

interface SearchBarProps {
  placeholder?: string;
  value: string;
  onChangeText: (text: string) => void;
  onFocus?: () => void;
  onBlur?: () => void;
}

const Container = styled.View<{ focused: boolean }>`
  flex-direction: row;
  align-items: center;
  background-color: ${(p) =>
    p.focused ? "rgba(255,255,255,0.12)" : "rgba(255,255,255,0.08)"};
  border-radius: 10px;
  padding-horizontal: 12px;
  padding-vertical: 10px;
  margin-horizontal: 16px;
  margin-vertical: 8px;
`;

const SearchInput = styled.TextInput`
  flex: 1;
  font-size: 17px;
  color: #fff;
  padding: 0;
  margin-left: 8px;
`;

const ClearBtn = styled(Pressable)`
  padding: 4px;
  margin-left: 8px;
`;

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
    <Container focused={focused}>
      <MaterialIcons
        name="search"
        size={20}
        color={focused ? "#fff" : "rgba(255,255,255,0.5)"}
      />
      <SearchInput
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
        <ClearBtn onPress={handleClear} hitSlop={8}>
          <MaterialIcons name="close" size={18} color="rgba(255,255,255,0.5)" />
        </ClearBtn>
      )}
    </Container>
  );
}
