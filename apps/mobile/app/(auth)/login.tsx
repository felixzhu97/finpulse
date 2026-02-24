import { useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import styled from "@emotion/native";
import { useTheme } from "@/src/presentation/theme";
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

export default function LoginScreen() {
  const { colors } = useTheme();
  const { t } = useTranslation();
  const router = useRouter();
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    const trimmedEmail = email.trim();
    if (!trimmedEmail || !password) {
      setError(t("auth.enterEmailAndPassword"));
      return;
    }
    setError(null);
    setLoading(true);
    const result = await login({ email: trimmedEmail, password });
    setLoading(false);
    if (result.ok) {
      router.replace("/(tabs)");
    } else {
      setError(result.error ?? t("auth.loginFailed"));
    }
  };

  return (
    <Page>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        keyboardVerticalOffset={0}
      >
        <Title>{t("auth.welcomeBack")}</Title>
        <Subtitle>{t("auth.signInToContinue")}</Subtitle>

        <Input
          placeholder={t("auth.emailPlaceholder")}
          placeholderTextColor="rgba(255,255,255,0.4)"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          autoCorrect={false}
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
            <PrimaryButtonText>{t("auth.logIn")}</PrimaryButtonText>
          )}
        </PrimaryButton>

        <LinkRow>
          <LinkText>{t("auth.noAccount")}</LinkText>
          <LinkPressable onPress={() => router.push("/(auth)/signup")}>
            <LinkHighlight>{t("auth.signUp")}</LinkHighlight>
          </LinkPressable>
        </LinkRow>
      </KeyboardAvoidingView>
    </Page>
  );
}
