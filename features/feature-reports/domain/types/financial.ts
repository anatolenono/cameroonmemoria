export interface FinancialReport {
  period: {
    startDate: Date;
    endDate: Date;
  };
  summary: {
    totalGenerated: number;
    bySource: {
      stripe: number;
      orangeMoney: number;
      momo: number;
    };
  };
  byType: {
    planUpgrades: number;
    prestations: number;
    fundraisers: number;
  };
  transactions: PaymentTransaction[];
}

export interface PaymentTransaction {
  id: string;
  date: Date;
  source: 'STRIPE' | 'ORANGE_MONEY' | 'MOMO';
  type: 'PLAN_UPGRADE' | 'PRESTATION' | 'FUNDRAISER';
  amount: number;
  reference: string; // Annonce ID or Prestataire name
  status: 'PENDING' | 'COMPLETED' | 'FAILED' | 'REFUNDED';
}

export interface EconomicActivity {
  announcements: {
    total: number;
    byPlan: {
      free: number;
      essential: number;
      complete: number;
      premium: number;
    };
    conversionRate: number; // % FREE -> PAID
  };
  prestations: {
    totalVolume: number;
    transactionCount: number;
    topProviders: TopProvider[];
  };
  fundraisers: {
    activeCount: number;
    totalCollected: number;
    cmCommission: number;
  };
  revenue: {
    fromPlans: number;
    fromPrestations: number;
    fromFundraisers: number;
    total: number;
  };
}

export interface TopProvider {
  id: string;
  name: string;
  category: string;
  totalVolume: number;
  transactionCount: number;
  cmCommission: number;
}
