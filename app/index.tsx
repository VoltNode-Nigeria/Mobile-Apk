import { Redirect } from 'expo-router';
import { View, ActivityIndicator } from 'react-native';
import { useAuthStore } from '../src/store/auth.store';
import { Colors } from '../src/constants';

export default function Index() {
  const { user, isInitialized } = useAuthStore();

  if (!isInitialized) {
    return (
      <View style={{
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: Colors.navy,
      }}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  // Already logged in — skip splash and onboarding entirely
  if (user) {
    return <Redirect href="/(app)/map" />;
  }

  // First time — show splash
  return <Redirect href="/(auth)/splash" />;
}