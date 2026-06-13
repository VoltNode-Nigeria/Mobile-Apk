import { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  ActivityIndicator, Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, router } from 'expo-router';
import { useStation, useWallet, useGlobalRate } from '../../../src/lib/hooks';
import { api } from '../../../src/lib/api';
import { useAuthStore } from '../../../src/store/auth.store';
import { Colors } from '../../../src/constants';
import type { Bay } from '../../../src/lib/types';

function PaymentMethodCard({
  method,
  selected,
  onSelect,
  walletBalance,
  globalRate,
  stationRate,
}: {
  method: 'WALLET' | 'CARD';
  selected: boolean;
  onSelect: () => void;
  walletBalance: number;
  globalRate: number;
  stationRate: number;
}) {
  const creditsPerKwh = stationRate / globalRate;
  const estimatedKwh = walletBalance / creditsPerKwh;

  return (
    <TouchableOpacity
      style={[styles.methodCard, selected && styles.methodCardSelected]}
      onPress={onSelect}
    >
      <View style={styles.methodHeader}>
        <Ionicons
          name={method === 'WALLET' ? 'wallet' : 'card'}
          size={24}
          color={Colors.primary}
          style={styles.methodEmoji}
        />
        <View style={{ flex: 1, marginLeft: 12 }}>
          <Text style={styles.methodTitle}>
            {method === 'WALLET' ? 'Pay with Wallet' : 'Pay with Card'}
          </Text>
          <Text style={styles.methodSub}>
            {method === 'WALLET'
              ? `Balance: ${walletBalance.toFixed(2)} credits (~${estimatedKwh.toFixed(1)} kWh)`
              : 'Card charged at session end'}
          </Text>
        </View>
        <View style={[styles.radio, selected && styles.radioSelected]}>
          {selected && <View style={styles.radioDot} />}
        </View>
      </View>

      {method === 'WALLET' && selected && (
        <View style={styles.methodDetail}>
          <Text style={styles.methodDetailText}>
            Credits per kWh at this station: {creditsPerKwh.toFixed(3)}
          </Text>
          <Text style={styles.methodDetailText}>
            Estimated range: ~{estimatedKwh.toFixed(1)} kWh with current balance
          </Text>
        </View>
      )}

      {method === 'CARD' && selected && (
        <View style={styles.methodDetail}>
          <Text style={styles.methodDetailText}>
            Your card will be charged ₦{stationRate}/kWh at session end
          </Text>
          <Text style={styles.methodDetailText}>
            Card must be authorized before first card session
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );
}

export default function SessionStart() {
  const { id: stationId } = useLocalSearchParams<{ id: string }>();
  const { user } = useAuthStore();
  const { data: station, isLoading: stationLoading } = useStation(stationId);
  const { data: wallet } = useWallet();
  const { data: rateData } = useGlobalRate();

  const [selectedBay, setSelectedBay] = useState<Bay | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<'WALLET' | 'CARD'>('WALLET');
  const [isStarting, setIsStarting] = useState(false);

  const globalRate = rateData?.ratePerKwh ?? 85;
  const walletBalance = wallet?.balance ?? 0;
  const stationRate = station?.pricingPerKwh ?? globalRate;

  const availableBays = (station?.bays ?? []).filter(
    (b) => b.status === 'AVAILABLE'
  );

  const handleStartSession = async () => {
    if (!selectedBay) {
      Alert.alert('Select a Bay', 'Please select an available charger bay to continue.');
      return;
    }

    if (paymentMethod === 'WALLET' && walletBalance < stationRate / globalRate) {
      Alert.alert(
        'Insufficient Credits',
        'You don\'t have enough credits to start a session here. Please top up your wallet.',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Top Up', onPress: () => router.push('/(app)/wallet') },
        ]
      );
      return;
    }

    setIsStarting(true);
    try {
      const { data } = await api.post('/sessions', {
        stationId,
        bayId: selectedBay.id,
        paymentMethod,
      });

      router.replace(`/(app)/active-session/${data.id}`);
    } catch (err: any) {
      const message = err?.response?.data?.message ?? 'Failed to start session';

      // Handle card auth required
      try {
        const parsed = JSON.parse(message);
        if (parsed.code === 'CARD_AUTH_REQUIRED') {
          Alert.alert(
            'Card Authorization Required',
            'You need to authorize a card before your first card session. Go to Wallet to add a card.',
            [
              { text: 'Cancel', style: 'cancel' },
              { text: 'Go to Wallet', onPress: () => router.push('/(app)/wallet') },
            ]
          );
          return;
        }
      } catch {}

      Alert.alert('Error', message);
    } finally {
      setIsStarting(false);
    }
  };

  if (stationLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  if (!station) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorText}>Station not found</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backArrow}>
          <Ionicons name="arrow-back" size={24} color={Colors.navy} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Start Charging</Text>
        <View style={{ width: 40 }} />
      </View>

      {/* Station Card */}
      <View style={styles.stationCard}>
        <Text style={styles.stationName}>{station.name}</Text>
        <Text style={styles.stationAddress}>📍 {station.address}</Text>
        <Text style={styles.stationRate}>₦{stationRate}/kWh</Text>
      </View>

      {/* Bay Selection */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Select a Charger Bay</Text>
        {availableBays.length === 0 ? (
          <View style={styles.noBays}>
            <Text style={styles.noBaysText}>No available bays at this station</Text>
          </View>
        ) : (
          availableBays.map((bay) => (
            <TouchableOpacity
              key={bay.id}
              style={[
                styles.bayCard,
                selectedBay?.id === bay.id && styles.bayCardSelected,
              ]}
              onPress={() => setSelectedBay(bay)}
            >
              <View style={{ flex: 1 }}>
                <Text style={styles.bayLabel}>{bay.label}</Text>
                <Text style={styles.bayType}>{bay.chargerType}</Text>
              </View>
              <View style={styles.availableBadge}>
                <View style={[styles.dot, { backgroundColor: Colors.success }]} />
                <Text style={styles.availableText}>Available</Text>
              </View>
              {selectedBay?.id === bay.id && (
                <Ionicons name="checkmark-circle" size={18} color={Colors.primary} />
              )}
            </TouchableOpacity>
          ))
        )}
      </View>

      {/* Payment Method */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Payment Method</Text>
        <PaymentMethodCard
          method="WALLET"
          selected={paymentMethod === 'WALLET'}
          onSelect={() => setPaymentMethod('WALLET')}
          walletBalance={walletBalance}
          globalRate={globalRate}
          stationRate={stationRate}
        />
        <PaymentMethodCard
          method="CARD"
          selected={paymentMethod === 'CARD'}
          onSelect={() => setPaymentMethod('CARD')}
          walletBalance={walletBalance}
          globalRate={globalRate}
          stationRate={stationRate}
        />
      </View>

      {/* Pricing Summary */}
      <View style={styles.summaryCard}>
        <Text style={styles.summaryTitle}>Session Summary</Text>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryKey}>Station Rate</Text>
          <Text style={styles.summaryVal}>₦{stationRate}/kWh</Text>
        </View>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryKey}>Payment</Text>
          <View style={styles.paymentSummary}>
            <Ionicons
              name={paymentMethod === 'WALLET' ? 'wallet' : 'card'}
              size={14}
              color={Colors.navy}
              style={{ marginRight: 8 }}
            />
            <Text style={styles.summaryVal}>{paymentMethod === 'WALLET' ? 'Wallet Credits' : 'Card'}</Text>
          </View>
        </View>
        {paymentMethod === 'WALLET' && (
          <View style={styles.summaryRow}>
            <Text style={styles.summaryKey}>Your Balance</Text>
            <Text style={[styles.summaryVal, { color: Colors.success }]}>
              {walletBalance.toFixed(2)} credits
            </Text>
          </View>
        )}
        <Text style={styles.disclaimer}>
          {paymentMethod === 'WALLET'
            ? 'Session auto-stops when credits run out'
            : 'Card charged at exact amount when session ends'}
        </Text>
      </View>

      {/* CTA */}
      <View style={styles.ctaContainer}>
        <TouchableOpacity
          style={[
            styles.ctaBtn,
            (isStarting || availableBays.length === 0) && styles.ctaBtnDisabled,
          ]}
          onPress={handleStartSession}
          disabled={isStarting || availableBays.length === 0}
        >
          {isStarting ? (
            <ActivityIndicator color={Colors.navy} />
          ) : (
            <View style={styles.ctaBtnContent}>
              <Ionicons name="flash" size={18} color={Colors.navy} style={{ marginRight: 8 }} />
              <Text style={styles.ctaBtnText}>
                {selectedBay ? `Start Session — ${selectedBay.label}` : 'Confirm & Start Session'}
              </Text>
            </View>
          )}
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  errorText: { color: Colors.error, fontSize: 16 },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 60,
    paddingBottom: 16,
  },
  backArrow: { width: 40, height: 40, justifyContent: 'center' },
  backArrowText: { fontSize: 24, color: Colors.navy },
  headerTitle: { fontSize: 18, fontWeight: 'bold', color: Colors.navy },

  stationCard: {
    marginHorizontal: 16,
    backgroundColor: Colors.navy,
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
  },
  stationName: { color: Colors.background, fontSize: 18, fontWeight: 'bold', marginBottom: 4 },
  stationAddress: { color: Colors.offline, fontSize: 13, marginBottom: 8 },
  stationRate: { color: Colors.primary, fontSize: 20, fontWeight: 'bold' },

  section: { paddingHorizontal: 16, marginBottom: 20 },
  sectionTitle: { fontSize: 16, fontWeight: 'bold', color: Colors.navy, marginBottom: 12 },

  noBays: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
  },
  noBaysText: { color: Colors.textSecondary },

  bayCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 14,
    marginBottom: 8,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  bayCardSelected: { borderColor: Colors.primary, backgroundColor: '#E0F7FA' },
  bayLabel: { fontSize: 15, fontWeight: '600', color: Colors.navy },
  bayType: { fontSize: 12, color: Colors.textSecondary, marginTop: 2 },
  availableBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, marginRight: 8 },
  dot: { width: 8, height: 8, borderRadius: 4 },
  availableText: { fontSize: 12, color: Colors.success, fontWeight: '500' },
  selectedCheck: { fontSize: 18, color: Colors.primary, fontWeight: 'bold' },

  methodCard: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 16,
    marginBottom: 10,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  methodCardSelected: { borderColor: Colors.primary },
  methodHeader: { flexDirection: 'row', alignItems: 'center' },
  methodEmoji: { fontSize: 24 },
  methodTitle: { fontSize: 15, fontWeight: '600', color: Colors.navy },
  methodSub: { fontSize: 12, color: Colors.textSecondary, marginTop: 2 },
  radio: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: Colors.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioSelected: { borderColor: Colors.primary },
  radioDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: Colors.primary,
  },
  methodDetail: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    gap: 4,
  },
  methodDetailText: { fontSize: 12, color: Colors.textSecondary },

  summaryCard: {
    marginHorizontal: 16,
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
  },
  summaryTitle: { fontSize: 14, fontWeight: 'bold', color: Colors.navy, marginBottom: 12 },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  summaryKey: { fontSize: 13, color: Colors.textSecondary },
  summaryVal: { fontSize: 13, fontWeight: '600', color: Colors.navy },
  disclaimer: {
    fontSize: 11,
    color: Colors.offline,
    marginTop: 8,
    fontStyle: 'italic',
  },

  ctaContainer: { paddingHorizontal: 16, paddingBottom: 40 },
  ctaBtn: {
    backgroundColor: Colors.primary,
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
  },
  ctaBtnDisabled: { opacity: 0.5 },
  ctaBtnContent: { flexDirection: 'row', alignItems: 'center' },
  ctaBtnText: { color: Colors.navy, fontSize: 16, fontWeight: 'bold' },
  paymentSummary: { flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-end' }
});