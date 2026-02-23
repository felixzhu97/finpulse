import { useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  TextInput,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import styled from "styled-components/native";
import { useAuth } from "@/src/presentation/hooks/auth";
import { useTranslation } from "@/src/presentation/i18n";
import { RobinNeon } from "@/src/presentation/theme/colors";

const Page = styled(SafeAreaView)`
  flex: 1;
  background-color: #000000;
  padding-horizontal: 24px;
  padding-top: 48px;
`;

const Title = styled.Text`
  font-size: 28px;
  font-weight: 700;
  letter-spacing: -0.5px;
  color: rgba(255, 255, 255, 0.9);
  margin-bottom: 8px;
`;

const Subtitle = styled.Text`
  font-size: 16px;
  font-weight: 400;
  color: rgba(255, 255, 255, 0.6);
  margin-bottom: 40px;
`;

const Input = styled.TextInput`
  height: 52px;
  border-radius: 16px;
  background-color: rgba(255, 255, 255, 0.06);
  border-width: 1px;
  border-color: rgba(255, 255, 255, 0.1);
  padding-horizontal: 16px;
  font-size: 16px;
  color: rgba(255, 255, 255, 0.9);
  margin-bottom: 16px;
`;

const PrimaryButton = styled(Pressable)`
  height: 56px;
  border-radius: 16px;
  background-color: ${RobinNeon};
  align-items: center;
  justify-content: center;
  margin-top: 24px;
`;

const PrimaryButtonText = styled.Text`
  font-size: 17px;
  font-weight: 600;
  color: #000000;
`;

const ErrorText = styled.Text`
  font-size: 14px;
  color: #ff453a;
  margin-top: 8px;
`;

const LinkRow = styled.View`
  flex-direction: row;
  justify-content: center;
  margin-top: 24px;
  gap: 4px;
`;

const LinkText = styled.Text`
  font-size: 15px;
  color: rgba(255, 255, 255, 0.6);
`;

const LinkPressable = styled(Pressable)``;

const LinkHighlight = styled.Text`
  font-size: 15px;
  font-weight: 600;
  color: ${RobinNeon};
`;

export default function SignupScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const { register } = useAuth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    const trimmedName = name.trim();
    const trimmedEmail = email.trim();
    if (!trimmedName || !trimmedEmail || !password) {
      setError(t("auth.fillAllFields"));
      return;
    }
    if (password.length < 6) {
      setError(t("auth.passwordMinLength"));
      return;
    }
    setError(null);
    setLoading(true);
    const result = await register({
      name: trimmedName,
      email: trimmedEmail,
      password,
    });
    setLoading(false);
    if (result.ok) {
      router.replace("/(tabs)");
    } else {
      setError(result.error ?? t("auth.signupFailed"));
    }
  };

  return (
    <Page>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        keyboardVerticalOffset={0}
      >
        <Title>{t("auth.createAccount")}</Title>
        <Subtitle>{t("auth.signUpSubtitle")}</Subtitle>

        <Input
          placeholder={t("auth.namePlaceholder")}
          placeholderTextColor="rgba(255,255,255,0.4)"
          value={name}
          onChangeText={setName}
          autoCapitalize="words"
          editable={!loading}
        />
        <Input
          placeholder={t("auth.emailPlaceholder")}
          placeholderTextColor="rgba(255,255,255,0.4)"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
          editable={!loading}
        />
        <Input
          placeholder={t("auth.passwordPlaceholder")}
          placeholderTextColor="rgba(255,255,255,0.4)"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          editable={!loading}
        />

        {error ? <ErrorText>{error}</ErrorText> : null}

        <PrimaryButton onPress={handleSubmit} disabled={loading}>
          {loading ? (
            <ActivityIndicator size="small" color="#000000" />
          ) : (
            <PrimaryButtonText>{t("auth.signUp")}</PrimaryButtonText>
          )}
        </PrimaryButton>

        <LinkRow>
          <LinkText>{t("auth.haveAccount")}</LinkText>
          <LinkPressable onPress={() => router.back()}>
            <LinkHighlight>{t("auth.logIn")}</LinkHighlight>
          </LinkPressable>
        </LinkRow>
      </KeyboardAvoidingView>
    </Page>
  );
}
