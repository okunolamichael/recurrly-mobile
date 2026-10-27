import { NativeTabs } from "expo-router/native-tabs";
import { Redirect } from "expo-router";
import { useAuth } from "@clerk/expo";
import { AuthLoadingView } from "@/components/auth-ui";

export default function TabLayout() {
  const { isLoaded, isSignedIn } = useAuth();

  if (!isLoaded) return <AuthLoadingView />;
  if (!isSignedIn) return <Redirect href="/(auth)/sign-in" />;

  return (
      <NativeTabs
        badgeBackgroundColor="#EF4444"
        badgeTextColor="#FFFFFF"
        iconColor={{ default: "#8E8E93", selected: "#EF4444" }}
      >
        <NativeTabs.Trigger name="index">
          <NativeTabs.Trigger.Icon sf="house.fill" md="home" />
          <NativeTabs.Trigger.Label>Home</NativeTabs.Trigger.Label>
        </NativeTabs.Trigger>
        <NativeTabs.Trigger name="subscription">
          <NativeTabs.Trigger.Icon
            sf="wallet.pass.fill"
            md="account_balance_wallet"
          />
          <NativeTabs.Trigger.Label>Subscriptions</NativeTabs.Trigger.Label>
        </NativeTabs.Trigger>
        <NativeTabs.Trigger name="insights">
          <NativeTabs.Trigger.Icon sf="chart.bar.fill" md="insights" />
          <NativeTabs.Trigger.Label>Insights</NativeTabs.Trigger.Label>
        </NativeTabs.Trigger>
        <NativeTabs.Trigger name="settings">
          <NativeTabs.Trigger.Icon sf="gearshape.fill" md="settings" />
          <NativeTabs.Trigger.Label>Settings</NativeTabs.Trigger.Label>
        </NativeTabs.Trigger>
      </NativeTabs>
  );
}