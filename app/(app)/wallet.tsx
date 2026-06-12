import { View, Text, StyleSheet } from 'react-native';
import { Colors } from '../../src/constants';

export default function Wallet() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>💳 Wallet</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background, justifyContent: 'center', alignItems: 'center' },
  text: { fontSize: 32 },
});