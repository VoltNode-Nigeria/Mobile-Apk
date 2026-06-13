import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useAuthStore } from '../../src/store/auth.store';
import { useWallet } from '../../src/lib/hooks';
import { Colors } from '../../src/constants';

function MenuItem({
  iconName, label, onPress, danger,
}: {
  iconName: React.ComponentProps<typeof Ionicons>['name'];
  label: string;
  onPress: () => void;
  danger?: boolean;
}) {
  return (
    <TouchableOpacity style={styles.menuItem} onPress={onPress}>
      <Ionicons
        name={iconName}
        size={20}
        color={danger ? Colors.error : Colors.textSecondary}
        style={{ marginRight: 12 }}
      />
      <Text style={[styles.menuLabel, danger && styles.menuLabelDanger]}>{label}</Text>
      <Ionicons name="chevron-forward" size={18} color={Colors.border} />
    </TouchableOpacity>
  );
}

export default function Profile() {
  const { user, logout } = useAuthStore();
  const { data: wallet } = useWallet();

  const initials = user?.name
    ? user.name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)
    : '??';

  const handleLogout = () => {
    Alert.alert(
      'Log Out',
      'Are you sure you want to log out?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Log Out',
          style: 'destructive',
          onPress: async () => {
            await logout();
            router.replace('/(auth)/login');
          },
        },
      ]
    );
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Profile</Text>
      </View>

      {/* User Card */}
      <View style={styles.userCard}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{initials}</Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.userName}>{user?.name ?? 'Driver'}</Text>
          <Text style={styles.userEmail}>{user?.email ?? ''}</Text>
          <View style={styles.roleBadge}>
            <Text style={styles.roleText}>DRIVER</Text>
          </View>
        </View>
      </View>

      {/* Wallet Summary */}
      <View style={styles.walletSummary}>
        <Text style={styles.walletLabel}>Wallet Balance</Text>
        <Text style={styles.walletBalance}>
          {wallet?.balance?.toFixed(3) ?? '0.000'} credits
        </Text>
        <TouchableOpacity onPress={() => router.push('/(app)/wallet')}>
          <View style={styles.topUpLink}>
            <Text style={styles.walletLink}>Top Up</Text>
            <Ionicons name="arrow-forward" size={14} color={Colors.primary} style={{ marginLeft: 6 }} />
          </View>
        </TouchableOpacity>
      </View>

      {/* Menu */}
      <View style={styles.menuSection}>
        <Text style={styles.menuTitle}>Account</Text>
        <MenuItem iconName="list-outline" label="Session History" onPress={() => router.push('/(app)/history')} />
        <MenuItem iconName="wallet-outline" label="Wallet & Credits" onPress={() => router.push('/(app)/wallet')} />
        <MenuItem iconName="notifications-outline" label="Notifications" onPress={() => Alert.alert('Coming Soon', 'Push notifications coming in the next update')} />
        <MenuItem iconName="help-circle-outline" label="Help & Support" onPress={() => Alert.alert('Support', 'Email: support@voltnode.com')} />
        <MenuItem iconName="document-text-outline" label="Terms & Privacy" onPress={() => Alert.alert('Terms', 'Terms and privacy policy available at voltnode.com')} />
      </View>

      <View style={styles.menuSection}>
        <MenuItem iconName="log-out-outline" label="Log Out" onPress={handleLogout} danger />
      </View>

      <Text style={styles.version}>VoltNode v1.0.0 · By HydroGEM Advisory</Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },

  header: {
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 16,
  },
  title: { fontSize: 22, fontWeight: 'bold', color: Colors.navy },

  userCard: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 16,
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    gap: 16,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: { fontSize: 20, fontWeight: 'bold', color: Colors.navy },
  userName: { fontSize: 18, fontWeight: 'bold', color: Colors.navy, marginBottom: 2 },
  userEmail: { fontSize: 13, color: Colors.textSecondary, marginBottom: 6 },
  roleBadge: {
    backgroundColor: Colors.navy,
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 3,
    alignSelf: 'flex-start',
  },
  roleText: { color: Colors.primary, fontSize: 10, fontWeight: 'bold', letterSpacing: 1 },

  walletSummary: {
    marginHorizontal: 16,
    backgroundColor: Colors.navy,
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
    flexDirection: 'row',
    alignItems: 'center',
  },
  walletLabel: { color: Colors.offline, fontSize: 13, flex: 1 },
  walletBalance: { color: Colors.primary, fontSize: 16, fontWeight: 'bold', marginRight: 12 },
  walletLink: { color: Colors.primary, fontSize: 14, fontWeight: '600' },
  topUpLink: { flexDirection: 'row', alignItems: 'center' },

  menuSection: {
    marginHorizontal: 16,
    backgroundColor: Colors.surface,
    borderRadius: 16,
    marginBottom: 12,
    overflow: 'hidden',
  },
  menuTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.textSecondary,
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 4,
    letterSpacing: 0.5,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  menuEmoji: { fontSize: 18, marginRight: 12 },
  menuLabel: { flex: 1, fontSize: 15, color: Colors.textPrimary },
  menuLabelDanger: { color: Colors.error },
  menuChevron: { fontSize: 20, color: Colors.border },

  version: {
    textAlign: 'center',
    fontSize: 12,
    color: Colors.offline,
    paddingVertical: 24,
  },
});