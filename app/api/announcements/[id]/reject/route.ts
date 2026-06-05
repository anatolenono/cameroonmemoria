import { NextRequest, NextResponse } from 'next/server';
import { announcementService } from '@/features/feature-announcement/application/services/announcementService';
import { auth } from '@/core/infrastructure/auth/auth';
import { headers } from 'next/headers';
import { prisma } from '@/lib/prisma';

// PATCH /api/announcements/[id]/reject
export async function PATCH(
  request: NextRequest,
) {
  try {
    // Extraire l'ID de l'annonce depuis l'URL
    const path = request.nextUrl.pathname;
    const id = path.split('/')[3]; // Format: /api/announcements/[id]/reject

    // Récupérer la session utilisateur
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    // Vérifier si l'utilisateur est connecté
    if (!session) {
      return NextResponse.json(
        { error: 'Vous devez être connecté pour rejeter une annonce' },
        { status: 401 }
      );
    }

    // Récupérer le rôle de l'utilisateur depuis la base de données
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { role: true }
    });

    // Vérifier si l'utilisateur est un modérateur ou un administrateur
    if (user?.role !== 'ADMIN' && user?.role !== 'MODERATOR') {
      return NextResponse.json(
        { error: 'Vous n\'avez pas les permissions nécessaires pour rejeter une annonce' },
        { status: 403 }
      );
    }

    const announcement = await announcementService.rejectAnnouncement(id);
    return NextResponse.json(announcement);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Une erreur est survenue lors du rejet de l\'annonce';
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
} 