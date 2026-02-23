import { forwardRef, useEffect, useImperativeHandle, useRef } from "react";
import { Animated, TextInput } from "react-native";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { GlassView } from "@/src/presentation/components/ui/GlassView";
import { useTheme } from "@/src/presentation/theme";
import styled from "styled-components/native";

const SearchBarContainer = styled(Animated.View)`
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  padding-horizontal: 16px;
  padding-top: 8px;
  padding-bottom: 8px;
`;

const SearchBarRow = styled.View`
  flex-direction: row;
  align-items: center;
  gap: 10px;
  padding: 6px;
`;

const SearchCloseBtn = styled.Pressable`
  width: 40px;
  height: 40px;
  border-radius: 20px;
  overflow: hidden;
`;

const ClearBtn = styled.Pressable`
  padding: 4px;
  margin-left: 8px;
`;

export interface WatchlistSearchBarRef {
  focus(): void;
  blur(): void;
}

export interface WatchlistSearchBarProps {
  visible: boolean;
  searchQuery: string;
  onChangeQuery: (value: string) => void;
  onClose: () => void;
  placeholder?: string;
}

export const WatchlistSearchBar = forwardRef<WatchlistSearchBarRef, WatchlistSearchBarProps>(
  function WatchlistSearchBar(
    { visible, searchQuery, onChangeQuery, onClose, placeholder },
    ref
  ) {
    const { colors } = useTheme();
    const inputRef = useRef<TextInput>(null);
    const searchBarAnim = useRef(new Animated.Value(0)).current;

    useImperativeHandle(ref, () => ({
      focus: () => inputRef.current?.focus(),
      blur: () => inputRef.current?.blur(),
    }));

    useEffect(() => {
      if (visible) {
        searchBarAnim.setValue(0);
        Animated.spring(searchBarAnim, {
          toValue: 1,
          useNativeDriver: true,
        }).start(() => {
          setTimeout(() => inputRef.current?.focus(), 100);
        });
      } else {
        Animated.spring(searchBarAnim, {
          toValue: 0,
          useNativeDriver: true,
        }).start();
      }
    }, [visible, searchBarAnim]);

    return (
      <SearchBarContainer
        style={{
          opacity: searchBarAnim,
          transform: [
            {
              translateY: searchBarAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [100, 0],
              }),
            },
          ],
        }}
        pointerEvents={visible ? "auto" : "none"}
      >
        <GlassView
          intensity={70}
          tint="dark"
          style={{
            borderRadius: 20,
            overflow: "hidden",
            borderWidth: 1,
            borderColor: "rgba(255,255,255,0.12)",
          }}
        >
          <SearchBarRow>
            <GlassView
              intensity={50}
              tint="dark"
              style={{
                flex: 1,
                flexDirection: "row",
                alignItems: "center",
                borderRadius: 14,
                paddingHorizontal: 12,
                paddingVertical: 10,
                overflow: "hidden",
              }}
            >
              <MaterialIcons
                name="search"
                size={20}
                color={colors.textSecondary}
                style={{ marginRight: 8 }}
              />
              <TextInput
                ref={inputRef}
                style={{ flex: 1, fontSize: 17, padding: 0, color: colors.text }}
                placeholder={placeholder}
                placeholderTextColor={colors.textTertiary}
                value={searchQuery}
                onChangeText={onChangeQuery}
                autoCapitalize="none"
                autoCorrect={false}
                returnKeyType="search"
              />
              {searchQuery.length > 0 && (
                <ClearBtn onPress={() => onChangeQuery("")} hitSlop={8}>
                  <MaterialIcons name="close" size={18} color={colors.textSecondary} />
                </ClearBtn>
              )}
            </GlassView>
            <SearchCloseBtn onPress={onClose} hitSlop={8}>
              <GlassView
                intensity={60}
                tint="dark"
                style={{
                  flex: 1,
                  width: "100%",
                  height: "100%",
                  borderRadius: 20,
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <MaterialIcons name="close" size={24} color={colors.text} />
              </GlassView>
            </SearchCloseBtn>
          </SearchBarRow>
        </GlassView>
      </SearchBarContainer>
    );
  }
);
