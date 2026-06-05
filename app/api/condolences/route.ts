import { NextRequest, NextResponse } from 'next/server';
import { condolenceService } from '@/features/feature-condolence/application/services/condolenceService';
import { CreateCondolenceDto } from '@/features/feature-condolence/domain/types/condolence';
import { auth } from '@/core/infrastructure/auth/auth';
import { headers } from 'next/headers';

// GET /api/condolences
export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const announcementId = searchParams.get('announcementId') || undefined;
    const userId = searchParams.get('userId') || undefined;
    const isApproved = searchParams.get('isApproved') ? searchParams.get('isApproved') === 'true' : undefined;
    const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : 10;
    const offset = searchParams.get('offset') ? parseInt(searchParams.get('offset')!) : 0;

    let result;
    
    if (announcementId) {
      // Récupérer les condoléances pour une annonce spécifique
      result = await condolenceService.getCondolencesByAnnouncementId(announcementId, {
        userId,
        isApproved,
        limit,
        offset
      });
    } else {
      // Récupérer toutes les condoléances
      result = await condolenceService.getAllCondolences({
        userId,
        isApproved,
        limit,
        offset
      });
    }

    return NextResponse.json(result);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Une erreur est survenue lors de la récupération des condoléances';
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}

// POST /api/condolences
export async function POST(req: NextRequest) {
  try {
    // Récupérer la session utilisateur
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    // Vérifier si l'utilisateur est connecté
    if (!session) {
      return NextResponse.json(
        { error: 'Vous devez être connecté pour publier une condoléance' },
        { status: 401 }
      );
    }

    const body = await req.json();
    const condolenceData: CreateCondolenceDto = {
      message: body.message,
      announcementId: body.announcementId
    };

    const condolence = await condolenceService.createCondolence(condolenceData, session.user.id);
    return NextResponse.json(condolence, { status: 201 });
  } catch (error) {
    console.error('Erreur lors de la création de la condoléance:', error);
    const errorMessage = error instanceof Error ? error.message : 'Une erreur est survenue lors de la création de la condoléance';
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
} 