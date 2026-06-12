import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from './api';
import type { Station, Session, WalletData, CreditPackage } from './types';

export const useStations = () =>
  useQuery({
    queryKey: ['stations'],
    queryFn: async (): Promise<Station[]> => {
      const { data } = await api.get('/stations');
      return Array.isArray(data) ? data : data?.data || [];
    },
  });

export const useStation = (id: string) =>
  useQuery({
    queryKey: ['stations', id],
    queryFn: async (): Promise<Station> => {
      const { data } = await api.get(`/stations/${id}`);
      return data;
    },
    enabled: !!id,
  });

export const useWallet = () =>
  useQuery({
    queryKey: ['wallet'],
    queryFn: async (): Promise<WalletData> => {
      const { data } = await api.get('/wallet');
      return data;
    },
  });

export const useCreditPackages = () =>
  useQuery({
    queryKey: ['creditPackages'],
    queryFn: async (): Promise<CreditPackage[]> => {
      const { data } = await api.get('/wallet/packages');
      return Array.isArray(data) ? data : [];
    },
  });

export const useGlobalRate = () =>
  useQuery({
    queryKey: ['globalRate'],
    queryFn: async (): Promise<{ ratePerKwh: number }> => {
      const { data } = await api.get('/wallet/rate');
      return data;
    },
    staleTime: 5 * 60 * 1000,
  });

export const useMyActiveSessions = (driverId: string) =>
  useQuery({
    queryKey: ['sessions', 'active', driverId],
    queryFn: async (): Promise<Session[]> => {
      const { data } = await api.get(`/sessions?driverId=${driverId}`);
      const sessions = Array.isArray(data) ? data : data?.data || [];
      return sessions.filter((s: Session) =>
        ['ACTIVE', 'PENDING'].includes(s.status)
      );
    },
    enabled: !!driverId,
    refetchInterval: 10000,
  });

export const useSessionHistory = (driverId: string) =>
  useQuery({
    queryKey: ['sessions', 'history', driverId],
    queryFn: async () => {
      const { data } = await api.get(`/sessions?driverId=${driverId}`);
      return data;
    },
    enabled: !!driverId,
  });

export const useSession = (sessionId: string) =>
  useQuery({
    queryKey: ['sessions', sessionId],
    queryFn: async (): Promise<Session> => {
      const { data } = await api.get(`/sessions/${sessionId}`);
      return data;
    },
    enabled: !!sessionId,
    refetchInterval: 10000,
  });