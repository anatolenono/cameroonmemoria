// Types de domaine pour les transactions basés sur le schéma Prisma

export enum TransactionType {
  DONATION = 'DONATION',
  WITHDRAWAL = 'WITHDRAWAL',
  REFUND = 'REFUND'
}

export enum TransactionStatus {
  PENDING = 'PENDING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
  CANCELED = 'CANCELED'
}

export interface Transaction {
  id: string;
  amount: number;
  type: TransactionType;
  status: TransactionStatus;
  description?: string;
  currency: string;
  createdAt: Date;
  updatedAt: Date;
  userId: string;
  walletId?: string;
}

export interface CreateTransactionData {
  amount: number;
  type: TransactionType;
  status?: TransactionStatus;
  description?: string;
  currency?: string;
  userId: string;
  walletId?: string;
}

export interface UpdateTransactionData {
  status?: TransactionStatus;
  description?: string;
}

export interface TransactionFilters {
  userId?: string;
  walletId?: string;
  type?: TransactionType;
  status?: TransactionStatus;
} 