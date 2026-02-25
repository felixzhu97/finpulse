import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { memo, useState } from "react";
import { Modal, Pressable } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTheme } from "@/src/presentation/theme";
import { useTranslation } from "@/src/presentation/i18n";
import styled from "@emotion/native";

export type SortOption = "name" | "price" | "change" | "changePercent";

interface SortMenuProps {
  currentSort: SortOption;
  onSelect: (option: SortOption) => void;
  onOpen?: () => void;
}

const SortButton = styled(Pressable)`
  width: 44px;
  height: 44px;
  border-radius: 22px;
  align-items: center;
  justify-content: center;
`;

const Overlay = styled(Pressable)`
  flex: 1;
  justify-content: flex-end;
  background-color: ${(p) => p.theme.colors.backdrop};
`;

const Sheet = styled.View`
  border-top-left-radius: 14px;
  border-top-right-radius: 14px;
  padding-horizontal: 16px;
  padding-top: 16px;
  padding-bottom: 8px;
  background-color: ${(p) => p.theme.colors.cardSolid};
`;

const Header = styled.View`
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
`;

const HeaderTitle = styled.Text`
  font-size: 13px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  color: ${(p) => p.theme.colors.textTertiary};
`;

const Option = styled(Pressable)`
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  padding-vertical: 14px;
  border-bottom-width: 1px;
  border-bottom-color: ${(p) => p.theme.colors.border};
`;

const OptionText = styled.Text`
  font-size: 17px;
  font-weight: 400;
  color: ${(p) => p.theme.colors.text};
`;

export const SortMenu = memo(function SortMenu({ currentSort, onSelect, onOpen }: SortMenuProps) {
  const { colors } = useTheme();
  const { t } = useTranslation();
  const [visible, setVisible] = useState(false);

  const SORT_OPTIONS: { value: SortOption; label: string }[] = [
    { value: "name", label: t("watchlist.sortOptions.name") },
    { value: "price", label: t("watchlist.sortOptions.price") },
    { value: "change", label: t("watchlist.sortOptions.change") },
    { value: "changePercent", label: t("watchlist.sortOptions.changePercent") },
  ];

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
      <SortButton onPress={handleOpen} hitSlop={8}>
        <MaterialIcons name="sort" size={22} color={colors.text} />
      </SortButton>
      <Modal
        visible={visible}
        transparent
        animationType="fade"
        onRequestClose={() => setVisible(false)}
      >
        <Overlay onPress={() => setVisible(false)}>
          <Sheet>
            <SafeAreaView edges={["bottom"]}>
              <Header>
                <HeaderTitle>{t("watchlist.sortBy")}</HeaderTitle>
                <Pressable onPress={() => setVisible(false)} hitSlop={8}>
                  <MaterialIcons name="close" size={22} color={colors.text} />
                </Pressable>
              </Header>
              {SORT_OPTIONS.map((option) => (
                <Option key={option.value} onPress={() => handleSelect(option.value)}>
                  <OptionText>{option.label}</OptionText>
                  {currentSort === option.value && (
                    <MaterialIcons name="check" size={20} color={colors.accent} />
                  )}
                </Option>
              ))}
            </SafeAreaView>
          </Sheet>
        </Overlay>
      </Modal>
    </>
  );
});
