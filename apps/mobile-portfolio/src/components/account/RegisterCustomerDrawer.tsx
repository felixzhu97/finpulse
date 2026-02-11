import { useState } from "react";
import {
  ActivityIndicator,
  Animated,
  Dimensions,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { customersApi } from "@/src/api";
import type { Customer } from "@/src/types";
import { useDraggableDrawer } from "@/src/hooks/useDraggableDrawer";
import { useTheme } from "@/src/theme";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { useTranslation } from "@/src/i18n";

const { height: SCREEN_HEIGHT } = Dimensions.get("window");
const DRAWER_HEIGHT = Math.min(SCREEN_HEIGHT * 0.5, 420);

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
      const created = await customersApi.create({
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
      <View style={styles.modalRoot}>
        <Animated.View
          style={[styles.backdrop, { opacity: backdropOpacity, backgroundColor: colors.backdrop }]}
          pointerEvents="box-none"
        >
          <Pressable style={StyleSheet.absoluteFill} onPress={handleClose} />
        </Animated.View>

        <Animated.View
          style={[
            styles.drawer,
            {
              height: DRAWER_HEIGHT,
              transform: [{ translateY }],
              backgroundColor: colors.cardSolid,
            },
          ]}
        >
          <SafeAreaView style={styles.safe} edges={["top"]}>
            <View style={styles.dragArea} {...panHandlers}>
              <View style={[styles.dragHandle, { backgroundColor: colors.textTertiary }]} />
            </View>
            <View style={[styles.header, { borderBottomColor: colors.border }]}>
            <Text style={[styles.headerTitle, { color: colors.text }]}>{t("account.register")}</Text>
            <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
              <MaterialIcons name="close" size={24} color={colors.text} />
            </TouchableOpacity>
          </View>

          <View style={styles.content}>
            {result ? (
              <View style={styles.resultSection}>
                <MaterialIcons name="check-circle" size={48} color={colors.success} />
                <Text style={[styles.resultTitle, { color: colors.text }]}>{t("account.registerSuccess")}</Text>
                {result.ai_identity_score != null && (
                  <View style={[styles.scoreRow, { backgroundColor: colors.surface }]}>
                    <Text style={[styles.scoreLabel, { color: colors.textSecondary }]}>{t("account.aiIdentityScore")}</Text>
                    <Text style={[styles.scoreValue, { color: colors.text }]}>
                      {(result.ai_identity_score * 100).toFixed(0)}%
                    </Text>
                  </View>
                )}
                <TouchableOpacity
                  style={[styles.doneButton, { backgroundColor: colors.primary }]}
                  onPress={handleClose}
                >
                  <Text style={styles.doneButtonText}>{t("common.close")}</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <>
                <View style={styles.fieldGroup}>
                  <Text style={[styles.label, { color: colors.textSecondary }]}>{t("account.name")}</Text>
                  <TextInput
                    style={[styles.input, { color: colors.text, borderColor: colors.border, backgroundColor: colors.surface }]}
                    value={name}
                    onChangeText={setName}
                    placeholder={t("account.namePlaceholder")}
                    placeholderTextColor={colors.textTertiary}
                    editable={!submitting}
                  />
                </View>
                <View style={styles.fieldGroup}>
                  <Text style={[styles.label, { color: colors.textSecondary }]}>{t("account.email")}</Text>
                  <TextInput
                    style={[styles.input, { color: colors.text, borderColor: colors.border, backgroundColor: colors.surface }]}
                    value={email}
                    onChangeText={setEmail}
                    placeholder={t("account.emailPlaceholder")}
                    placeholderTextColor={colors.textTertiary}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    editable={!submitting}
                  />
                </View>
                {error && <Text style={[styles.errorText, { color: colors.error }]}>{error}</Text>}
                <TouchableOpacity
                  style={[
                    styles.submitButton,
                    { backgroundColor: colors.primary },
                    submitting && styles.submitButtonDisabled,
                  ]}
                  onPress={handleSubmit}
                  disabled={submitting || !name.trim()}
                >
                  {submitting ? (
                    <ActivityIndicator size="small" color="#fff" />
                  ) : (
                    <Text style={styles.submitButtonText}>{t("account.submit")}</Text>
                  )}
                </TouchableOpacity>
              </>
            )}
          </View>
          </SafeAreaView>
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalRoot: { flex: 1, justifyContent: "flex-end" },
  backdrop: { ...StyleSheet.absoluteFillObject },
  drawer: { borderTopLeftRadius: 14, borderTopRightRadius: 14, overflow: "hidden" },
  safe: { flex: 1 },
  dragArea: { paddingTop: 8, paddingBottom: 8, alignItems: "center", minHeight: 40 },
  dragHandle: { width: 36, height: 5, borderRadius: 2.5 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  headerTitle: { fontSize: 20, fontWeight: "600", letterSpacing: -0.3 },
  closeButton: { width: 32, height: 32, alignItems: "center", justifyContent: "center" },
  content: { flex: 1, paddingHorizontal: 20, paddingTop: 20, paddingBottom: 40 },
  fieldGroup: { marginBottom: 16 },
  label: { fontSize: 13, fontWeight: "600", marginBottom: 6 },
  input: {
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
  },
  errorText: { fontSize: 13, marginBottom: 12 },
  submitButton: {
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 8,
  },
  submitButtonDisabled: { opacity: 0.5 },
  submitButtonText: { color: "#fff", fontSize: 16, fontWeight: "600" },
  resultSection: { alignItems: "center", paddingTop: 20 },
  resultTitle: { fontSize: 18, fontWeight: "600", marginTop: 16 },
  scoreRow: {
    marginTop: 16,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 10,
    alignSelf: "stretch",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  scoreLabel: { fontSize: 15 },
  scoreValue: { fontSize: 17, fontWeight: "600" },
  doneButton: {
    marginTop: 24,
    paddingVertical: 12,
    paddingHorizontal: 32,
    borderRadius: 10,
  },
  doneButtonText: { color: "#fff", fontSize: 16, fontWeight: "600" },
});
