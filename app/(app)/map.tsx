import { View, Text, StyleSheet } from 'react-native';
import { Colors } from '../../src/constants';

export default function Map() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>🗺️ Map Screen</Text>
      <Text style={styles.sub}>Coming up next</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background, justifyContent: 'center', alignItems: 'center' },
  text: { fontSize: 32, marginBottom: 8 },
  sub: { color: Colors.textSecondary },
});