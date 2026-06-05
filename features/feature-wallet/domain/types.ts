// Types pour le système de donation et de portefeuille

export interface PaymentMethod {
  id: string;
  name: string;
  type: 'mobile_money' | 'stripe' | 'paypal';
  icon: string;
  description: string;
  isAvailable: boolean;
  fees?: {
    percentage?: number;
    fixed?: number;
  };
}

export interface MobileMoneyProvider {
  id: string;
  name: string;
  code: string;
  icon: string;
  countries: string[];
}

export interface DonationFormData {
  amount: number;
  isAnonymous: boolean;
  paymentMethod: string;
  // Champs spécifiques pour Mobile Money
  phoneNumber?: string;
  mobileProvider?: string;
  // Champs pour autres méthodes
  email?: string;
}

export interface PaymentDetails {
  phoneNumber?: string;
  mobileProvider?: string;
  email?: string;
  [key: string]: string | number | boolean | undefined;
}

export interface DonationRequest {
  announcementId: string;
  amount: number;
  isAnonymous: boolean;
  paymentMethod: PaymentMethod;
  paymentDetails: PaymentDetails;
}

export interface DonationResponse {
  id: string;
  amount: number;
  isAnonymous: boolean;
  status: 'pending' | 'completed' | 'failed' | 'cancelled';
  paymentMethod: string;
  paymentUrl?: string; // Pour redirection vers le processeur de paiement
  transactionId: string;
  createdAt: string;
}

export interface WalletBalance {
  total: number;
  available: number;
  pending: number;
  currency: string;
}

export interface WalletTransaction {
  id: string;
  type: 'donation_received' | 'withdrawal' | 'refund';
  amount: number;
  description: string;
  status: 'pending' | 'completed' | 'failed';
  createdAt: string;
  announcementId?: string;
  announcementTitle?: string;
}

export interface WithdrawalRequest {
  amount: number;
  method: 'mobile_money' | 'bank_transfer';
  details: {
    phoneNumber?: string;
    mobileProvider?: string;
    bankAccount?: string;
    bankName?: string;
  };
}

// Types pour les flux de paiement modulaires
export interface PaymentFlowData {
  amount: number;
  isAnonymous: boolean;
  announcementId: string;
  deceasedName: string;
}

export interface PaymentFlowResult {
  success: boolean;
  data?: DonationResponse;
  error?: string;
  requiresRedirect?: boolean;
  redirectUrl?: string;
}

export interface PaymentFlowProps {
  data: PaymentFlowData;
  onSuccess: (result: PaymentFlowResult) => void;
  onError: (error: string) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

// Types spécifiques pour Stripe
export interface StripePaymentData {
  email: string;
  cardholderName: string;
}

// Types spécifiques pour Mobile Money
export interface MobileMoneyPaymentData {
  phoneNumber: string;
  provider: string;
}

// Types spécifiques pour PayPal
export interface PayPalPaymentData {
  email: string;
} 