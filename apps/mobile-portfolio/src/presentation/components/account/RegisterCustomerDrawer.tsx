import { useState } from "react";
import {
  ActivityIndicator,
  Animated,
  Dimensions,
  Modal,
  Pressable,
  TouchableOpacity,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import styled from "styled-components/native";
import { registerCustomer } from "@/src/infrastructure/api";
import { useTheme, withTheme } from "@/src/presentation/theme";
import type { Customer } from "@/src/domain/entities/customer";
import { useDraggableDrawer } from "@/src/presentation/hooks";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { useTranslation } from "@/src/presentation/i18n";

const { height: SCREEN_HEIGHT } = Dimensions.get("window");
const DRAWER_HEIGHT = Math.min(SCREEN_HEIGHT * 0.5, 420);

const ModalRoot = styled.View`
  flex: 1;
  justify-content: flex-end;
`;

const Safe = styled(SafeAreaView)`
  flex: 1;
`;

const DragArea = styled.View`
  padding-top: 8px;
  padding-bottom: 8px;
  align-items: center;
  min-height: 40px;
`;

const DragHandle = styled.View`
  width: 36px;
  height: 5px;
  border-radius: 2.5px;
  background-color: ${withTheme((t) => t.colors.textTertiary)};
`;

const Header = styled.View`
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  padding-horizontal: 20px;
  padding-vertical: 16px;
  border-bottom-width: 1px;
  border-bottom-color: ${withTheme((t) => t.colors.border)};
`;

const HeaderTitle = styled.Text`
  font-size: 20px;
  font-weight: 600;
  letter-spacing: -0.3px;
  color: ${withTheme((t) => t.colors.text)};
`;

const CloseButton = styled(TouchableOpacity)`
  width: 32px;
  height: 32px;
  align-items: center;
  justify-content: center;
`;

const Content = styled.View`
  flex: 1;
  padding-horizontal: 20px;
  padding-top: 20px;
  padding-bottom: 40px;
`;

const FieldGroup = styled.View`
  margin-bottom: 16px;
`;

const Label = styled.Text`
  font-size: 13px;
  font-weight: 600;
  margin-bottom: 6px;
  color: ${withTheme((t) => t.colors.textSecondary)};
`;

const Input = styled.TextInput`
  border-width: 1px;
  border-radius: 10px;
  padding-horizontal: 14px;
  padding-vertical: 12px;
  font-size: 16px;
  color: ${withTheme((t) => t.colors.text)};
  border-color: ${withTheme((t) => t.colors.border)};
  background-color: ${withTheme((t) => t.colors.surface)};
`;

const ErrorText = styled.Text`
  font-size: 13px;
  margin-bottom: 12px;
  color: ${withTheme((t) => t.colors.error)};
`;

const SubmitButton = styled(TouchableOpacity)<{ disabled?: boolean }>`
  padding-vertical: 14px;
  border-radius: 10px;
  align-items: center;
  justify-content: center;
  margin-top: 8px;
  background-color: ${withTheme((t) => t.colors.primary)};
  opacity: ${(p: { disabled?: boolean }) => (p.disabled ? 0.5 : 1)};
`;

const SubmitButtonText = styled.Text`
  color: #fff;
  font-size: 16px;
  font-weight: 600;
`;

const ResultSection = styled.View`
  align-items: center;
  padding-top: 20px;
`;

const ResultTitle = styled.Text`
  font-size: 18px;
  font-weight: 600;
  margin-top: 16px;
  color: ${withTheme((t) => t.colors.text)};
`;

const ScoreRow = styled.View`
  margin-top: 16px;
  padding-vertical: 12px;
  padding-horizontal: 20px;
  border-radius: 10px;
  align-self: stretch;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  background-color: ${withTheme((t) => t.colors.surface)};
`;

const ScoreLabel = styled.Text`
  font-size: 15px;
  color: ${withTheme((t) => t.colors.textSecondary)};
`;

const ScoreValue = styled.Text`
  font-size: 17px;
  font-weight: 600;
  color: ${withTheme((t) => t.colors.text)};
`;

const DoneButton = styled(TouchableOpacity)`
  margin-top: 24px;
  padding-vertical: 12px;
  padding-horizontal: 32px;
  border-radius: 10px;
  background-color: ${withTheme((t) => t.colors.primary)};
`;

const DoneButtonText = styled.Text`
  color: #fff;
  font-size: 16px;
  font-weight: 600;
`;

interface RegisterCustomerDrawerProps {
  visible: boolean;
  onClose: () => void;
  onSuccess?: (customer: Customer) => void;
}

export function RegisterCustomerDrawer({ visible, onClose, onSuccess }: RegisterCustomerDrawerProps) {
  const { colors } = useTheme();
  const { t } = useTranslation();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<Customer | null>(null);
  const [error, setError] = useState<string | null>(null);

  const { slideAnim, dragOffset, panHandlers, backdropOpacity, closeWithAnimation } =
    useDraggableDrawer({ visible, drawerHeight: DRAWER_HEIGHT, onClose });

  const handleClose = () => {
    setName("");
    setEmail("");
    setResult(null);
    setError(null);
    closeWithAnimation();
  };

  const handleSubmit = async () => {
    const trimmed = name.trim();
    if (!trimmed) return;
    setSubmitting(true);
    setError(null);
    try {
      const created = await registerCustomer({
        name: trimmed,
        email: email.trim() || undefined,
      });
      if (created) {
        setResult(created);
        onSuccess?.(created);
      } else {
        setError(t("account.registerFailed"));
      }
    } catch {
      setError(t("account.registerFailed"));
    } finally {
      setSubmitting(false);
    }
  };

  const translateY = Animated.add(slideAnim, dragOffset);

  return (
    <Modal visible={visible} animationType="none" transparent onRequestClose={handleClose}>
      <ModalRoot>
        <Animated.View
          style={[
            { position: "absolute", left: 0, right: 0, top: 0, bottom: 0 },
            { opacity: backdropOpacity, backgroundColor: colors.backdrop },
          ]}
          pointerEvents="box-none"
        >
          <Pressable style={{ position: "absolute", left: 0, right: 0, top: 0, bottom: 0 }} onPress={handleClose} />
        </Animated.View>

        <Animated.View
          style={[
            { borderTopLeftRadius: 14, borderTopRightRadius: 14, overflow: "hidden" },
            { height: DRAWER_HEIGHT, transform: [{ translateY }], backgroundColor: colors.cardSolid },
          ]}
        >
          <Safe edges={["top"]}>
            <DragArea {...panHandlers}>
              <DragHandle />
            </DragArea>
            <Header>
              <HeaderTitle>{t("account.register")}</HeaderTitle>
              <CloseButton onPress={handleClose}>
                <MaterialIcons name="close" size={24} color={colors.text} />
              </CloseButton>
            </Header>

            <Content>
              {result ? (
                <ResultSection>
                  <MaterialIcons name="check-circle" size={48} color={colors.success} />
                  <ResultTitle>{t("account.registerSuccess")}</ResultTitle>
                  {result.ai_identity_score != null && (
                    <ScoreRow>
                      <ScoreLabel>{t("account.aiIdentityScore")}</ScoreLabel>
                      <ScoreValue>{(result.ai_identity_score * 100).toFixed(0)}%</ScoreValue>
                    </ScoreRow>
                  )}
                  <DoneButton onPress={handleClose}>
                    <DoneButtonText>{t("common.close")}</DoneButtonText>
                  </DoneButton>
                </ResultSection>
              ) : (
                <>
                  <FieldGroup>
                    <Label>{t("account.name")}</Label>
                    <Input
                      value={name}
                      onChangeText={setName}
                      placeholder={t("account.namePlaceholder")}
                      placeholderTextColor={colors.textTertiary}
                      editable={!submitting}
                    />
                  </FieldGroup>
                  <FieldGroup>
                    <Label>{t("account.email")}</Label>
                    <Input
                      value={email}
                      onChangeText={setEmail}
                      placeholder={t("account.emailPlaceholder")}
                      placeholderTextColor={colors.textTertiary}
                      keyboardType="email-address"
                      autoCapitalize="none"
                      editable={!submitting}
                    />
                  </FieldGroup>
                  {error && <ErrorText>{error}</ErrorText>}
                  <SubmitButton
                    onPress={handleSubmit}
                    disabled={submitting || !name.trim()}
                  >
                    {submitting ? (
                      <ActivityIndicator size="small" color="#fff" />
                    ) : (
                      <SubmitButtonText>{t("account.submit")}</SubmitButtonText>
                    )}
                  </SubmitButton>
                </>
              )}
            </Content>
          </Safe>
        </Animated.View>
      </ModalRoot>
    </Modal>
  );
}
