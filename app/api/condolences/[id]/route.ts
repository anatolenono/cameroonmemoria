import { NextRequest, NextResponse } from 'next/server';
import { condolenceService } from '@/features/feature-condolence/application/services/condolenceService';
import { UpdateCondolenceDto } from '@/features/feature-condolence/domain/types/condolence';
import { auth } from '@/core/infrastructure/auth/auth';
import { headers } from 'next/headers';

// GET /api/condolences/[id]
export async function GET(
  request: NextRequest,
) {
  try {
    // Extraire l'ID de la condoléance depuis l'URL
    const path = request.nextUrl.pathname;
    const id = path.split('/')[3]; // Format: /api/condolences/[id]

    const condolence = await condolenceService.getCondolenceById(id);
    return NextResponse.json(condolence);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Une erreur est survenue lors de la récupération de la condoléance';
    return NextResponse.json({ error: errorMessage }, { status: 404 });
  }
}

// PUT /api/condolences/[id]
export async function PUT(
  request: NextRequest,
) {
  try {
    // Extraire l'ID de la condoléance depuis l'URL
    const path = request.nextUrl.pathname;
    const id = path.split('/')[3]; // Format: /api/condolences/[id]

    // Récupérer la session utilisateur
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    // Vérifier si l'utilisateur est connecté
    if (!session) {
      return NextResponse.json(
        { error: 'Vous devez être connecté pour modifier une condoléance' },
        { status: 401 }
      );
    }

    // Vérifier que l'utilisateur est propriétaire de la condoléance ou admin
    const existingCondolence = await condolenceService.getCondolenceById(id);
    if (existingCondolence.userId !== session.user.id) {
      return NextResponse.json(
        { error: 'Vous ne pouvez modifier que vos propres condoléances' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const updateData: UpdateCondolenceDto = {
      message: body.message,
      isApproved: body.isApproved
    };

    const condolence = await condolenceService.updateCondolence(id, updateData);
    return NextResponse.json(condolence);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Une erreur est survenue lors de la mise à jour de la condoléance';
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}

// DELETE /api/condolences/[id]
export async function DELETE(
  request: NextRequest,
) {
  try {
    // Extraire l'ID de la condoléance depuis l'URL
    const path = request.nextUrl.pathname;
    const id = path.split('/')[3]; // Format: /api/condolences/[id]

    // Récupérer la session utilisateur
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    // Vérifier si l'utilisateur est connecté
    if (!session) {
      return NextResponse.json(
        { error: 'Vous devez être connecté pour supprimer une condoléance' },
        { status: 401 }
      );
    }

    // Vérifier que l'utilisateur est propriétaire de la condoléance ou admin
    const existingCondolence = await condolenceService.getCondolenceById(id);
    if (existingCondolence.userId !== session.user.id) {
      return NextResponse.json(
        { error: 'Vous ne pouvez supprimer que vos propres condoléances' },
        { status: 403 }
      );
    }

    await condolenceService.deleteCondolence(id);
    return NextResponse.json({ success: true });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Une erreur est survenue lors de la suppression de la condoléance';
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
} 