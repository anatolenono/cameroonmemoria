// Exports des types de domaine
export * from './domain/types';
export * from './domain/repositories/TransactionRepository';

// Exports de l'infrastructure
export * from './infrastructure/repositories/PrismaTransactionRepository';

// Exports de l'application
export * from './application/services/TransactionService';

// Factory simple pour créer les services
import { PrismaClient } from '@prisma/client';
import { PrismaTransactionRepository } from './infrastructure/repositories/PrismaTransactionRepository';
import { TransactionService } from './application/services/TransactionService';

export function createTransactionService(prisma: PrismaClient): TransactionService {
  const transactionRepository = new PrismaTransactionRepository(prisma);
  return new TransactionService(transactionRepository);
} 