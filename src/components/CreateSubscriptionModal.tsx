import { clsx } from "clsx";
import dayjs from "dayjs";
import { useState } from "react";
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";
import { AuthField } from "@/components/auth-ui";
import { icons } from "@/constants/icons";

const categories = [
  "Entertainment",
  "AI Tools",
  "Developer Tools",
  "Design",
  "Productivity",
  "Cloud",
  "Music",
  "Other",
] as const;

type Category = (typeof categories)[number];
type Frequency = "Monthly" | "Yearly";

const categoryColors: Record<Category, string> = {
  Entertainment: "#f5c542",
  "AI Tools": "#b8d4e3",
  "Developer Tools": "#e8def8",
  Design: "#b8e8d0",
  Productivity: "#f6eecf",
  Cloud: "#d6e5fa",
  Music: "#f7c8cf",
  Other: "#fff8e7",
};

type CreateSubscriptionModalProps = {
  visible: boolean;
  onClose: () => void;
  onCreate: (subscription: Subscription) => void;
};

export default function CreateSubscriptionModal({
  visible,
  onClose,
  onCreate,
}: CreateSubscriptionModalProps) {
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [frequency, setFrequency] = useState<Frequency>("Monthly");
  const [category, setCategory] = useState<Category>("Entertainment");
  const [submitAttempted, setSubmitAttempted] = useState(false);

  const normalizedName = name.trim();
  const parsedPrice = Number(price.trim());
  const hasValidPrice = Number.isFinite(parsedPrice) && parsedPrice > 0;
  const isValid = normalizedName.length > 0 && hasValidPrice;

  const resetForm = () => {
    setName("");
    setPrice("");
    setFrequency("Monthly");
    setCategory("Entertainment");
    setSubmitAttempted(false);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleSubmit = () => {
    setSubmitAttempted(true);
    if (!isValid) return;

    const startDate = dayjs();
    const renewalDate = startDate.add(
      1,
      frequency === "Monthly" ? "month" : "year",
    );

    onCreate({
      id: `subscription-${Date.now().toString(36)}-${Math.random()
        .toString(36)
        .slice(2, 8)}`,
      name: normalizedName,
      price: parsedPrice,
      frequency,
      category,
      status: "active",
      startDate: startDate.toISOString(),
      renewalDate: renewalDate.toISOString(),
      icon: icons.wallet,
      billing: frequency,
      color: categoryColors[category],
    });

    resetForm();
    onClose();
  };

  return (
    <Modal
      animationType="slide"
      onRequestClose={handleClose}
      transparent
      visible={visible}
    >
      <View className="modal-overlay justify-end">
        <Pressable
          accessibilityLabel="Close new subscription form"
          accessibilityRole="button"
          className="absolute inset-0"
          onPress={handleClose}
        />
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : undefined}
        >
          <View className="modal-container w-full">
            <View className="modal-header">
              <Text className="modal-title">New Subscription</Text>
              <Pressable
                accessibilityLabel="Close"
                accessibilityRole="button"
                className="modal-close"
                onPress={handleClose}
              >
                <Text className="modal-close-text">×</Text>
              </Pressable>
            </View>

            <ScrollView
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
            >
              <View className="modal-body">
                <View className="auth-form">
                  <AuthField
                    autoCapitalize="words"
                    error={
                      submitAttempted && !normalizedName
                        ? "Enter a subscription name."
                        : undefined
                    }
                    label="Name"
                    onChangeText={setName}
                    placeholder="e.g. Netflix"
                    value={name}
                  />
                  <AuthField
                    error={
                      submitAttempted && !hasValidPrice
                        ? "Enter a price greater than zero."
                        : undefined
                    }
                    keyboardType="decimal-pad"
                    label="Price"
                    onChangeText={setPrice}
                    placeholder="0.00"
                    value={price}
                  />

                  <View className="auth-field">
                    <Text className="auth-label">Frequency</Text>
                    <View className="picker-row">
                      {(["Monthly", "Yearly"] as const).map((option) => {
                        const selected = frequency === option;
                        return (
                          <Pressable
                            accessibilityRole="radio"
                            accessibilityState={{ selected }}
                            className={clsx(
                              "picker-option",
                              selected && "picker-option-active",
                            )}
                            key={option}
                            onPress={() => setFrequency(option)}
                          >
                            <Text
                              className={clsx(
                                "picker-option-text",
                                selected && "picker-option-text-active",
                              )}
                            >
                              {option}
                            </Text>
                          </Pressable>
                        );
                      })}
                    </View>
                  </View>

                  <View className="auth-field">
                    <Text className="auth-label">Category</Text>
                    <View className="category-scroll">
                      {categories.map((option) => {
                        const selected = category === option;
                        return (
                          <Pressable
                            accessibilityRole="radio"
                            accessibilityState={{ selected }}
                            className={clsx(
                              "category-chip",
                              selected && "category-chip-active",
                            )}
                            key={option}
                            onPress={() => setCategory(option)}
                          >
                            <Text
                              className={clsx(
                                "category-chip-text",
                                selected && "category-chip-text-active",
                              )}
                            >
                              {option}
                            </Text>
                          </Pressable>
                        );
                      })}
                    </View>
                  </View>

                  <Pressable
                    accessibilityHint="A name and a price greater than zero are required."
                    accessibilityRole="button"
                    className={clsx(
                      "auth-button",
                      submitAttempted && !isValid && "auth-button-disabled",
                    )}
                    onPress={handleSubmit}
                  >
                    <Text className="auth-button-text">Create Subscription</Text>
                  </Pressable>
                </View>
              </View>
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
}
