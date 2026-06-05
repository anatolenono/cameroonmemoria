import { NextRequest, NextResponse } from 'next/server';
import { createTransactionService, TransactionType, TransactionStatus } from '@/features/feature-transaction';
import { prisma } from '@/lib/prisma';

const transactionService = createTransactionService(prisma);

// GET /api/transactions - Lister les transactions
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const walletId = searchParams.get('walletId');
    const type = searchParams.get('type');
    const status = searchParams.get('status');

    const filters = {
      ...(userId && { userId }),
      ...(walletId && { walletId }),
      ...(type && { type: type as TransactionType }),
      ...(status && { status: status as TransactionStatus }),
    };

    const transactions = await transactionService.getTransactions(filters);

    return NextResponse.json({
      success: true,
      data: transactions,
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des transactions:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Erreur lors de la récupération des transactions',
      },
      { status: 500 }
    );
  }
}

// POST /api/transactions - Créer une nouvelle transaction
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { amount, type, userId, description, currency, walletId } = body;

    // Validation des champs requis
    if (!amount || !type || !userId) {
      return NextResponse.json(
        {
          success: false,
          error: 'Champs requis manquants: amount, type, userId',
        },
        { status: 400 }
      );
    }

    const transaction = await transactionService.createTransaction({
      amount,
      type,
      userId,
      description,
      currency,
      walletId,
    });

    return NextResponse.json({
      success: true,
      data: transaction,
    }, { status: 201 });
  } catch (error) {
    console.error('Erreur lors de la création de la transaction:', error);
    
    const errorMessage = error instanceof Error ? error.message : 'Erreur inconnue';
    
    return NextResponse.json(
      {
        success: false,
        error: errorMessage,
      },
      { status: 400 }
    );
  }
} 