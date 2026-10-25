import { View, Text } from 'react-native'
import { useSafeAreaInsets } from "react-native-safe-area-context";

const Insights = () => {
  const insets = useSafeAreaInsets();

  return (
    <View
      style={{
        flex: 1,
        paddingTop: insets.top,
      }}
    >
      <Text>Insights</Text>
    </View>
  );
}

export default Insights