import { View, Text } from 'react-native'
import { styled } from "nativewind";
import { SafeAreaView as RNSafeAreaView } from "react-native-safe-area-context";

const SafeAreaView = styled(RNSafeAreaView);

const subscription = () => {
  return (
    <SafeAreaView>
      <View>
        <Text>
          Subscription
        </Text>
      </View>

      <View>
        <Text>
          Content
        </Text>
      </View>
    </SafeAreaView>
  )
}

export default subscription