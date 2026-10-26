import { NativeTabs } from "expo-router/build/native-tabs/NativeTabs.js";
import { View, Text } from "react-native";
import { styled } from "nativewind";
import { SafeAreaView as RNSafeAreaView } from "react-native-safe-area-context";

const SafeAreaView = styled(RNSafeAreaView);


const Insights = () => {

  return (
    <SafeAreaView className="flex bg-background p-5">
      <NativeTabs.Trigger>
        <NativeTabs.Trigger.Label>Index</NativeTabs.Trigger.Label>
      </NativeTabs.Trigger>
      <Text>Insights</Text>
    </SafeAreaView>
  );
};

export default Insights;
