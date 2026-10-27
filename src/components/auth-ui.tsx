import { clsx } from "clsx";
import type { ReactNode } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  type TextInputProps,
  View,
} from "react-native";
import { styled } from "nativewind";
import { SafeAreaView as RNSafeAreaView } from "react-native-safe-area-context";

const SafeAreaView = styled(RNSafeAreaView);

type AuthScreenProps = {
  title: string;
  subtitle: string;
  children: ReactNode;
  footer?: ReactNode;
};

export function AuthScreen({
  title,
  subtitle,
  children,
  footer,
}: AuthScreenProps) {
  return (
    <SafeAreaView className="auth-safe-area">
      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          className="auth-scroll"
          contentContainerStyle={{ flexGrow: 1, justifyContent: "center" }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View className="auth-content">
            <View className="auth-brand-block">
              <View className="auth-logo-wrap">
                <View className="auth-logo-mark">
                  <Text className="auth-logo-mark-text">R</Text>
                </View>
                <View>
                  <Text className="auth-wordmark">Recurrly</Text>
                  <Text className="auth-wordmark-sub">Smart billing</Text>
                </View>
              </View>
              <Text className="auth-title text-center">{title}</Text>
              <Text className="auth-subtitle">{subtitle}</Text>
            </View>

            <View className="auth-card">
              {children}
              {footer ? <View className="auth-link-row">{footer}</View> : null}
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

type AuthFieldProps = TextInputProps & {
  label: string;
  error?: string;
};

export function AuthField({ label, error, ...inputProps }: AuthFieldProps) {
  return (
    <View className="auth-field">
      <Text className="auth-label">{label}</Text>
      <TextInput
        {...inputProps}
        accessibilityLabel={label}
        className={clsx("auth-input", error && "auth-input-error")}
        placeholderTextColor="#596579"
      />
      {error ? <Text className="auth-error">{error}</Text> : null}
    </View>
  );
}

type AuthButtonProps = {
  title: string;
  onPress: () => void;
  loading?: boolean;
  disabled?: boolean;
};

export function AuthButton({
  title,
  onPress,
  loading = false,
  disabled = false,
}: AuthButtonProps) {
  const isDisabled = disabled || loading;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ busy: loading, disabled: isDisabled }}
      className={clsx("auth-button", isDisabled && "auth-button-disabled")}
      disabled={isDisabled}
      onPress={onPress}
    >
      {loading ? (
        <ActivityIndicator color="#081126" />
      ) : (
        <Text className="auth-button-text">{title}</Text>
      )}
    </Pressable>
  );
}

export function AuthFeedback({ children }: { children: string }) {
  return (
    <Text accessibilityLiveRegion="polite" className="auth-error">
      {children}
    </Text>
  );
}

export function AuthLoadingView() {
  return (
    <SafeAreaView className="auth-safe-area flex-1 items-center justify-center">
      <ActivityIndicator color="#EA7A53" size="large" />
    </SafeAreaView>
  );
}
