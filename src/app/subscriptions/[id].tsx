
import { useLocalSearchParams, useRouter } from "expo-router";
import { Text, View } from "react-native";
import GlassIconButton from "@/components/GlassIconButton";

const SubscriptionDetails = () => {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();

  return (
    <View className="flex-1 bg-background p-5">
      <GlassIconButton
        accessibilityLabel="Go back"
        name={{
          ios: "chevron.left",
          android: "arrow_back",
          web: "arrow_back",
        }}
        onPress={() => router.back()}
      />
      <Text className="mt-6 font-sans-bold text-2xl text-primary">
        Subscription details: {id}
      </Text>
    </View>
  );
};

export default SubscriptionDetails;