import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../src/constants';

export default function Wallet() {
  return (
    <View style={styles.container}>
      <Ionicons name="wallet" size={32} color={Colors.primary} style={{ marginBottom: 12 }} />
      <Text style={styles.text}>Wallet</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background, justifyContent: 'center', alignItems: 'center' },
  text: { fontSize: 32 },
});