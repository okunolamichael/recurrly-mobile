import { useSignUp } from "@clerk/expo";
import { Link, router } from "expo-router";
import { useState } from "react";
import { Pressable, Text, View } from "react-native";
import {
  AuthButton,
  AuthFeedback,
  AuthField,
  AuthScreen,
} from "@/components/auth-ui";

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function getErrorMessage(error: {
  longMessage?: string;
  message?: string;
} | null) {
  return (
    error?.longMessage ??
    error?.message ??
    "We couldn't complete that step. Please try again."
  );
}

function getPhoneErrorMessage(error: {
  longMessage?: string;
  message?: string;
} | null) {
  const message = getErrorMessage(error);

  if (/unsupported|not supported|country|region/i.test(message)) {
    return "Clerk cannot send verification SMS to this phone number. To finish signing up with email only, make Phone optional in your Clerk Dashboard (User & authentication), then tap Start over and sign up again. You can add a supported number later in Settings.";
  }

  return message;
}

function formatFieldNames(fields: string[]) {
  return fields
    .map((field) => field.replaceAll("_", " "))
    .join(", ");
}

export default function SignUpScreen() {
  const { signUp, errors, fetchStatus } = useSignUp();
  const [emailAddress, setEmailAddress] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [code, setCode] = useState("");
  const [step, setStep] = useState<
    "credentials" | "verification" | "phone-verification" | "requirements"
  >("credentials");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [username, setUsername] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [legalAccepted, setLegalAccepted] = useState(false);
  const [emailValidation, setEmailValidation] = useState("");
  const [passwordValidation, setPasswordValidation] = useState("");
  const [confirmValidation, setConfirmValidation] = useState("");
  const [codeValidation, setCodeValidation] = useState("");
  const [requirementsValidation, setRequirementsValidation] = useState("");
  const [actionError, setActionError] = useState("");
  const [busy, setBusy] = useState(false);
  const isBusy = busy || fetchStatus === "fetching";

  const finalizeSignUp = async () => {
    if (signUp.status !== "complete") {
      setActionError(
        `Your account still needs: ${formatFieldNames(signUp.missingFields)}. Complete those details or update the required sign-up fields in your Clerk settings.`,
      );
      return;
    }

    const { error: finalizeError } = await signUp.finalize({
      navigate: () => router.replace("/(tabs)"),
    });
    if (finalizeError) {
      setActionError(getErrorMessage(finalizeError));
    }
  };

  const handleCreateAccount = async () => {
    const normalizedEmail = emailAddress.trim();
    const nextEmailError = emailPattern.test(normalizedEmail)
      ? ""
      : "Enter a valid email address.";
    const nextPasswordError =
      password.length >= 8 ? "" : "Use at least 8 characters.";
    const nextConfirmError =
      password === confirmPassword ? "" : "Your passwords don't match.";

    setEmailValidation(nextEmailError);
    setPasswordValidation(nextPasswordError);
    setConfirmValidation(nextConfirmError);
    setActionError("");

    if (nextEmailError || nextPasswordError || nextConfirmError) {
      return;
    }

    setBusy(true);
    try {
      const { error } = await signUp.password({
        emailAddress: normalizedEmail,
        password,
      });
      if (error) {
        setActionError(getErrorMessage(error));
        return;
      }

      const { error: sendError } =
        await signUp.verifications.sendEmailCode();
      if (sendError) {
        setActionError(getErrorMessage(sendError));
        return;
      }

      setStep("verification");
    } catch {
      setActionError(
        "We couldn't reach the sign-up service. Check your connection and try again.",
      );
    } finally {
      setBusy(false);
    }
  };

  const handleVerifyEmail = async () => {
    const normalizedCode = code.trim();
    setCodeValidation(normalizedCode ? "" : "Enter the code from your email.");
    setActionError("");
    if (!normalizedCode) return;

    setBusy(true);
    try {
      const { error } = await signUp.verifications.verifyEmailCode({
        code: normalizedCode,
      });
      if (error) {
        setActionError(getErrorMessage(error));
        return;
      }

      if (signUp.status !== "complete") {
        setStep("requirements");
        setActionError("");
        return;
      }

      await finalizeSignUp();
    } catch {
      setActionError(
        "We couldn't verify your email. Check your connection and try again.",
      );
    } finally {
      setBusy(false);
    }
  };

  const handleVerifyPhone = async () => {
    const normalizedCode = code.trim();
    setCodeValidation(
      normalizedCode ? "" : "Enter the code sent to your phone.",
    );
    setActionError("");
    if (!normalizedCode) return;

    setBusy(true);
    try {
      const { error } = await signUp.verifications.verifyPhoneCode({
        code: normalizedCode,
      });
      if (error) {
        setActionError(getErrorMessage(error));
        return;
      }

      if (signUp.status === "complete") {
        await finalizeSignUp();
      } else {
        setCode("");
        setStep("requirements");
        setActionError("");
      }
    } catch {
      setActionError(
        "We couldn't verify your phone. Check your connection and try again.",
      );
    } finally {
      setBusy(false);
    }
  };

  const handleSubmitRequirements = async () => {
    const missingFields = signUp.missingFields;
    const missingFirstName = missingFields.includes("first_name");
    const missingLastName = missingFields.includes("last_name");
    const missingUsername = missingFields.includes("username");
    const missingPhoneNumber = missingFields.includes("phone_number");
    const missingLegalAcceptance = missingFields.includes("legal_accepted");
    const missingOtherFields = missingFields.filter(
      (field) =>
        ![
          "first_name",
          "last_name",
          "username",
          "phone_number",
          "legal_accepted",
        ].includes(field),
    );

    const validationMessages = [
      missingFirstName && !firstName.trim() ? "Enter your first name." : "",
      missingLastName && !lastName.trim() ? "Enter your last name." : "",
      missingUsername && !username.trim() ? "Choose a username." : "",
      missingPhoneNumber && !/^\+[1-9]\d{7,14}$/.test(phoneNumber.trim())
        ? "Enter a valid phone number in international format, such as +14155552671."
        : "",
      missingLegalAcceptance && !legalAccepted
        ? "Accept the terms to continue."
        : "",
    ].filter(Boolean);

    setRequirementsValidation(validationMessages.join(" "));
    setActionError("");
    if (validationMessages.length > 0) return;

    if (missingOtherFields.length > 0) {
      setActionError(
        `Your account requires additional verification (${formatFieldNames(missingOtherFields)}). Please update the required sign-up fields in your Clerk settings and try again.`,
      );
      return;
    }

    setBusy(true);
    try {
      const { error } = await signUp.update({
        ...(missingFirstName ? { firstName: firstName.trim() } : {}),
        ...(missingLastName ? { lastName: lastName.trim() } : {}),
        ...(missingUsername ? { username: username.trim() } : {}),
        ...(missingPhoneNumber ? { phoneNumber: phoneNumber.trim() } : {}),
        ...(missingLegalAcceptance ? { legalAccepted: true } : {}),
      });
      if (error) {
        setActionError(
          missingPhoneNumber
            ? getPhoneErrorMessage(error)
            : getErrorMessage(error),
        );
        return;
      }

      if (missingPhoneNumber) {
        const { error: sendError } =
          await signUp.verifications.sendPhoneCode();
        if (sendError) {
          setActionError(getPhoneErrorMessage(sendError));
          return;
        }
        setCode("");
        setStep("phone-verification");
        return;
      }

      await finalizeSignUp();
    } catch {
      setActionError(
        "We couldn't save your account details. Check your connection and try again.",
      );
    } finally {
      setBusy(false);
    }
  };

  const handleResendCode = async () => {
    setActionError("");
    setBusy(true);
    try {
      const { error } = await signUp.verifications.sendEmailCode();
      if (error) setActionError(getErrorMessage(error));
    } catch {
      setActionError(
        "We couldn't send a new code. Check your connection and try again.",
      );
    } finally {
      setBusy(false);
    }
  };

  const handleResendPhoneCode = async () => {
    setActionError("");
    setBusy(true);
    try {
      const { error } = await signUp.verifications.sendPhoneCode();
      if (error) setActionError(getErrorMessage(error));
    } catch {
      setActionError(
        "We couldn't send a new code. Check your connection and try again.",
      );
    } finally {
      setBusy(false);
    }
  };

  const handleResetSignUp = async () => {
    await signUp.reset();
    setCode("");
    setActionError("");
    setRequirementsValidation("");
    setStep("credentials");
  };

  const footer =
    step === "credentials" ? (
      <>
        <Text className="auth-link-copy">Already have an account?</Text>
        <Link href="/(auth)/sign-in" asChild>
          <Pressable accessibilityRole="link">
            <Text className="auth-link">Sign in</Text>
          </Pressable>
        </Link>
      </>
    ) : (
      <Pressable
        accessibilityRole="button"
        disabled={isBusy}
        onPress={handleResetSignUp}
      >
        <Text className="auth-link">Start over</Text>
      </Pressable>
    );

  return (
    <AuthScreen
      footer={footer}
      subtitle={
        step === "verification"
          ? `Enter the verification code we sent to ${emailAddress.trim()}.`
          : step === "phone-verification"
            ? `Enter the code we sent to ${phoneNumber.trim()}.`
            : step === "requirements"
              ? "Add the details needed to finish setting up your account."
              : "Create your account to keep every renewal in view."
      }
      title={
        step === "verification"
          ? "Verify your email"
          : step === "phone-verification"
            ? "Verify your phone"
            : step === "requirements"
              ? "Complete your account"
              : "Create your account"
      }
    >
      {step === "credentials" ? (
        <View className="auth-form">
          <AuthField
            autoCapitalize="none"
            autoComplete="email"
            error={emailValidation || errors.fields.emailAddress?.message || ""}
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
          <AuthField
            autoComplete="new-password"
            error={passwordValidation || errors.fields.password?.message || ""}
            label="Password"
            onChangeText={(value) => {
              setPassword(value);
              setPasswordValidation("");
              if (confirmPassword) setConfirmValidation("");
            }}
            returnKeyType="next"
            secureTextEntry
            textContentType="newPassword"
            value={password}
          />
          <AuthField
            autoComplete="new-password"
            error={confirmValidation}
            label="Confirm password"
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
          <Text className="auth-helper">
            Use at least 8 characters. Your email will be verified before you
            can sign in.
          </Text>
          <AuthButton
            loading={isBusy}
            onPress={handleCreateAccount}
            title="Create account"
          />
          <View nativeID="clerk-captcha" />
        </View>
      ) : step === "verification" || step === "phone-verification" ? (
        <View className="auth-form">
          <AuthField
            autoComplete="one-time-code"
            error={codeValidation || errors.fields.code?.message || ""}
            keyboardType="number-pad"
            label={
              step === "phone-verification"
                ? "Phone verification code"
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
            onPress={
              step === "phone-verification"
                ? handleVerifyPhone
                : handleVerifyEmail
            }
            title={
              step === "phone-verification" ? "Verify phone" : "Verify email"
            }
          />
          <Pressable
            accessibilityRole="button"
            className="items-center py-2"
            disabled={isBusy}
            onPress={
              step === "phone-verification"
                ? handleResendPhoneCode
                : handleResendCode
            }
          >
            <Text className="auth-link">Resend code</Text>
          </Pressable>
        </View>
      ) : (
        <View className="auth-form">
          {signUp.missingFields.some(
            (field) =>
              ![
                "first_name",
                "last_name",
                "username",
                "phone_number",
                "legal_accepted",
              ].includes(field),
          ) ? (
            <Text className="auth-helper">
              Your account also requires{" "}
              {formatFieldNames(
                signUp.missingFields.filter(
                  (field) =>
                    ![
                      "first_name",
                      "last_name",
                      "username",
                      "phone_number",
                      "legal_accepted",
                    ].includes(field),
                ),
              )}
              . You may need to update the required sign-up fields in your
              account settings.
            </Text>
          ) : null}
          {signUp.missingFields.includes("first_name") ? (
            <AuthField
              autoCapitalize="words"
              error={requirementsValidation.includes("first name") ? "Enter your first name." : ""}
              label="First name"
              onChangeText={(value) => {
                setFirstName(value);
                setRequirementsValidation("");
              }}
              textContentType="givenName"
              value={firstName}
            />
          ) : null}
          {signUp.missingFields.includes("last_name") ? (
            <AuthField
              autoCapitalize="words"
              error={requirementsValidation.includes("last name") ? "Enter your last name." : ""}
              label="Last name"
              onChangeText={(value) => {
                setLastName(value);
                setRequirementsValidation("");
              }}
              textContentType="familyName"
              value={lastName}
            />
          ) : null}
          {signUp.missingFields.includes("username") ? (
            <AuthField
              autoCapitalize="none"
              autoCorrect={false}
              error={requirementsValidation.includes("username") ? "Choose a username." : ""}
              label="Username"
              onChangeText={(value) => {
                setUsername(value);
                setRequirementsValidation("");
              }}
              value={username}
            />
          ) : null}
          {signUp.missingFields.includes("phone_number") ? (
            <AuthField
              autoCapitalize="none"
              autoComplete="tel"
              error={
                requirementsValidation.includes("phone number")
                  ? "Enter a valid phone number in international format."
                  : ""
              }
              keyboardType="phone-pad"
              label="Phone number"
              onChangeText={(value) => {
                setPhoneNumber(value);
                setRequirementsValidation("");
              }}
              placeholder="+14155552671"
              textContentType="telephoneNumber"
              value={phoneNumber}
            />
          ) : null}
          {signUp.missingFields.includes("legal_accepted") ? (
            <Pressable
              accessibilityRole="checkbox"
              accessibilityState={{ checked: legalAccepted }}
              className="flex-row items-center gap-3 py-2"
              onPress={() => setLegalAccepted((accepted) => !accepted)}
            >
              <View
                className={`h-5 w-5 items-center justify-center rounded border ${
                  legalAccepted ? "border-accent bg-accent" : "border-primary/40"
                }`}
              >
                {legalAccepted ? (
                  <Text className="font-sans-bold text-xs text-primary">✓</Text>
                ) : null}
              </View>
              <Text className="flex-1 font-sans-regular text-sm text-primary">
                I agree to the terms and privacy policy.
              </Text>
            </Pressable>
          ) : null}
          {requirementsValidation ? (
            <AuthFeedback>{requirementsValidation}</AuthFeedback>
          ) : null}
          {actionError ? <AuthFeedback>{actionError}</AuthFeedback> : null}
          <AuthButton
            loading={isBusy}
            onPress={handleSubmitRequirements}
            title="Continue"
          />
        </View>
      )}
    </AuthScreen>
  );
}