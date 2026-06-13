import {
  View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator,
} from 'react-native';
import { router } from 'expo-router';
import { useAuthStore } from '../../src/store/auth.store';
import { useSessionHistory } from '../../src/lib/hooks';
import { Colors } from '../../src/constants';
import { formatNaira } from '../../src/lib/api';
import type { Session } from '../../src/lib/types';

function SessionCard({ session }: { session: Session }) {
  const isWallet = session.paymentMethod === 'WALLET';
  const isPaid = session.payment?.status === 'SUCCESS' || isWallet;

  return (
    <View style={styles.card}>
      <View style={styles.cardLeft}>
        <View style={styles.iconCircle}>
          <Text style={styles.iconEmoji}>⚡</Text>
        </View>
      </View>
      <View style={styles.cardMiddle}>
        <Text style={styles.stationName}>
          {session.station?.name ?? 'Unknown Station'}
        </Text>
        <Text style={styles.sessionMeta}>
          {session.bay?.label ?? ''} · {session.paymentMethod === 'WALLET' ? '💳 Wallet' : '🏦 Card'}
        </Text>
        <Text style={styles.sessionDate}>
          {session.createdAt
            ? new Date(session.createdAt).toLocaleDateString('en-NG', {
                day: 'numeric', month: 'short', year: 'numeric',
              })
            : '—'}
        </Text>
      </View>
      <View style={styles.cardRight}>
        <Text style={styles.kwhText}>
          {session.kwhDispensed?.toFixed(2) ?? '0.00'} kWh
        </Text>
        <Text style={styles.costText}>{formatNaira(session.costNaira)}</Text>
        <View style={[
          styles.paidBadge,
          isPaid ? styles.paidBadgeGreen : styles.paidBadgeAmber,
        ]}>
          <Text style={[
            styles.paidText,
            isPaid ? styles.paidTextGreen : styles.paidTextAmber,
          ]}>
            {isPaid ? 'PAID' : 'PENDING'}
          </Text>
        </View>
      </View>
    </View>
  );
}

export default function History() {
  const { user } = useAuthStore();
  const { data, isLoading } = useSessionHistory(user?.id ?? '');

  const sessions: Session[] = Array.isArray(data)
    ? data
    : data?.data ?? [];

  const completed = sessions.filter(
    (s) => s.status === 'COMPLETED' || s.status === 'CANCELLED'
  );

  if (isLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Session History</Text>
        <Text style={styles.count}>{completed.length} sessions</Text>
      </View>

      {completed.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyEmoji}>⚡</Text>
          <Text style={styles.emptyTitle}>No sessions yet</Text>
          <Text style={styles.emptySub}>Start charging to see your history here</Text>
          <TouchableOpacity
            style={styles.findBtn}
            onPress={() => router.push('/(app)/map')}
          >
            <Text style={styles.findBtnText}>Find a Station</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={completed}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => <SessionCard session={item} />}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },

  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  title: { fontSize: 22, fontWeight: 'bold', color: Colors.navy },
  count: { fontSize: 14, color: Colors.textSecondary },

  list: { padding: 16, gap: 12 },

  card: {
    flexDirection: 'row',
    backgroundColor: Colors.surface,
    borderRadius: 14,
    padding: 14,
    alignItems: 'center',
  },
  cardLeft: { marginRight: 12 },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.navy,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconEmoji: { fontSize: 18 },
  cardMiddle: { flex: 1 },
  stationName: { fontSize: 14, fontWeight: '600', color: Colors.navy, marginBottom: 2 },
  sessionMeta: { fontSize: 12, color: Colors.textSecondary, marginBottom: 2 },
  sessionDate: { fontSize: 11, color: Colors.offline },
  cardRight: { alignItems: 'flex-end' },
  kwhText: { fontSize: 13, fontWeight: '600', color: Colors.navy, marginBottom: 2 },
  costText: { fontSize: 14, fontWeight: 'bold', color: Colors.primary, marginBottom: 4 },
  paidBadge: { borderRadius: 10, paddingHorizontal: 8, paddingVertical: 3 },
  paidBadgeGreen: { backgroundColor: Colors.successBg },
  paidBadgeAmber: { backgroundColor: Colors.warningBg },
  paidText: { fontSize: 10, fontWeight: 'bold' },
  paidTextGreen: { color: Colors.success },
  paidTextAmber: { color: Colors.warning },

  empty: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 32 },
  emptyEmoji: { fontSize: 64, marginBottom: 16 },
  emptyTitle: { fontSize: 20, fontWeight: 'bold', color: Colors.navy, marginBottom: 8 },
  emptySub: { fontSize: 14, color: Colors.textSecondary, textAlign: 'center', marginBottom: 24 },
  findBtn: {
    backgroundColor: Colors.primary,
    borderRadius: 12,
    paddingHorizontal: 24,
    paddingVertical: 12,
  },
  findBtnText: { color: Colors.navy, fontWeight: 'bold' },
});