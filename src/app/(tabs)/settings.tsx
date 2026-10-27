import { useClerk, useUser } from "@clerk/expo";
import { useState } from "react";
import { Pressable, Text, TextInput, View } from "react-native";
import { styled } from "nativewind";
import { SafeAreaView as RNSafeAreaView } from "react-native-safe-area-context";

const SafeAreaView = styled(RNSafeAreaView);

export default function SettingsScreen() {
  const { signOut } = useClerk();
  const { user, isLoaded: isUserLoaded } = useUser();
  const [busy, setBusy] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [verificationCode, setVerificationCode] = useState("");
  const [pendingPhone, setPendingPhone] = useState<
    NonNullable<typeof user>["phoneNumbers"][number] | null
  >(null);
  const [phoneStep, setPhoneStep] = useState<"phone" | "code">("phone");
  const verifiedPhone = user?.phoneNumbers.find(
    (phone) => phone.verification.status === "verified",
  );

  const handleSignOut = async () => {
    setBusy(true);
    setErrorMessage("");
    try {
      await signOut();
    } catch {
      setErrorMessage("We couldn't sign you out. Please try again.");
    } finally {
      setBusy(false);
    }
  };

  const handleAddPhone = async () => {
    const normalizedPhone = phoneNumber.trim();
    if (!user) {
      setErrorMessage("Your account is still loading. Please try again.");
      return;
    }
    if (!/^\+[1-9]\d{7,14}$/.test(normalizedPhone)) {
      setErrorMessage(
        "Enter a valid phone number in international format, such as +14155552671.",
      );
      return;
    }

    setBusy(true);
    setErrorMessage("");
    try {
      const newPhone =
        user.phoneNumbers.find(
          (phone) =>
            phone.phoneNumber === normalizedPhone &&
            phone.verification.status !== "verified",
        ) ??
        (await user.createPhoneNumber({
          phoneNumber: normalizedPhone,
        }));
      setPendingPhone(newPhone);
      await newPhone.prepareVerification();
      setPhoneStep("code");
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "We couldn't send a verification code. Check the number and try again.",
      );
    } finally {
      setBusy(false);
    }
  };

  const handleResendPhoneCode = async () => {
    if (!pendingPhone) {
      setErrorMessage("Add your phone number again to request a new code.");
      setPhoneStep("phone");
      return;
    }

    setBusy(true);
    setErrorMessage("");
    try {
      await pendingPhone.prepareVerification();
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "We couldn't send a new verification code. Please try again.",
      );
    } finally {
      setBusy(false);
    }
  };

  const handleVerifyPhone = async () => {
    if (!pendingPhone) {
      setErrorMessage("Add your phone number again to request a new code.");
      setPhoneStep("phone");
      return;
    }
    if (!verificationCode.trim()) {
      setErrorMessage("Enter the verification code we sent to your phone.");
      return;
    }

    setBusy(true);
    setErrorMessage("");
    try {
      const verified = await pendingPhone.attemptVerification({
        code: verificationCode.trim(),
      });
      if (verified.verification.status !== "verified") {
        setErrorMessage("That code did not verify your phone. Please try again.");
        return;
      }

      setPhoneNumber("");
      setVerificationCode("");
      setPendingPhone(null);
      setPhoneStep("phone");
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "We couldn't verify your phone. Check the code and try again.",
      );
    } finally {
      setBusy(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-background p-5">
      <View className="gap-2">
        <Text className="font-sans-bold text-3xl text-primary">Settings</Text>
        <Text className="font-sans-regular text-base text-primary/70">
          Manage your Recurrly account.
        </Text>
      </View>
      <View className="mt-8 rounded-2xl border border-border bg-card p-5">
        <Text className="font-sans-semibold text-lg text-primary">Account</Text>
        <Text className="mt-1 font-sans-regular text-sm text-primary/70">
          {isUserLoaded && verifiedPhone
            ? `Verified phone: ${verifiedPhone.phoneNumber}`
            : "Phone number is optional. Add one later if you need it."}
        </Text>
        {phoneStep === "phone" ? (
          <View className="mt-5 gap-3">
            <Text className="font-sans-medium text-sm text-primary">
              Add a phone number
            </Text>
            <TextInput
              accessibilityLabel="Phone number"
              autoComplete="tel"
              autoCapitalize="none"
              className="rounded-xl border border-border bg-background px-4 py-3 font-sans-regular text-base text-primary"
              editable={!busy}
              keyboardType="phone-pad"
              onChangeText={setPhoneNumber}
              placeholder="+14155552671"
              placeholderTextColor="#596579"
              textContentType="telephoneNumber"
              value={phoneNumber}
            />
            <Pressable
              accessibilityRole="button"
              accessibilityState={{ busy, disabled: busy }}
              className="items-center rounded-xl bg-muted px-5 py-3"
              disabled={busy}
              onPress={handleAddPhone}
            >
              <Text className="font-sans-semibold text-base text-primary">
                {busy ? "Sending code..." : "Send verification code"}
              </Text>
            </Pressable>
          </View>
        ) : (
          <View className="mt-5 gap-3">
            <Text className="font-sans-medium text-sm text-primary">
              Enter the code sent to {phoneNumber.trim()}.
            </Text>
            <TextInput
              accessibilityLabel="Phone verification code"
              autoComplete="one-time-code"
              className="rounded-xl border border-border bg-background px-4 py-3 font-sans-regular text-base text-primary"
              editable={!busy}
              keyboardType="number-pad"
              onChangeText={setVerificationCode}
              placeholder="Verification code"
              placeholderTextColor="#596579"
              textContentType="oneTimeCode"
              value={verificationCode}
            />
            <Pressable
              accessibilityRole="button"
              accessibilityState={{ busy, disabled: busy }}
              className="items-center rounded-xl bg-muted px-5 py-3"
              disabled={busy}
              onPress={handleVerifyPhone}
            >
              <Text className="font-sans-semibold text-base text-primary">
                {busy ? "Verifying..." : "Verify phone"}
              </Text>
            </Pressable>
            <Pressable
              accessibilityRole="button"
              disabled={busy}
              onPress={() => {
                setPhoneStep("phone");
                setVerificationCode("");
                setErrorMessage("");
              }}
            >
              <Text className="text-center font-sans-medium text-sm text-accent">
                Use a different number
              </Text>
            </Pressable>
            <Pressable
              accessibilityRole="button"
              disabled={busy}
              onPress={handleResendPhoneCode}
            >
              <Text className="text-center font-sans-medium text-sm text-accent">
                Resend code
              </Text>
            </Pressable>
          </View>
        )}
        {errorMessage ? (
          <Text accessibilityLiveRegion="polite" className="mt-4 text-destructive">
            {errorMessage}
          </Text>
        ) : null}
        <Pressable
          accessibilityRole="button"
          accessibilityState={{ busy, disabled: busy }}
          className="mt-5 items-center rounded-xl bg-accent px-5 py-4"
          disabled={busy}
          onPress={handleSignOut}
        >
          <Text className="font-sans-semibold text-base text-primary">
            {busy ? "Signing out..." : "Sign out"}
          </Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}