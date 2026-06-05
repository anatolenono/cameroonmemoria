import { Transaction, CreateTransactionData, UpdateTransactionData, TransactionFilters } from '../types';

export interface TransactionRepository {
  /**
   * Créer une nouvelle transaction
   */
  create(data: CreateTransactionData): Promise<Transaction>;

  /**
   * Trouver une transaction par ID
   */
  findById(id: string): Promise<Transaction | null>;

  /**
   * Trouver des transactions avec filtres
   */
  findMany(filters?: TransactionFilters): Promise<Transaction[]>;

  /**
   * Mettre à jour une transaction
   */
  update(id: string, data: UpdateTransactionData): Promise<Transaction>;

  /**
   * Vérifier si une transaction existe
   */
  exists(id: string): Promise<boolean>;
} 