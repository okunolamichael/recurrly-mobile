import { useAuth } from "@clerk/expo";
import { Redirect, Stack } from "expo-router";
import { AuthLoadingView } from "@/components/auth-ui";

export default function SubscriptionDetailsLayout() {
  const { isLoaded, isSignedIn } = useAuth();

  if (!isLoaded) return <AuthLoadingView />;
  if (!isSignedIn) return <Redirect href="/(auth)/sign-in" />;

  return <Stack screenOptions={{ headerShown: false }} />;
}
