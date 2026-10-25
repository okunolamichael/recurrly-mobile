
import { Link, useLocalSearchParams } from 'expo-router'
import { View, Text } from 'react-native'

const SubscriptionDetails = () => {
    const {id} = useLocalSearchParams<{id: string}>();
    
  return (
    <View>
      <Text> subscription Details: {id}</Text>
      <Link href="/">Go back</Link>
    </View>
  )
}

export default SubscriptionDetails