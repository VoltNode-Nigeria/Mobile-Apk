import { useEffect } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '../../src/store/auth.store';
import { Colors } from '../../src/constants';

export default function Splash() {
  const { user, isInitialized } = useAuthStore();
  const opacity = new Animated.Value(0);
  const scale = new Animated.Value(0.8);

  useEffect(() => {
    Animated.parallel([
      Animated.timing(opacity, { toValue: 1, duration: 800, useNativeDriver: true }),
      Animated.spring(scale, { toValue: 1, friction: 4, useNativeDriver: true }),
    ]).start();

    const timer = setTimeout(() => {
      if (isInitialized && user) {
        router.replace('/(app)/map');
      } else {
        router.replace('/(auth)/onboarding');
      }
    }, 2500);

    return () => clearTimeout(timer);
  }, [isInitialized, user]);

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.content, { opacity, transform: [{ scale }] }]}>
        <View style={styles.logoCircle}>
          <Ionicons name="flash" size={52} color={Colors.primary} />
        </View>
        <View style={styles.wordmark}>
          <Text style={styles.volt}>VOLT</Text>
          <Text style={styles.node}>NODE</Text>
        </View>
        <Text style={styles.tagline}>DIGITAL TWIN · EV INFRASTRUCTURE</Text>
        <Text style={styles.byline}>By HydroGEM Advisory</Text>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.navy, justifyContent: 'center', alignItems: 'center' },
  content: { alignItems: 'center' },
  logoCircle: {
    width: 100, height: 100, borderRadius: 50,
    backgroundColor: Colors.circuitBlue,
    borderWidth: 2, borderColor: Colors.primary,
    justifyContent: 'center', alignItems: 'center', marginBottom: 24,
  },
  wordmark: { flexDirection: 'row', marginBottom: 12 },
  volt: { fontSize: 48, fontWeight: 'bold', color: '#FFFFFF', letterSpacing: 2 },
  node: { fontSize: 48, fontWeight: 'bold', color: Colors.primary, letterSpacing: 2 },
  tagline: { fontSize: 11, color: Colors.primary, letterSpacing: 3, marginBottom: 8 },
  byline: { fontSize: 12, color: Colors.offline },
});