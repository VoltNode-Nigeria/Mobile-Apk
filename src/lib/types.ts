export type Station = {
  id: string;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  pricingPerKwh: number;
  totalBays: number;
  availableBays: number;
  occupiedBays: number;
  faultBays: number;
  offlineBays: number;
  bays: Bay[];
  images: StationImage[];
};

export type Bay = {
  id: string;
  label: string;
  chargerType: string;
  status: 'AVAILABLE' | 'OCCUPIED' | 'FAULT' | 'OFFLINE';
  lastSeen?: string;
  maxKw?: number;
};

export type StationImage = {
  id: string;
  url: string;
  path: string;
};

export type Session = {
  id: string;
  driverId: string;
  stationId: string;
  station?: { id: string; name: string; address: string };
  bayId: string;
  bay?: { id: string; label: string; chargerType: string };
  status: 'PENDING' | 'ACTIVE' | 'COMPLETED' | 'CANCELLED';
  paymentMethod: 'WALLET' | 'CARD';
  kwhDispensed: number;
  pricingPerKwh: number;
  costNaira: number;
  creditsUsed: number;
  startedAt?: string;
  endedAt?: string;
  createdAt: string;
  payment?: {
    status: string;
    amountNaira: number;
    paystackRef?: string;
  };
};

export type WalletData = {
  balance: number;
  globalRatePerKwh: number;
  transactions: WalletTransaction[];
};

export type WalletTransaction = {
  id: string;
  type: 'TOPUP' | 'DEDUCTION' | 'TRANSFER_SENT' | 'TRANSFER_RECEIVED' | 'REFUND';
  credits: number;
  nairaAmount?: number;
  description?: string;
  reference?: string;
  sessionId?: string;
  createdAt: string;
};

export type CreditPackage = {
  id: string;
  name: string;
  credits: number;
  bonusCredits: number;
  priceNaira: number;
  isActive: boolean;
};