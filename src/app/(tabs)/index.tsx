import { Link } from "expo-router";
import {styled} from "nativewind"
import { NativeTabs } from "expo-router/build/native-tabs/NativeTabs.js";
import { Text, View } from "react-native";
import { SafeAreaView as RNSafeAreaView } from "react-native-safe-area-context";

const SafeAreaView = styled(RNSafeAreaView);

export default function App() {
  return (
    <SafeAreaView className="flex-1 items-center justify-center bg-background">
      <NativeTabs.Trigger>
        <NativeTabs.Trigger.Label>Index</NativeTabs.Trigger.Label>
      </NativeTabs.Trigger>
      <Text>This is Home Screen</Text>
    </SafeAreaView>
  );
}
