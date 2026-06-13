import {
  View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useAuthStore } from '../../src/store/auth.store';
import { useMyActiveSessions } from '../../src/lib/hooks';
import { Colors } from '../../src/constants';
import { formatNaira } from '../../src/lib/api';

export default function Sessions() {
  const { user } = useAuthStore();
  const { data: sessions = [], isLoading } = useMyActiveSessions(user?.id ?? '');

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
        <Text style={styles.title}>Active Sessions</Text>
        <Text style={styles.count}>{sessions.length} active</Text>
      </View>

      {sessions.length === 0 ? (
        <View style={styles.empty}>
          <Ionicons name="flash-outline" size={64} color={Colors.border} style={styles.emptyIcon} />
          <Text style={styles.emptyTitle}>No Active Sessions</Text>
          <Text style={styles.emptySub}>Start charging at a nearby station</Text>
          <TouchableOpacity
            style={styles.findBtn}
            onPress={() => router.push('/(app)/map')}
          >
            <Text style={styles.findBtnText}>Find a Station</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={sessions}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.sessionCard}
              onPress={() => router.push(`/(app)/active-session/${item.id}`)}
            >
              <View style={styles.cardHeader}>
                <Text style={styles.stationName}>{item.station?.name ?? 'Station'}</Text>
                <View style={styles.activeBadge}>
                  <View style={styles.activeDot} />
                  <Text style={styles.activeText}>ACTIVE</Text>
                </View>
              </View>
              <Text style={styles.bayLabel}>{item.bay?.label ?? ''} · {item.bay?.chargerType ?? ''}</Text>
              <View style={styles.statsRow}>
                <View style={styles.stat}>
                  <Text style={styles.statValue}>{item.kwhDispensed.toFixed(2)}</Text>
                  <Text style={styles.statLabel}>kWh</Text>
                </View>
                <View style={styles.stat}>
                  <Text style={[styles.statValue, { color: Colors.primary }]}>
                    {formatNaira(item.costNaira)}
                  </Text>
                  <Text style={styles.statLabel}>Cost</Text>
                </View>
                <View style={styles.stat}>
                  <View style={styles.paymentMethodRow}>
                    <Ionicons
                      name={item.paymentMethod === 'WALLET' ? 'wallet' : 'card'}
                      size={14}
                      color={Colors.textSecondary}
                      style={{ marginRight: 6 }}
                    />
                    <Text style={styles.statValue}>{item.paymentMethod}</Text>
                  </View>
                  <Text style={styles.statLabel}>Payment</Text>
                </View>
              </View>
              <View style={styles.viewBtn}>
                <Text style={styles.viewBtnText}>View Live Session</Text>
                <Ionicons name="arrow-forward" size={14} color={Colors.primary} style={{ marginLeft: 8 }} />
              </View>
            </TouchableOpacity>
          )}
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

  sessionCard: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 16,
    borderLeftWidth: 4,
    borderLeftColor: Colors.primary,
  },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 },
  stationName: { fontSize: 16, fontWeight: 'bold', color: Colors.navy },
  activeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E0F7FA',
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 3,
    gap: 4,
  },
  activeDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: Colors.primary },
  activeText: { color: Colors.primary, fontSize: 10, fontWeight: 'bold' },
  bayLabel: { fontSize: 13, color: Colors.textSecondary, marginBottom: 12 },

  statsRow: { flexDirection: 'row', marginBottom: 12 },
  stat: { flex: 1, alignItems: 'center' },
  paymentMethodRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center' },
  statValue: { fontSize: 16, fontWeight: 'bold', color: Colors.navy },
  statLabel: { fontSize: 11, color: Colors.textSecondary, marginTop: 2 },

  viewBtn: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', backgroundColor: Colors.navy, borderRadius: 10, paddingVertical: 10 },
  viewBtnText: { color: Colors.primary, fontWeight: '600', fontSize: 13 },

  empty: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 32 },
  emptyIcon: { marginBottom: 16 },
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