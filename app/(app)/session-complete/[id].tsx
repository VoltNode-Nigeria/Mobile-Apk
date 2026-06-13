import { useEffect, useRef } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, Animated,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, router } from 'expo-router';
import { useSession } from '../../../src/lib/hooks';
import { Colors } from '../../../src/constants';
import { formatNaira } from '../../../src/lib/api';

function AnimatedCheck() {
  const scale = useRef(new Animated.Value(0)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(scale, {
        toValue: 1,
        friction: 4,
        tension: 100,
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  return (
    <Animated.View style={[styles.checkCircle, { transform: [{ scale }], opacity }]}>
      <Ionicons name="checkmark" size={44} color={Colors.success} />
    </Animated.View>
  );
}

function ReceiptRow({ label, value, highlight }: {
  label: string;
  value: string;
  highlight?: boolean;
}) {
  return (
    <View style={styles.receiptRow}>
      <Text style={styles.receiptLabel}>{label}</Text>
      <Text style={[styles.receiptValue, highlight && styles.receiptValueHighlight]}>
        {value}
      </Text>
    </View>
  );
}

function formatDuration(ms: number): string {
  const totalSeconds = Math.floor(ms / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const mins = Math.floor((totalSeconds % 3600) / 60);
  const secs = totalSeconds % 60;
  if (hours > 0) return `${hours}h ${mins}m`;
  if (mins > 0) return `${mins}m ${secs}s`;
  return `${secs}s`;
}

export default function SessionComplete() {
  const { id: sessionId } = useLocalSearchParams<{ id: string }>();
  const { data: session } = useSession(sessionId);

  const duration = session?.startedAt && session?.endedAt
    ? new Date(session.endedAt).getTime() - new Date(session.startedAt).getTime()
    : 0;

  const isWallet = session?.paymentMethod === 'WALLET';

  const paymentStatus = session?.payment?.status ?? (isWallet ? 'SUCCESS' : 'PENDING');

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Success Animation */}
      <View style={styles.successSection}>
        <AnimatedCheck />
        <Text style={styles.successTitle}>Session Complete!</Text>
        <Text style={styles.successSub}>
          {isWallet
            ? 'Credits have been deducted from your wallet'
            : 'Your card has been charged'}
        </Text>
      </View>

      {/* Receipt Card */}
      <View style={styles.receiptCard}>
        <Text style={styles.receiptTitle}>Receipt</Text>

        <ReceiptRow
          label="Date"
          value={session?.endedAt
            ? new Date(session.endedAt).toLocaleDateString('en-NG', {
                day: 'numeric', month: 'short', year: 'numeric',
              })
            : '—'}
        />
        <ReceiptRow
          label="Time"
          value={session?.endedAt
            ? new Date(session.endedAt).toLocaleTimeString('en-NG', {
                hour: '2-digit', minute: '2-digit',
              })
            : '—'}
        />
        <ReceiptRow
          label="Station"
          value={session?.station?.name ?? '—'}
        />
        <ReceiptRow
          label="Bay"
          value={session?.bay?.label ?? '—'}
        />
        <ReceiptRow
          label="Duration"
          value={duration > 0 ? formatDuration(duration) : '—'}
        />

        <View style={styles.receiptDivider} />

        <ReceiptRow
          label="kWh Dispensed"
          value={`${session?.kwhDispensed?.toFixed(3) ?? '0.000'} kWh`}
        />
        <ReceiptRow
          label="Rate"
          value={`₦${session?.pricingPerKwh ?? 0}/kWh`}
        />

        {isWallet && (
          <ReceiptRow
            label="Credits Used"
            value={`${session?.creditsUsed?.toFixed(3) ?? '0.000'} credits`}
          />
        )}

        <View style={styles.receiptDivider} />

        <ReceiptRow
          label="Amount Charged"
          value={formatNaira(session?.costNaira)}
          highlight
        />
        <View style={styles.receiptRow}>
          <Text style={styles.receiptLabel}>Payment Method</Text>
          <View style={styles.paymentMethodRow}>
            <Ionicons
              name={isWallet ? 'wallet' : 'card'}
              size={14}
              color={Colors.textSecondary}
              style={{ marginRight: 6 }}
            />
            <Text style={styles.paymentMethodText}>{isWallet ? 'Wallet Credits' : 'Card'}</Text>
          </View>
        </View>

        {/* Payment Status Badge */}
        <View style={styles.statusRow}>
          <Text style={styles.receiptLabel}>Payment Status</Text>
          <View style={[
            styles.statusBadge,
            paymentStatus === 'SUCCESS'
              ? styles.statusSuccess
              : paymentStatus === 'FAILED'
              ? styles.statusFailed
              : styles.statusPending,
          ]}>
            <Text style={[
              styles.statusText,
              paymentStatus === 'SUCCESS'
                ? styles.statusTextSuccess
                : paymentStatus === 'FAILED'
                ? styles.statusTextFailed
                : styles.statusTextPending,
            ]}>
              {paymentStatus === 'SUCCESS' ? 'PAID' : paymentStatus === 'FAILED' ? 'FAILED' : 'PENDING'}
            </Text>
          </View>
        </View>
      </View>

      {/* Actions */}
      <TouchableOpacity
        style={styles.doneBtn}
        onPress={() => router.replace('/(app)/map')}
      >
        <Text style={styles.doneBtnText}>Done</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.historyBtn}
        onPress={() => router.replace('/(app)/history')}
      >
        <Text style={styles.historyBtnText}>View Session History</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  content: { padding: 24, paddingTop: 60, paddingBottom: 40 },

  successSection: { alignItems: 'center', marginBottom: 32 },
  checkCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.successBg,
    borderWidth: 3,
    borderColor: Colors.success,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  checkEmoji: { fontSize: 40, color: Colors.success },
  paymentMethodRow: { flexDirection: 'row', alignItems: 'center' },
  paymentMethodText: { fontSize: 14, color: Colors.textSecondary, fontWeight: '500' },
  successTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: Colors.navy,
    marginBottom: 8,
  },
  successSub: {
    fontSize: 15,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
  },

  receiptCard: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
  },
  receiptTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.navy,
    marginBottom: 16,
  },
  receiptRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
  },
  receiptLabel: { fontSize: 14, color: Colors.textSecondary },
  receiptValue: { fontSize: 14, fontWeight: '500', color: Colors.navy },
  receiptValueHighlight: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.primary,
  },
  receiptDivider: {
    height: 1,
    backgroundColor: Colors.border,
    marginVertical: 8,
  },

  statusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  statusBadge: {
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 5,
  },
  statusSuccess: { backgroundColor: Colors.successBg },
  statusFailed: { backgroundColor: Colors.errorBg },
  statusPending: { backgroundColor: Colors.warningBg },
  statusText: { fontSize: 12, fontWeight: 'bold' },
  statusTextSuccess: { color: Colors.success },
  statusTextFailed: { color: Colors.error },
  statusTextPending: { color: Colors.warning },

  doneBtn: {
    backgroundColor: Colors.primary,
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: 12,
  },
  doneBtnText: { color: Colors.navy, fontSize: 16, fontWeight: 'bold' },

  historyBtn: {
    paddingVertical: 12,
    alignItems: 'center',
  },
  historyBtnText: { color: Colors.textSecondary, fontSize: 14 },
});