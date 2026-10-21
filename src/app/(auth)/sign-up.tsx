import { Link } from 'expo-router'
import { View, Text } from 'react-native'

const signUp = () => {
  return (
    <View>
      <Text>sign-up</Text>
      <Link href="/(auth)/sign-up">Sign In</Link>
    </View>
  )
}

export default signUp