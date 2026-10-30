import { useMemo, useState } from "react";
import {
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  Text,
  TextInput,
  View,
} from "react-native";
import { styled } from "nativewind";
import { SafeAreaView as RNSafeAreaView } from "react-native-safe-area-context";
import { SymbolView } from "expo-symbols";
import { HOME_SUBSCRIPTIONS } from "@/constants/data";
import SubscriptionCard from "@/components/SubscriptionCard";

const SafeAreaView = styled(RNSafeAreaView);

export default function SubscriptionScreen() {
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedSubscriptionId, setExpandedSubscriptionId] = useState<
    string | null
  >(null);
  const filteredSubscriptions = useMemo(() => {
    const query = searchQuery.trim().toLocaleLowerCase();
    if (!query) return HOME_SUBSCRIPTIONS;

    return HOME_SUBSCRIPTIONS.filter((subscription) =>
      [
        subscription.name,
        subscription.plan,
        subscription.category,
        subscription.paymentMethod,
        subscription.billing,
        subscription.status,
      ]
        .filter(Boolean)
        .some((value) => value?.toLocaleLowerCase().includes(query)),
    );
  }, [searchQuery]);

  return (
    <SafeAreaView className="flex-1 bg-background">
      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <FlatList
          className="flex-1 px-5"
          contentContainerClassName="pb-6"
          data={filteredSubscriptions}
          keyExtractor={(item) => item.id}
          keyboardDismissMode="on-drag"
          keyboardShouldPersistTaps="handled"
          renderItem={({ item }) => (
            <SubscriptionCard
              {...item}
              expanded={expandedSubscriptionId === item.id}
              onPress={() =>
                setExpandedSubscriptionId((currentId) =>
                  currentId === item.id ? null : item.id,
                )
              }
            />
          )}
          ItemSeparatorComponent={() => <View className="h-4" />}
          ListHeaderComponent={
            <View className="pb-5 pt-4">
              <Text className="font-sans-bold text-3xl text-primary">
                Subscriptions
              </Text>
              <Text className="mt-1 font-sans-regular text-base text-primary/70">
                Find and manage your recurring payments.
              </Text>

              <View className="mt-6 flex-row items-center rounded-2xl border border-border bg-card px-4">
                <SymbolView
                  name={{ ios: "magnifyingglass", android: "search", web: "search" }}
                  size={20}
                  tintColor="#596579"
                  style={{ height: 20, width: 20 }}
                />
                <TextInput
                  accessibilityLabel="Search subscriptions"
                  autoCapitalize="none"
                  autoCorrect={false}
                  className="min-h-14 flex-1 px-3 font-sans-regular text-base text-primary"
                  onChangeText={(text) => {
                    setSearchQuery(text);
                    setExpandedSubscriptionId(null);
                  }}
                  placeholder="Search subscriptions"
                  placeholderTextColor="#596579"
                  returnKeyType="search"
                  value={searchQuery}
                />
                {searchQuery.length > 0 && (
                  <Pressable
                    accessibilityLabel="Clear search"
                    accessibilityRole="button"
                    hitSlop={8}
                    onPress={() => {
                      setSearchQuery("");
                      setExpandedSubscriptionId(null);
                    }}
                  >
                    <SymbolView
                      name={{
                        ios: "xmark.circle.fill",
                        android: "cancel",
                        web: "cancel",
                      }}
                      size={20}
                      tintColor="#596579"
                      style={{ height: 20, width: 20 }}
                    />
                  </Pressable>
                )}
              </View>
            </View>
          }
          ListEmptyComponent={
            <Text className="home-empty-state">
              No subscriptions match your search.
            </Text>
          }
          showsVerticalScrollIndicator={false}
        />
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}