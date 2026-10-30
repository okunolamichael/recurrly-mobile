import { GlassView } from "expo-glass-effect";
import { SymbolView } from "expo-symbols";
import type { ComponentProps } from "react";
import { Pressable, StyleSheet, View } from "react-native";

type GlassIconButtonProps = {
  accessibilityLabel: string;
  name: ComponentProps<typeof SymbolView>["name"];
  onPress?: () => void;
};

export default function GlassIconButton({
  accessibilityLabel,
  name,
  onPress,
}: GlassIconButtonProps) {
  const icon = (
    <>
      <GlassView isInteractive={Boolean(onPress)} style={styles.glass} />
      <SymbolView
        name={name}
        size={22}
        tintColor="#081126"
        style={styles.symbol}
      />
    </>
  );

  if (!onPress) {
    return (
      <View
        accessibilityLabel={accessibilityLabel}
        accessible
        style={styles.button}
      >
        {icon}
      </View>
    );
  }

  return (
    <Pressable
      accessibilityLabel={accessibilityLabel}
      accessibilityRole="button"
      onPress={onPress}
      style={styles.button}
    >
      {icon}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    alignItems: "center",
    height: 48,
    justifyContent: "center",
    width: 48,
  },
  glass: {
    ...StyleSheet.absoluteFill,
    borderRadius: 24,
  },
  symbol: {
    height: 24,
    width: 24,
  },
});
