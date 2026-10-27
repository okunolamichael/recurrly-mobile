import { useSignIn } from "@clerk/expo";
import { Link, router } from "expo-router";
import { useState } from "react";
import { Pressable, Text, View } from "react-native";
import {
  AuthButton,
  AuthFeedback,
  AuthField,
  AuthScreen,
} from "@/components/auth-ui";

type ScreenMode =
  | "sign-in"
  | "challenge"
  | "forgot-email"
  | "forgot-code"
  | "new-password";
type ChallengeStrategy =
  | "email_code"
  | "phone_code"
  | "totp"
  | "backup_code";

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const challengePreference: ChallengeStrategy[] = [
  "email_code",
  "phone_code",
  "totp",
  "backup_code",
];

function getErrorMessage(error: { longMessage?: string } | null) {
  return error?.longMessage ?? "We couldn't complete that step. Please try again.";
}

export default function SignInScreen() {
  const { signIn, errors, fetchStatus } = useSignIn();
  const [mode, setMode] = useState<ScreenMode>("sign-in");
  const [emailAddress, setEmailAddress] = useState("");
  const [password, setPassword] = useState("");
  const [code, setCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [challengeStrategy, setChallengeStrategy] =
    useState<ChallengeStrategy | null>(null);
  const [emailValidation, setEmailValidation] = useState("");
  const [passwordValidation, setPasswordValidation] = useState("");
  const [codeValidation, setCodeValidation] = useState("");
  const [newPasswordValidation, setNewPasswordValidation] = useState("");
  const [confirmValidation, setConfirmValidation] = useState("");
  const [actionError, setActionError] = useState("");
  const [busy, setBusy] = useState(false);
  const isBusy = busy || fetchStatus === "fetching";

  const finishSignIn = async () => {
    const { error } = await signIn.finalize({
      navigate: () => router.replace("/(tabs)"),
    });
    if (error) setActionError(getErrorMessage(error));
  };

  const sendChallengeCode = async (strategy: ChallengeStrategy) => {
    if (strategy === "email_code") {
      return signIn.mfa.sendEmailCode();
    }
    if (strategy === "phone_code") {
      return signIn.mfa.sendPhoneCode();
    }
    return { error: null };
  };

  const handleSignInStatus = async () => {
    if (signIn.status === "complete") {
      await finishSignIn();
      return;
    }

    if (signIn.status === "needs_new_password") {
      setMode("new-password");
      setActionError("Please choose a new password to continue.");
      return;
    }

    if (
      signIn.status !== "needs_client_trust" &&
      signIn.status !== "needs_second_factor"
    ) {
      setActionError(
        "Your account needs another verification step that isn't available here. Please contact support.",
      );
      return;
    }

    const allowedStrategies =
      signIn.status === "needs_client_trust"
        ? challengePreference.slice(0, 2)
        : challengePreference;
    const strategy = allowedStrategies.find((candidate) =>
      signIn.supportedSecondFactors.some(
        (factor) => factor.strategy === candidate,
      ),
    );

    if (!strategy) {
      setActionError(
        "Your account requires a verification method that isn't available here. Please contact support.",
      );
      return;
    }

    setChallengeStrategy(strategy);
    setMode("challenge");
    setCode("");

    if (strategy === "email_code" || strategy === "phone_code") {
      const { error } = await sendChallengeCode(strategy);
      if (error) setActionError(getErrorMessage(error));
    }
  };

  const handleSignIn = async () => {
    const normalizedEmail = emailAddress.trim();
    const nextEmailError = emailPattern.test(normalizedEmail)
      ? ""
      : "Enter a valid email address.";
    const nextPasswordError = password ? "" : "Enter your password.";
    setEmailValidation(nextEmailError);
    setPasswordValidation(nextPasswordError);
    setActionError("");
    if (nextEmailError || nextPasswordError) return;

    setBusy(true);
    try {
      const { error } = await signIn.password({
        emailAddress: normalizedEmail,
        password,
      });
      if (error) {
        setActionError(getErrorMessage(error));
        return;
      }
      await handleSignInStatus();
    } catch {
      setActionError(
        "We couldn't reach the sign-in service. Check your connection and try again.",
      );
    } finally {
      setBusy(false);
    }
  };

  const handleVerifyChallenge = async () => {
    const normalizedCode = code.trim();
    setCodeValidation(normalizedCode ? "" : "Enter your verification code.");
    setActionError("");
    if (!normalizedCode || !challengeStrategy) return;

    setBusy(true);
    try {
      let error: { longMessage?: string } | null = null;
      if (challengeStrategy === "email_code") {
        ({ error } = await signIn.mfa.verifyEmailCode({
          code: normalizedCode,
        }));
      } else if (challengeStrategy === "phone_code") {
        ({ error } = await signIn.mfa.verifyPhoneCode({
          code: normalizedCode,
        }));
      } else if (challengeStrategy === "totp") {
        ({ error } = await signIn.mfa.verifyTOTP({ code: normalizedCode }));
      } else {
        ({ error } = await signIn.mfa.verifyBackupCode({
          code: normalizedCode,
        }));
      }

      if (error) {
        setActionError(getErrorMessage(error));
        return;
      }
      await handleSignInStatus();
    } catch {
      setActionError(
        "We couldn't verify that code. Check your connection and try again.",
      );
    } finally {
      setBusy(false);
    }
  };

  const handleSendResetCode = async () => {
    const normalizedEmail = emailAddress.trim();
    const nextEmailError = emailPattern.test(normalizedEmail)
      ? ""
      : "Enter a valid email address.";
    setEmailValidation(nextEmailError);
    setActionError("");
    if (nextEmailError) return;

    setBusy(true);
    try {
      const { error: createError } = await signIn.create({
        identifier: normalizedEmail,
      });
      if (createError) {
        setActionError(getErrorMessage(createError));
        return;
      }

      const { error } = await signIn.resetPasswordEmailCode.sendCode();
      if (error) {
        setActionError(getErrorMessage(error));
        return;
      }
      setMode("forgot-code");
    } catch {
      setActionError(
        "We couldn't send a reset code. Check your connection and try again.",
      );
    } finally {
      setBusy(false);
    }
  };

  const handleVerifyResetCode = async () => {
    const normalizedCode = code.trim();
    setCodeValidation(normalizedCode ? "" : "Enter the code from your email.");
    setActionError("");
    if (!normalizedCode) return;

    setBusy(true);
    try {
      const { error } = await signIn.resetPasswordEmailCode.verifyCode({
        code: normalizedCode,
      });
      if (error) {
        setActionError(getErrorMessage(error));
        return;
      }
      if (signIn.status !== "needs_new_password") {
        setActionError(
          "That code could not be used to reset your password. Request a new code and try again.",
        );
        return;
      }
      setMode("new-password");
      setCode("");
      setActionError("");
    } catch {
      setActionError(
        "We couldn't verify that code. Check your connection and try again.",
      );
    } finally {
      setBusy(false);
    }
  };

  const handleSetNewPassword = async () => {
    const nextPasswordError =
      newPassword.length >= 8 ? "" : "Use at least 8 characters.";
    const nextConfirmError =
      newPassword === confirmPassword ? "" : "Your passwords don't match.";
    setNewPasswordValidation(nextPasswordError);
    setConfirmValidation(nextConfirmError);
    setActionError("");
    if (nextPasswordError || nextConfirmError) return;

    setBusy(true);
    try {
      const { error } = await signIn.resetPasswordEmailCode.submitPassword({
        password: newPassword,
        signOutOfOtherSessions: true,
      });
      if (error) {
        setActionError(getErrorMessage(error));
        return;
      }
      await handleSignInStatus();
    } catch {
      setActionError(
        "We couldn't update your password. Check your connection and try again.",
      );
    } finally {
      setBusy(false);
    }
  };

  const handleResendResetCode = async () => {
    setActionError("");
    setBusy(true);
    try {
      const { error } = await signIn.resetPasswordEmailCode.sendCode();
      if (error) setActionError(getErrorMessage(error));
    } catch {
      setActionError(
        "We couldn't send a new code. Check your connection and try again.",
      );
    } finally {
      setBusy(false);
    }
  };

  const handleBackToSignIn = async () => {
    setActionError("");
    setCode("");
    setChallengeStrategy(null);
    await signIn.reset();
    setMode("sign-in");
  };

  const hasBackupCode = signIn.supportedSecondFactors.some(
    (factor) => factor.strategy === "backup_code",
  );
  const hasTOTP = signIn.supportedSecondFactors.some(
    (factor) => factor.strategy === "totp",
  );
  const title =
    mode === "challenge"
      ? "Verify it's you"
      : mode === "forgot-email"
        ? "Reset your password"
        : mode === "forgot-code"
          ? "Check your email"
          : mode === "new-password"
            ? "Choose a new password"
            : "Welcome back";
  const subtitle =
    mode === "challenge"
      ? challengeStrategy === "totp"
        ? "Enter the code from your authenticator app."
        : challengeStrategy === "backup_code"
          ? "Enter one of your saved backup codes."
          : challengeStrategy === "phone_code"
            ? "Enter the code we sent to your phone."
            : "Enter the code we sent to verify your sign-in."
      : mode === "forgot-email"
        ? "We'll email you a secure code to reset your password."
        : mode === "forgot-code"
          ? `Enter the password reset code sent to ${emailAddress.trim()}.`
          : mode === "new-password"
            ? "Create a new password to secure your account."
            : "Sign in to continue managing your subscriptions.";

  const footer =
    mode === "sign-in" ? (
      <>
        <Text className="auth-link-copy">New to Recurrly?</Text>
        <Link href="/(auth)/sign-up" asChild>
          <Pressable accessibilityRole="link">
            <Text className="auth-link">Create an account</Text>
          </Pressable>
        </Link>
      </>
    ) : mode === "challenge" && challengeStrategy === "totp" && hasBackupCode ? (
      <Pressable
        accessibilityRole="button"
        onPress={() => setChallengeStrategy("backup_code")}
      >
        <Text className="auth-link">Use a backup code instead</Text>
      </Pressable>
    ) : mode === "challenge" &&
      challengeStrategy === "backup_code" &&
      hasTOTP ? (
      <Pressable
        accessibilityRole="button"
        onPress={() => setChallengeStrategy("totp")}
      >
        <Text className="auth-link">Use your authenticator app</Text>
      </Pressable>
    ) : (
      <Pressable
        accessibilityRole="button"
        disabled={isBusy}
        onPress={handleBackToSignIn}
      >
        <Text className="auth-link">Back to sign in</Text>
      </Pressable>
    );

  return (
    <AuthScreen footer={footer} subtitle={subtitle} title={title}>
      {mode === "sign-in" || mode === "forgot-email" ? (
        <View className="auth-form">
          <AuthField
            autoCapitalize="none"
            autoComplete="email"
            error={emailValidation || errors.fields.identifier?.message || ""}
            keyboardType="email-address"
            label="Email"
            onChangeText={(value) => {
              setEmailAddress(value);
              setEmailValidation("");
            }}
            returnKeyType="next"
            textContentType="emailAddress"
            value={emailAddress}
          />
          {mode === "sign-in" ? (
            <>
              <AuthField
                autoComplete="current-password"
                error={
                  passwordValidation || errors.fields.password?.message || ""
                }
                label="Password"
                onChangeText={(value) => {
                  setPassword(value);
                  setPasswordValidation("");
                }}
                returnKeyType="done"
                secureTextEntry
                textContentType="password"
                value={password}
              />
              <Pressable
                accessibilityRole="button"
                className="self-end py-1"
                onPress={() => {
                  setActionError("");
                  setMode("forgot-email");
                }}
              >
                <Text className="auth-link">Forgot password?</Text>
              </Pressable>
            </>
          ) : null}
          {actionError ? <AuthFeedback>{actionError}</AuthFeedback> : null}
          <AuthButton
            loading={isBusy}
            onPress={
              mode === "sign-in" ? handleSignIn : handleSendResetCode
            }
            title={mode === "sign-in" ? "Sign in" : "Send reset code"}
          />
        </View>
      ) : mode === "challenge" ? (
        <View className="auth-form">
          <AuthField
            autoCapitalize="characters"
            autoComplete="one-time-code"
            error={codeValidation || errors.fields.code?.message || ""}
            keyboardType={
              challengeStrategy === "backup_code" ? "default" : "number-pad"
            }
            label={
              challengeStrategy === "totp"
                ? "Authenticator code"
                : challengeStrategy === "backup_code"
                  ? "Backup code"
                  : "Verification code"
            }
            onChangeText={(value) => {
              setCode(value);
              setCodeValidation("");
            }}
            returnKeyType="done"
            textContentType="oneTimeCode"
            value={code}
          />
          {actionError ? <AuthFeedback>{actionError}</AuthFeedback> : null}
          <AuthButton
            loading={isBusy}
            onPress={handleVerifyChallenge}
            title="Verify and continue"
          />
          {challengeStrategy === "email_code" ||
          challengeStrategy === "phone_code" ? (
            <Pressable
              accessibilityRole="button"
              className="items-center py-2"
              disabled={isBusy}
              onPress={async () => {
                setActionError("");
                setBusy(true);
                try {
                  const { error } =
                    await sendChallengeCode(challengeStrategy);
                  if (error) setActionError(getErrorMessage(error));
                } catch {
                  setActionError(
                    "We couldn't send a new code. Check your connection and try again.",
                  );
                } finally {
                  setBusy(false);
                }
              }}
            >
              <Text className="auth-link">Resend code</Text>
            </Pressable>
          ) : null}
        </View>
      ) : mode === "forgot-code" ? (
        <View className="auth-form">
          <AuthField
            autoComplete="one-time-code"
            error={codeValidation || errors.fields.code?.message || ""}
            keyboardType="number-pad"
            label="Password reset code"
            onChangeText={(value) => {
              setCode(value);
              setCodeValidation("");
            }}
            returnKeyType="done"
            textContentType="oneTimeCode"
            value={code}
          />
          {actionError ? <AuthFeedback>{actionError}</AuthFeedback> : null}
          <AuthButton
            loading={isBusy}
            onPress={handleVerifyResetCode}
            title="Continue"
          />
          <Pressable
            accessibilityRole="button"
            className="items-center py-2"
            disabled={isBusy}
            onPress={handleResendResetCode}
          >
            <Text className="auth-link">Resend code</Text>
          </Pressable>
        </View>
      ) : (
        <View className="auth-form">
          <AuthField
            autoComplete="new-password"
            error={
              newPasswordValidation || errors.fields.password?.message || ""
            }
            label="New password"
            onChangeText={(value) => {
              setNewPassword(value);
              setNewPasswordValidation("");
            }}
            returnKeyType="next"
            secureTextEntry
            textContentType="newPassword"
            value={newPassword}
          />
          <AuthField
            autoComplete="new-password"
            error={confirmValidation}
            label="Confirm new password"
            onChangeText={(value) => {
              setConfirmPassword(value);
              setConfirmValidation("");
            }}
            returnKeyType="done"
            secureTextEntry
            textContentType="newPassword"
            value={confirmPassword}
          />
          {actionError ? <AuthFeedback>{actionError}</AuthFeedback> : null}
          <AuthButton
            loading={isBusy}
            onPress={handleSetNewPassword}
            title="Save new password"
          />
        </View>
      )}
    </AuthScreen>
  );
}
