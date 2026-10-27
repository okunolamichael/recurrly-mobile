import { useAuth } from "@clerk/expo";
import { Redirect } from "expo-router";
import { AuthLoadingView } from "@/components/auth-ui";

export default function IndexRoute() {
  const { isLoaded, isSignedIn } = useAuth();

  if (!isLoaded) return <AuthLoadingView />;

  return <Redirect href={isSignedIn ? "/(tabs)" : "/(auth)/sign-in"} />;
}
