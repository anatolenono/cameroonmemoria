import { TransactionRepository } from '../../domain/repositories/TransactionRepository';
import { Transaction, CreateTransactionData, UpdateTransactionData, TransactionFilters, TransactionType, TransactionStatus } from '../../domain/types';

export class TransactionService {
  constructor(private transactionRepository: TransactionRepository) {}

  /**
   * Créer une nouvelle transaction
   */
  async createTransaction(data: CreateTransactionData): Promise<Transaction> {
    // Validation métier de base
    if (data.amount <= 0) {
      throw new Error('Le montant doit être supérieur à 0');
    }

    if (data.amount > 10000000) { // 10M FCFA limite max
      throw new Error('Le montant dépasse la limite autorisée');
    }

    return this.transactionRepository.create(data);
  }

  /**
   * Obtenir une transaction par ID
   */
  async getTransaction(id: string): Promise<Transaction | null> {
    return this.transactionRepository.findById(id);
  }

  /**
   * Obtenir des transactions avec filtres
   */
  async getTransactions(filters?: TransactionFilters): Promise<Transaction[]> {
    return this.transactionRepository.findMany(filters);
  }

  /**
   * Obtenir les transactions d'un utilisateur
   */
  async getUserTransactions(userId: string): Promise<Transaction[]> {
    return this.transactionRepository.findMany({ userId });
  }

  /**
   * Mettre à jour une transaction
   */
  async updateTransaction(id: string, data: UpdateTransactionData): Promise<Transaction> {
    const existingTransaction = await this.transactionRepository.findById(id);
    
    if (!existingTransaction) {
      throw new Error('Transaction non trouvée');
    }

    return this.transactionRepository.update(id, data);
  }

  /**
   * Marquer une transaction comme complétée
   */
  async markAsCompleted(id: string): Promise<Transaction> {
    return this.updateTransaction(id, {
      status: TransactionStatus.COMPLETED,
    });
  }

  /**
   * Marquer une transaction comme échouée
   */
  async markAsFailed(id: string, reason?: string): Promise<Transaction> {
    return this.updateTransaction(id, {
      status: TransactionStatus.FAILED,
      description: reason,
    });
  }

  /**
   * Créer une transaction pour une donation Stripe
   */
  async createStripeTransaction(
    userId: string,
    amount: number,
    sessionId: string,
    deceasedName: string
  ): Promise<Transaction> {
    const transactionData: CreateTransactionData = {
      amount: amount / 100, // Convertir centimes en FCFA
      type: TransactionType.DONATION,
      status: TransactionStatus.COMPLETED,
      description: `Donation pour ${deceasedName} - Session: ${sessionId}`,
      currency: 'XAF',
      userId,
    };

    return this.createTransaction(transactionData);
  }

  /**
   * Vérifier si une transaction existe
   */
  async transactionExists(id: string): Promise<boolean> {
    return this.transactionRepository.exists(id);
  }
} 