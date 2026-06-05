import { PaymentMethod, MobileMoneyProvider } from '../../domain/types';

// Fournisseurs Mobile Money populaires en Afrique
export const MOBILE_MONEY_PROVIDERS: MobileMoneyProvider[] = [
  {
    id: 'orange_money',
    name: 'Orange Money',
    code: 'OM',
    icon: '🟠',
    countries: ['CM', 'CI', 'SN', 'ML', 'BF', 'NE', 'GN', 'MG']
  },
  {
    id: 'mtn_momo',
    name: 'MTN Mobile Money',
    code: 'MOMO',
    icon: '🟡',
    countries: ['CM', 'GH', 'UG', 'RW', 'ZM', 'BJ', 'CI', 'GN']
  },
  {
    id: 'express_union',
    name: 'Express Union Mobile',
    code: 'EU',
    icon: '🔵',
    countries: ['CM', 'CI', 'SN', 'BF', 'TG', 'BJ']
  },
  {
    id: 'wave',
    name: 'Wave',
    code: 'WAVE',
    icon: '💙',
    countries: ['SN', 'CI', 'UG', 'ML', 'BF']
  }
];

// Méthodes de paiement disponibles
export const PAYMENT_METHODS: PaymentMethod[] = [
  {
    id: 'mobile_money',
    name: 'Mobile Money',
    type: 'mobile_money',
    icon: '📱',
    description: 'Paiement via Orange Money, MTN MoMo, etc.',
    isAvailable: false
  },
  {
    id: 'stripe',
    name: 'Carte bancaire',
    type: 'stripe',
    icon: '💳',
    description: 'Visa, Mastercard, American Express',
    isAvailable: true
  },
  {
    id: 'paypal',
    name: 'PayPal',
    type: 'paypal',
    icon: '🅿️',
    description: 'Paiement sécurisé via PayPal',
    isAvailable: false
  }
];

// Montants de donation suggérés (en FCFA)
export const SUGGESTED_AMOUNTS = [
  1000, 2500, 5000, 10000, 25000, 50000
];

// Montant minimum et maximum
export const MIN_DONATION_AMOUNT = 500; // 500 FCFA
export const MAX_DONATION_AMOUNT = 1000000; // 1,000,000 FCFA 