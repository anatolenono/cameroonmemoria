import { NextRequest, NextResponse } from 'next/server';
import { createTransactionService } from '@/features/feature-transaction';
import { prisma } from '@/lib/prisma';

const transactionService = createTransactionService(prisma);

// GET /api/transactions/[id] - Récupérer une transaction par ID
export async function GET(
  request: NextRequest
) {
  try {
    const path = request.nextUrl.pathname;
    const id = path.split('/')[3]; // Format: /api/transactions/[id]

    const transaction = await transactionService.getTransaction(id);

    if (!transaction) {
      return NextResponse.json(
        {
          success: false,
          error: 'Transaction non trouvée',
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: transaction,
    });
  } catch (error) {
    console.error('Erreur lors de la récupération de la transaction:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Erreur lors de la récupération de la transaction',
      },
      { status: 500 }
    );
  }
}

// PUT /api/transactions/[id] - Mettre à jour une transaction
export async function PUT(
  request: NextRequest
) {
  try {
    const path = request.nextUrl.pathname;
    const id = path.split('/')[3]; // Format: /api/transactions/[id]
    const body = await request.json();
    const { status, description } = body;

    const updatedTransaction = await transactionService.updateTransaction(id, {
      status,
      description,
    });

    return NextResponse.json({
      success: true,
      data: updatedTransaction,
    });
  } catch (error) {
    console.error('Erreur lors de la mise à jour de la transaction:', error);
    
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