import { Tabs } from 'expo-router';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../src/constants';

function TabIcon({ focused, label, name }: {
  focused: boolean;
  label: string;
  name: React.ComponentProps<typeof Ionicons>['name'];
}) {
  return (
    <View style={styles.tabIcon}>
      <Ionicons
        name={name}
        size={26}
        color={focused ? Colors.primary : Colors.offline}
      />
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
          paddingBottom: 0,
          paddingTop: 8,
          alignContent: 'center',
          alignItems: 'center',
        },
        tabBarItemStyle: {
          minWidth: 60,
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
            <TabIcon focused={focused} label="Map" name={focused ? 'map' : 'map-outline'} />
          ),
        }}
      />
      <Tabs.Screen
        name="sessions"
        options={{
          tabBarLabel: '',
          tabBarIcon: ({ focused }) => (
            <TabIcon focused={focused} label="Sessions" name={focused ? 'flash' : 'flash-outline'} />
          ),
        }}
      />
      <Tabs.Screen
        name="history"
        options={{
          tabBarLabel: '',
          tabBarIcon: ({ focused }) => (
            <TabIcon focused={focused} label="History" name={focused ? 'list' : 'list-outline'} />
          ),
        }}
      />
      <Tabs.Screen
        name="wallet"
        options={{
          tabBarLabel: '',
          tabBarIcon: ({ focused }) => (
            <TabIcon focused={focused} label="Wallet" name={focused ? 'wallet' : 'wallet-outline'} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          tabBarLabel: '',
          tabBarIcon: ({ focused }) => (
            <TabIcon focused={focused} label="Profile" name={focused ? 'person' : 'person-outline'} />
          ),
        }}
      />
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
    paddingTop: 4,
    width: 70,
  },
  label: {
    fontSize: 10,
    marginTop: 2,
    fontWeight: '500',
    textAlign: 'center',
    width: 70,
  },
});