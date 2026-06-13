import { useState, useEffect, useRef } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, TextInput,
  ScrollView, ActivityIndicator, Dimensions, Modal,
} from 'react-native';
import { router } from 'expo-router';
import { useStations } from '../../src/lib/hooks';
import { useAuthStore } from '../../src/store/auth.store';
import { Colors } from '../../src/constants';
import type { Station, Bay } from '../../src/lib/types';
import { Ionicons } from '@expo/vector-icons';

const { width, height } = Dimensions.get('window');

function BayStatusDot({ status }: { status: string }) {
  const color = {
    AVAILABLE: Colors.success,
    OCCUPIED: Colors.primary,
    FAULT: Colors.error,
    OFFLINE: Colors.offline,
  }[status] ?? Colors.offline;

  return <View style={[styles.bayDot, { backgroundColor: color }]} />;
}

function StationPin({
  station,
  onPress,
  index,
}: {
  station: Station;
  onPress: () => void;
  index: number;
}) {
  const hasAvailable = station.availableBays > 0;
  const hasFault = station.faultBays > 0;
  const color = hasFault ? Colors.error : hasAvailable ? Colors.success : Colors.warning;

  // Simulate map positions using index-based offsets
  const positions = [
    { top: height * 0.2, left: width * 0.25 },
    { top: height * 0.35, left: width * 0.6 },
    { top: height * 0.5, left: width * 0.2 },
    { top: height * 0.25, left: width * 0.7 },
    { top: height * 0.45, left: width * 0.5 },
  ];
  const pos = positions[index % positions.length];

  return (
    <TouchableOpacity
      style={[styles.pin, { top: pos.top, left: pos.left, borderColor: color }]}
      onPress={onPress}
    >
      <Ionicons name="flash" size={20} color={Colors.primary} />
      <View style={[styles.pinDot, { backgroundColor: color }]} />
    </TouchableOpacity>
  );
}

function StationBottomSheet({
  station,
  onClose,
  onView,
}: {
  station: Station;
  onClose: () => void;
  onView: () => void;
}) {
  return (
    <View style={styles.bottomSheet}>
      <View style={styles.sheetHandle} />
      <View style={styles.sheetHeader}>
        <View style={{ flex: 1 }}>
          <Text style={styles.sheetName}>{station.name}</Text>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
            <Ionicons name="location" size={13} color={Colors.textSecondary} />
            <Text style={styles.sheetAddress}>{station.address}</Text>
          </View>
        </View>
        <TouchableOpacity onPress={onClose}>
        <Ionicons name="close" size={20} color={Colors.textSecondary} />
        </TouchableOpacity>
      </View>

      <View style={styles.sheetStats}>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{station.totalBays}</Text>
          <Text style={styles.statLabel}>Total Bays</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={[styles.statValue, { color: Colors.success }]}>
            {station.availableBays}
          </Text>
          <Text style={styles.statLabel}>Available</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={[styles.statValue, { color: Colors.primary }]}>
            ₦{station.pricingPerKwh}/kWh
          </Text>
          <Text style={styles.statLabel}>Pricing</Text>
        </View>
      </View>

      <View style={styles.bayRow}>
        {(station.bays ?? []).slice(0, 4).map((bay) => (
          <View key={bay.id} style={styles.bayPill}>
            <BayStatusDot status={bay.status} />
            <Text style={styles.bayLabel}>{bay.label}</Text>
          </View>
        ))}
      </View>

      <TouchableOpacity style={styles.viewBtn} onPress={onView}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          <Text style={styles.viewBtnText}>View Station</Text>
          <Ionicons name="arrow-forward" size={18} color={Colors.navy} />
        </View>
      </TouchableOpacity>
    </View>
  );
}

export default function MapScreen() {
  const { user } = useAuthStore();
  const { data: stations = [], isLoading } = useStations();
  const [selectedStation, setSelectedStation] = useState<Station | null>(null);
  const [search, setSearch] = useState('');

  const filtered = stations.filter((s) =>
    s.name.toLowerCase().includes(search.toLowerCase()) ||
    s.address.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <View style={styles.container}>
      {/* Simulated Map Background */}
      <View style={styles.mapBg}>
        <Text style={styles.mapPlaceholder}>🗺️</Text>
        <Text style={styles.mapHint}>Map View</Text>
        <Text style={styles.mapSub}>Tap a station pin to view details</Text>
      </View>

      {/* Station Pins */}
      {filtered.map((station, index) => (
        <StationPin
          key={station.id}
          station={station}
          index={index}
          onPress={() => setSelectedStation(station)}
        />
      ))}

      {/* Search Bar */}
      <View style={styles.searchBar}>
        <Ionicons name="search" size={16} color={Colors.offline} style={{ marginRight: 8 }} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search for a station..."
          placeholderTextColor={Colors.offline}
          value={search}
          onChangeText={setSearch}
        />
        {isLoading && <ActivityIndicator size="small" color={Colors.primary} />}
      </View>

      {/* Station Count Badge */}
      <View style={styles.countBadge}>
        <Text style={styles.countText}>
          {filtered.length} station{filtered.length !== 1 ? 's' : ''} nearby
        </Text>
      </View>

      {/* Bottom Sheet */}
      {selectedStation && (
        <StationBottomSheet
          station={selectedStation}
          onClose={() => setSelectedStation(null)}
          onView={() => {
            router.push(`/(app)/station/${selectedStation.id}`);
            setSelectedStation(null);
          }}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.surface },

  // Map background simulation
  mapBg: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#E8F0E9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  mapPlaceholder: { fontSize: 64, opacity: 0.3 },
  mapHint: { fontSize: 18, color: Colors.textSecondary, opacity: 0.5, marginTop: 8 },
  mapSub: { fontSize: 13, color: Colors.offline, marginTop: 4 },

  // Station pins
  pin: {
    position: 'absolute',
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.navy,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  pinEmoji: { fontSize: 20 },
  pinDot: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 10,
    height: 10,
    borderRadius: 5,
    borderWidth: 1.5,
    borderColor: Colors.navy,
  },

  // Search bar
  searchBar: {
    position: 'absolute',
    top: 60,
    left: 16,
    right: 16,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.background,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  searchIcon: { fontSize: 16, marginRight: 8 },
  searchInput: { flex: 1, fontSize: 15, color: Colors.textPrimary },

  // Count badge
  countBadge: {
    position: 'absolute',
    top: 118,
    left: 16,
    backgroundColor: Colors.navy,
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  countText: { color: Colors.background, fontSize: 12, fontWeight: '600' },

  // Bottom sheet
  bottomSheet: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: Colors.background,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 10,
  },
  sheetHandle: {
    width: 40,
    height: 4,
    backgroundColor: Colors.border,
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 16,
  },
  sheetHeader: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 16 },
  sheetName: { fontSize: 18, fontWeight: 'bold', color: Colors.navy, marginBottom: 4 },
  sheetAddress: { fontSize: 13, color: Colors.textSecondary },
  closeBtn: { fontSize: 18, color: Colors.textSecondary, padding: 4 },

  // Stats
  sheetStats: {
    flexDirection: 'row',
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  statItem: { flex: 1, alignItems: 'center' },
  statValue: { fontSize: 16, fontWeight: 'bold', color: Colors.navy, marginBottom: 4 },
  statLabel: { fontSize: 11, color: Colors.textSecondary },
  statDivider: { width: 1, backgroundColor: Colors.border },

  // Bay pills
  bayRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 16 },
  bayPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 6,
    gap: 6,
  },
  bayDot: { width: 8, height: 8, borderRadius: 4 },
  bayLabel: { fontSize: 12, color: Colors.textPrimary, fontWeight: '500' },

  // View button
  viewBtn: {
    backgroundColor: Colors.primary,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  viewBtnText: { color: Colors.navy, fontSize: 16, fontWeight: 'bold' },
});