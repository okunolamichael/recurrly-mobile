import { Redirect, Stack } from "expo-router";
import "@/global.css";
import { useAuth } from "@clerk/expo";
import { AuthLoadingView } from "@/components/auth-ui";

export default function RootLayout() {
  const { isLoaded, isSignedIn } = useAuth();

  if (!isLoaded) return <AuthLoadingView />;
  if (isSignedIn) return <Redirect href="/(tabs)" />;

  return <Stack screenOptions={{ headerShown: false }} />;
}
