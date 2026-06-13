import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  ActivityIndicator, Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, router } from 'expo-router';
import { useStation } from '../../../src/lib/hooks';
import { Colors } from '../../../src/constants';
import type { Bay } from '../../../src/lib/types';

function BayCard({ bay }: { bay: Bay }) {
  const statusConfig = {
    AVAILABLE: { color: Colors.success, bg: Colors.successBg, label: 'Available' },
    OCCUPIED: { color: Colors.primary, bg: '#E0F7FA', label: 'Occupied' },
    FAULT: { color: Colors.error, bg: Colors.errorBg, label: 'Fault' },
    OFFLINE: { color: Colors.offline, bg: Colors.surface, label: 'Offline' },
  }[bay.status] ?? { color: Colors.offline, bg: Colors.surface, label: bay.status };

  return (
    <View style={[styles.bayCard, { borderLeftColor: statusConfig.color }]}>
      <View style={{ flex: 1 }}>
        <Text style={styles.bayLabel}>{bay.label}</Text>
        <Text style={styles.bayType}>{bay.chargerType}</Text>
      </View>
      <View style={[styles.statusBadge, { backgroundColor: statusConfig.bg }]}>
        <View style={[styles.statusDot, { backgroundColor: statusConfig.color }]} />
        <Text style={[styles.statusText, { color: statusConfig.color }]}>
          {statusConfig.label}
        </Text>
      </View>
    </View>
  );
}

export default function StationDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data: station, isLoading, error } = useStation(id);

  if (isLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={Colors.primary} />
        <Text style={styles.loadingText}>Loading station...</Text>
      </View>
    );
  }

  if (error || !station) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorText}>Station not found</Text>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Text style={styles.backBtnText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const availableBays = (station.bays ?? []).filter(
    (b) => b.status === 'AVAILABLE'
  );

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backArrow}>
          <Ionicons name="arrow-back" size={24} color={Colors.navy} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Station Detail</Text>
        <View style={{ width: 40 }} />
      </View>

      {/* Station Images */}
      {station.images && station.images.length > 0 && (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.imageScroll}
        >
          {station.images.map((img) => (
            <Image
              key={img.id}
              source={{ uri: img.url }}
              style={styles.stationImage}
              resizeMode="cover"
            />
          ))}
        </ScrollView>
      )}

      {/* Station Info */}
      <View style={styles.infoCard}>
        <View style={styles.infoHeader}>
          <View style={{ flex: 1 }}>
            <Text style={styles.stationName}>{station.name}</Text>
            <Ionicons name="location" size={14} color={Colors.textSecondary} />
          </View>
          <View style={styles.openBadge}>
            <Text style={styles.openText}>Open</Text>
          </View>
        </View>

        {/* Stats Row */}
        <View style={styles.statsRow}>
          <View style={styles.statBox}>
            <Text style={styles.statNum}>{station.totalBays}</Text>
            <Text style={styles.statLbl}>Total Bays</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={[styles.statNum, { color: Colors.success }]}>
              {station.availableBays}
            </Text>
            <Text style={styles.statLbl}>Available</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={[styles.statNum, { color: Colors.primary }]}>
              {station.occupiedBays}
            </Text>
            <Text style={styles.statLbl}>Occupied</Text>
          </View>
        </View>
      </View>

      {/* Pricing */}
      <View style={styles.pricingCard}>
        <Text style={styles.pricingLabel}>Pricing</Text>
        <Text style={styles.pricingValue}>₦{station.pricingPerKwh}/kWh</Text>
        <Text style={styles.pricingNote}>Billed at session end</Text>
      </View>

      {/* Charger Bays */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Charger Bays</Text>
        {(station.bays ?? []).length === 0 ? (
          <Text style={styles.emptyText}>No bays configured yet</Text>
        ) : (
          (station.bays ?? []).map((bay) => (
            <BayCard key={bay.id} bay={bay} />
          ))
        )}
      </View>

      {/* CTA */}
      <View style={styles.ctaContainer}>
        {availableBays.length === 0 ? (
          <View style={styles.ctaDisabled}>
            <Text style={styles.ctaDisabledText}>No Available Bays</Text>
          </View>
        ) : (
          <TouchableOpacity
            style={styles.ctaBtn}
            onPress={() => router.push(`/(app)/session-start/${station.id}`)}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <Ionicons name="flash" size={18} color={Colors.navy} />
              <Text style={styles.ctaBtnText}>
                Start Charging — {availableBays.length} Bay{availableBays.length !== 1 ? 's' : ''} Available
              </Text>
            </View>
          </TouchableOpacity>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 },
  loadingText: { marginTop: 12, color: Colors.textSecondary },
  errorText: { fontSize: 18, color: Colors.error, marginBottom: 16 },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 60,
    paddingBottom: 16,
    backgroundColor: Colors.background,
  },
  backArrow: { width: 40, height: 40, justifyContent: 'center' },
  backArrowText: { fontSize: 24, color: Colors.navy },
  headerTitle: { fontSize: 18, fontWeight: 'bold', color: Colors.navy },

  imageScroll: { paddingLeft: 16, marginBottom: 16 },
  stationImage: {
    width: 200,
    height: 130,
    borderRadius: 12,
    marginRight: 10,
  },

  infoCard: {
    marginHorizontal: 16,
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
  },
  infoHeader: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 16 },
  stationName: { fontSize: 20, fontWeight: 'bold', color: Colors.navy, marginBottom: 4 },
  stationAddress: { fontSize: 14, color: Colors.textSecondary },
  openBadge: {
    backgroundColor: Colors.successBg,
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  openText: { color: Colors.success, fontSize: 12, fontWeight: '600' },

  statsRow: { flexDirection: 'row' },
  statBox: { flex: 1, alignItems: 'center' },
  statNum: { fontSize: 22, fontWeight: 'bold', color: Colors.navy },
  statLbl: { fontSize: 11, color: Colors.textSecondary, marginTop: 2 },

  pricingCard: {
    marginHorizontal: 16,
    backgroundColor: Colors.navy,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    alignItems: 'center',
  },
  pricingLabel: { color: Colors.offline, fontSize: 12, marginBottom: 4 },
  pricingValue: { color: Colors.primary, fontSize: 28, fontWeight: 'bold' },
  pricingNote: { color: Colors.offline, fontSize: 12, marginTop: 4 },

  section: { paddingHorizontal: 16, marginBottom: 16 },
  sectionTitle: { fontSize: 16, fontWeight: 'bold', color: Colors.navy, marginBottom: 12 },
  emptyText: { color: Colors.textSecondary, fontSize: 14 },

  bayCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 14,
    marginBottom: 8,
    borderLeftWidth: 4,
  },
  bayLabel: { fontSize: 15, fontWeight: '600', color: Colors.navy },
  bayType: { fontSize: 12, color: Colors.textSecondary, marginTop: 2 },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 5,
    gap: 5,
  },
  statusDot: { width: 7, height: 7, borderRadius: 3.5 },
  statusText: { fontSize: 12, fontWeight: '600' },

  ctaContainer: { padding: 16, paddingBottom: 32 },
  ctaBtn: {
    backgroundColor: Colors.primary,
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
  },
  ctaBtnText: { color: Colors.navy, fontSize: 16, fontWeight: 'bold' },
  ctaDisabled: {
    backgroundColor: Colors.surface,
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  ctaDisabledText: { color: Colors.offline, fontSize: 16 },

  backBtn: {
    backgroundColor: Colors.primary,
    borderRadius: 12,
    paddingHorizontal: 24,
    paddingVertical: 12,
  },
  backBtnText: { color: Colors.navy, fontWeight: 'bold' },
});