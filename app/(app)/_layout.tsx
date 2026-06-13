import { Tabs } from 'expo-router';
import { View, Text, StyleSheet } from 'react-native';
import { Colors } from '../../src/constants';

function TabIcon({ focused, label, emoji }: { focused: boolean; label: string; emoji: string }) {
  return (
    <View style={styles.tabIcon}>
      <Text style={styles.emoji}>{emoji}</Text>
      <Text style={[styles.label, { color: focused ? Colors.primary : Colors.offline }]}>
        {label}
      </Text>
    </View>
  );
}

export default function AppLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: Colors.navy,
          borderTopColor: Colors.circuitBlue,
          height: 65,
          paddingBottom: 8,
        },
        tabBarActiveTintColor: Colors.primary,
        tabBarInactiveTintColor: Colors.offline,
      }}
    >
      <Tabs.Screen
        name="map"
        options={{
          tabBarLabel: '',
          tabBarIcon: ({ focused }) => (
            <TabIcon focused={focused} label="Map" emoji="🗺️" />
          ),
        }}
      />
      <Tabs.Screen
        name="sessions"
        options={{
          tabBarLabel: '',
          tabBarIcon: ({ focused }) => (
            <TabIcon focused={focused} label="Sessions" emoji="⚡" />
          ),
        }}
      />
      <Tabs.Screen
        name="history"
        options={{
          tabBarLabel: '',
          tabBarIcon: ({ focused }) => (
            <TabIcon focused={focused} label="History" emoji="📋" />
          ),
        }}
      />
      <Tabs.Screen
        name="wallet"
        options={{
          tabBarLabel: '',
          tabBarIcon: ({ focused }) => (
            <TabIcon focused={focused} label="Wallet" emoji="💳" />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          tabBarLabel: '',
          tabBarIcon: ({ focused }) => (
            <TabIcon focused={focused} label="Profile" emoji="👤" />
          ),
        }}
      />

      {/* Hide all dynamic route screens from tab bar */}
      <Tabs.Screen name="station/[id]" options={{ href: null }} />
      <Tabs.Screen name="session-start/[id]" options={{ href: null }} />
      <Tabs.Screen name="active-session/[id]" options={{ href: null }} />
      <Tabs.Screen name="session-complete/[id]" options={{ href: null }} />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabIcon: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 6,
  },
  emoji: { fontSize: 20 },
  label: {
    fontSize: 10,
    marginTop: 2,
    fontWeight: '500',
  },
});