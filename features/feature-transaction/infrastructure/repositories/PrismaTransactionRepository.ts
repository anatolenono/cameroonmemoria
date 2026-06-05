import { PrismaClient } from '@prisma/client';
import { TransactionRepository } from '../../domain/repositories/TransactionRepository';
import { Transaction, CreateTransactionData, UpdateTransactionData, TransactionFilters, TransactionType, TransactionStatus } from '../../domain/types';

export class PrismaTransactionRepository implements TransactionRepository {
  constructor(private prisma: PrismaClient) {}

  async create(data: CreateTransactionData): Promise<Transaction> {
    const transaction = await this.prisma.transaction.create({
      data: {
        amount: data.amount,
        type: data.type,
        status: data.status || TransactionStatus.PENDING,
        description: data.description,
        currency: data.currency || 'XAF',
        userId: data.userId,
        walletId: data.walletId,
      },
    });

    return this.mapToTransaction(transaction);
  }

  async findById(id: string): Promise<Transaction | null> {
    const transaction = await this.prisma.transaction.findUnique({
      where: { id },
    });

    return transaction ? this.mapToTransaction(transaction) : null;
  }

  async findMany(filters?: TransactionFilters): Promise<Transaction[]> {
    const where = this.buildWhereClause(filters);
    
    const transactions = await this.prisma.transaction.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });

    return transactions.map(this.mapToTransaction);
  }

  async update(id: string, data: UpdateTransactionData): Promise<Transaction> {
    const transaction = await this.prisma.transaction.update({
      where: { id },
      data: {
        status: data.status,
        description: data.description,
        updatedAt: new Date(),
      },
    });

    return this.mapToTransaction(transaction);
  }

  async exists(id: string): Promise<boolean> {
    const count = await this.prisma.transaction.count({
      where: { id },
    });

    return count > 0;
  }

  private buildWhereClause(filters?: TransactionFilters) {
    if (!filters) return {};

    const where: Record<string, unknown> = {};

    if (filters.userId) {
      where.userId = filters.userId;
    }

    if (filters.walletId) {
      where.walletId = filters.walletId;
    }

    if (filters.type) {
      where.type = filters.type;
    }

    if (filters.status) {
      where.status = filters.status;
    }

    return where;
  }

  private mapToTransaction(prismaTransaction: {
    id: string;
    amount: number;
    type: string;
    status: string;
    description: string | null;
    currency: string;
    createdAt: Date;
    updatedAt: Date;
    userId: string;
    walletId: string | null;
  }): Transaction {
    return {
      id: prismaTransaction.id,
      amount: prismaTransaction.amount,
      type: prismaTransaction.type as TransactionType,
      status: prismaTransaction.status as TransactionStatus,
      description: prismaTransaction.description || undefined,
      currency: prismaTransaction.currency,
      createdAt: prismaTransaction.createdAt,
      updatedAt: prismaTransaction.updatedAt,
      userId: prismaTransaction.userId,
      walletId: prismaTransaction.walletId || undefined,
    };
  }
} 