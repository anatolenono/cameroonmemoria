import { NextRequest, NextResponse } from 'next/server';
import { offeringService } from '@/features/feature-offering/application/services/offeringService';
import { auth } from '@/core/infrastructure/auth/auth';
import { headers } from 'next/headers';

// GET /api/offerings?announcementId=X
export async function GET(req: NextRequest) {
  try {
    const announcementId = req.nextUrl.searchParams.get('announcementId');
    if (!announcementId) {
      return NextResponse.json({ error: 'announcementId requis' }, { status: 400 });
    }

    const counts = await offeringService.getCountsByAnnouncementId(announcementId);
    return NextResponse.json(counts);
  } catch (error) {
    console.error('Erreur lors de la récupération des offrandes:', error);
    return NextResponse.json(
      { error: 'Une erreur est survenue' },
      { status: 500 }
    );
  }
}

// POST /api/offerings
export async function POST(req: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      return NextResponse.json(
        { error: 'Vous devez être connecté pour déposer une offrande' },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { type, announcementId } = body;

    if (!type || !['FLOWER', 'CANDLE'].includes(type)) {
      return NextResponse.json({ error: 'Type invalide' }, { status: 400 });
    }
    if (!announcementId) {
      return NextResponse.json({ error: 'announcementId requis' }, { status: 400 });
    }

    const offering = await offeringService.createOffering(type, announcementId, session.user.id);
    return NextResponse.json(offering, { status: 201 });
  } catch (error) {
    console.error('Erreur lors de la création de l\'offrande:', error);
    return NextResponse.json(
      { error: 'Une erreur est survenue' },
      { status: 500 }
    );
  }
}
