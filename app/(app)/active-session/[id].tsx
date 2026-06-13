import { useState, useEffect, useRef } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  ActivityIndicator, Alert, Animated,
} from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { useQueryClient } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';
import { useSession } from '../../../src/lib/hooks';
import { api, formatNaira } from '../../../src/lib/api';
import { Colors } from '../../../src/constants';

function LiveTimer({ startedAt }: { startedAt: string }) {
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    const start = new Date(startedAt).getTime();
    const interval = setInterval(() => {
      setElapsed(Math.floor((Date.now() - start) / 1000));
    }, 1000);
    return () => clearInterval(interval);
  }, [startedAt]);

  const hours = Math.floor(elapsed / 3600);
  const mins = Math.floor((elapsed % 3600) / 60);
  const secs = elapsed % 60;
  const pad = (n: number) => String(n).padStart(2, '0');

  return (
    <Text style={styles.timerText}>
      {hours > 0 ? `${pad(hours)}:` : ''}{pad(mins)}:{pad(secs)}
    </Text>
  );
}

function PulsingDot() {
  const pulse = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 1.4, duration: 800, useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 1, duration: 800, useNativeDriver: true }),
      ])
    ).start();
  }, []);

  return (
    <Animated.View style={[styles.pulsingDot, { transform: [{ scale: pulse }] }]} />
  );
}

export default function ActiveSession() {
  const { id: sessionId } = useLocalSearchParams<{ id: string }>();
  const queryClient = useQueryClient();
  const { data: session, isLoading } = useSession(sessionId);
  const [isEnding, setIsEnding] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const currentKwhRef = useRef(0);

  // IoT kWh simulator — runs every 10 seconds while session is ACTIVE
  useEffect(() => {
    if (!session || session.status !== 'ACTIVE') return;

    currentKwhRef.current = session.kwhDispensed;
    const KWH_PER_INTERVAL = 0.3;

    const interval = setInterval(async () => {
      currentKwhRef.current = Math.round(
        (currentKwhRef.current + KWH_PER_INTERVAL) * 1000
      ) / 1000;

      try {
        await api.post('/iot/ingest', {
          stationId: session.stationId,
          bayId: session.bayId,
          sessionId: session.id,
          kwhReading: currentKwhRef.current,
          status: 'OCCUPIED',
          timestamp: new Date().toISOString(),
        });

        await api.patch(`/sessions/${session.id}`, {
          kwhDispensed: currentKwhRef.current,
        });

        queryClient.invalidateQueries({ queryKey: ['sessions', session.id] });
      } catch (err) {
        console.log('kWh update failed:', err);
      }
    }, 10000);

    return () => clearInterval(interval);
  }, [session?.id, session?.status]);

  const handleEndSession = async () => {
    setIsEnding(true);
    try {
      await api.post(`/sessions/${sessionId}/end`);
      router.replace(`/(app)/session-complete/${sessionId}`);
    } catch (err: any) {
      Alert.alert('Error', err?.response?.data?.message ?? 'Failed to end session');
      setIsEnding(false);
    }
  };

  if (isLoading || !session) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={Colors.primary} />
        <Text style={styles.loadingText}>Loading session...</Text>
      </View>
    );
  }

  const isWallet = session.paymentMethod === 'WALLET';

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <Text style={styles.stationName}>{session.station?.name ?? 'Charging Station'}</Text>
          <Text style={styles.bayLabel}>Bay {session.bay?.label ?? ''}</Text>
        </View>
        <View style={styles.chargingBadge}>
          <PulsingDot />
          <Text style={styles.chargingText}>CHARGING</Text>
        </View>
      </View>

      {/* Main kWh Counter */}
      <View style={styles.kwhContainer}>
        <Text style={styles.kwhValue}>{session.kwhDispensed.toFixed(2)}</Text>
        <Text style={styles.kwhUnit}>kWh dispensed</Text>
        <View style={styles.arcHint}>
          <View style={[styles.arcBar, { width: `${Math.min(session.kwhDispensed * 10, 100)}%` }]} />
        </View>
      </View>

      {/* Cost */}
      <View style={styles.costContainer}>
        <Text style={styles.costLabel}>Current Cost</Text>
        <Text style={styles.costValue}>{formatNaira(session.costNaira)}</Text>
        {isWallet && (
          <Text style={styles.creditsUsed}>
            {session.creditsUsed.toFixed(3)} credits used
          </Text>
        )}
      </View>

      {/* Timer */}
      <View style={styles.timerContainer}>
        <Text style={styles.timerLabel}>Session Duration</Text>
        {session.startedAt ? (
          <LiveTimer startedAt={session.startedAt} />
        ) : (
          <Text style={styles.timerText}>00:00</Text>
        )}
      </View>

      {/* Stats Row */}
      <View style={styles.statsRow}>
        <View style={styles.statBox}>
          <Text style={styles.statValue}>₦{session.pricingPerKwh}/kWh</Text>
          <Text style={styles.statLabel}>Rate</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statBox}>
          <Text style={styles.statValue}>{session.bay?.label ?? '—'}</Text>
          <Text style={styles.statLabel}>Bay</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statBox}>
          <Ionicons
            name={isWallet ? 'wallet' : 'card'}
            size={14}
            color={Colors.navy}
          />
          <Text style={styles.statLabel}>{isWallet ? 'Wallet' : 'Card'}</Text>
        </View>
      </View>

      <View style={styles.liveNoteRow}>
        <Ionicons name="flash" size={13} color={Colors.primary} />
        <Text style={styles.liveNote}>Updates every 10 seconds</Text>
      </View>

      {/* End Session Button */}
      <View style={styles.endContainer}>
        <TouchableOpacity
          style={styles.endBtn}
          onPress={() => setShowConfirm(true)}
          disabled={isEnding}
        >
          {isEnding ? (
            <ActivityIndicator color={Colors.background} />
          ) : (
            <View style={styles.endBtnInner}>
              <Ionicons name="stop-circle" size={20} color={Colors.background} />
              <Text style={styles.endBtnText}>End Session</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      {/* Confirmation Modal */}
      {showConfirm && (
        <View style={styles.modalOverlay}>
          <View style={styles.modal}>
            <Text style={styles.modalTitle}>End this session?</Text>
            <Text style={styles.modalBody}>
              {isWallet
                ? `Your wallet will be charged ${session.creditsUsed.toFixed(3)} credits (${formatNaira(session.costNaira)})`
                : `Your card will be charged ${formatNaira(session.costNaira)}`}
            </Text>
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.modalCancel}
                onPress={() => setShowConfirm(false)}
              >
                <Text style={styles.modalCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.modalConfirm}
                onPress={() => {
                  setShowConfirm(false);
                  handleEndSession();
                }}
              >
                <Text style={styles.modalConfirmText}>End Session</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { marginTop: 12, color: Colors.textSecondary },

  header: {
    backgroundColor: Colors.navy,
    paddingTop: 60,
    paddingBottom: 24,
    paddingHorizontal: 24,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  headerContent: { flex: 1 },
  stationName: { color: Colors.background, fontSize: 18, fontWeight: 'bold', marginBottom: 4 },
  bayLabel: { color: Colors.offline, fontSize: 13 },
  chargingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.circuitBlue,
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
    gap: 8,
  },
  pulsingDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: Colors.primary },
  chargingText: { color: Colors.primary, fontSize: 11, fontWeight: 'bold', letterSpacing: 1 },

  kwhContainer: { alignItems: 'center', paddingVertical: 32, paddingHorizontal: 24 },
  kwhValue: { fontSize: 72, fontWeight: 'bold', color: Colors.navy },
  kwhUnit: { fontSize: 16, color: Colors.textSecondary, marginTop: 4 },
  arcHint: {
    width: '100%', height: 4, backgroundColor: Colors.surface,
    borderRadius: 2, marginTop: 20, overflow: 'hidden',
  },
  arcBar: { height: '100%', backgroundColor: Colors.primary, borderRadius: 2 },

  costContainer: { alignItems: 'center', marginBottom: 20 },
  costLabel: { fontSize: 13, color: Colors.textSecondary, marginBottom: 4 },
  costValue: { fontSize: 36, fontWeight: 'bold', color: Colors.navy },
  creditsUsed: { fontSize: 13, color: Colors.textSecondary, marginTop: 4 },

  timerContainer: { alignItems: 'center', marginBottom: 20 },
  timerLabel: { fontSize: 13, color: Colors.textSecondary, marginBottom: 4 },
  timerText: { fontSize: 28, fontWeight: 'bold', color: Colors.textSecondary },

  statsRow: {
    flexDirection: 'row',
    marginHorizontal: 24,
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 16,
    marginBottom: 8,
  },
  statBox: { flex: 1, alignItems: 'center', gap: 4 },
  statValue: { fontSize: 13, fontWeight: '600', color: Colors.navy },
  statLabel: { fontSize: 11, color: Colors.textSecondary },
  statDivider: { width: 1, backgroundColor: Colors.border },

  liveNoteRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 4,
    marginBottom: 20,
  },
  liveNote: { fontSize: 12, color: Colors.offline },

  endContainer: { paddingHorizontal: 24, paddingBottom: 40 },
  endBtn: {
    backgroundColor: Colors.error,
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
  },
  endBtnInner: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  endBtnText: { color: Colors.background, fontSize: 16, fontWeight: 'bold' },

  modalOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  modal: { backgroundColor: Colors.background, borderRadius: 20, padding: 24, width: '100%' },
  modalTitle: { fontSize: 20, fontWeight: 'bold', color: Colors.navy, marginBottom: 12, textAlign: 'center' },
  modalBody: { fontSize: 14, color: Colors.textSecondary, textAlign: 'center', marginBottom: 24, lineHeight: 22 },
  modalButtons: { flexDirection: 'row', gap: 12 },
  modalCancel: {
    flex: 1, backgroundColor: Colors.surface, borderRadius: 12,
    paddingVertical: 14, alignItems: 'center',
  },
  modalCancelText: { color: Colors.textPrimary, fontWeight: '600' },
  modalConfirm: {
    flex: 1, backgroundColor: Colors.error, borderRadius: 12,
    paddingVertical: 14, alignItems: 'center',
  },
  modalConfirmText: { color: Colors.background, fontWeight: 'bold' },
});