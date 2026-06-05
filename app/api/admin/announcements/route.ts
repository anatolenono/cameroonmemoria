import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/core/infrastructure/auth/auth';
import { headers } from 'next/headers';
import { prisma } from '@/lib/prisma';
import { AnnouncementStatus, Prisma } from '@prisma/client';

// GET /api/admin/announcements
export async function GET(request: NextRequest) {
  try {
    // Récupérer la session utilisateur
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    // Vérifier si l'utilisateur est connecté
    if (!session) {
      return NextResponse.json(
        { error: 'Vous devez être connecté pour accéder à cette ressource' },
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
        { error: 'Vous n\'avez pas les permissions nécessaires pour accéder à cette ressource' },
        { status: 403 }
      );
    }

    // Récupérer les paramètres de requête
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');
    const search = searchParams.get('search');

    // Construire les filtres
    const filters: Prisma.AnnouncementWhereInput = {};
    
    if (status && status !== 'ALL') {
      filters.status = status as AnnouncementStatus;
    }

    if (search) {
      filters.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { deceasedName: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } }
      ];
    }

    // Récupérer les annonces avec les informations de l'utilisateur
    const announcements = await prisma.announcement.findMany({
      where: filters,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: limit,
      skip: offset
    });

    // Compter le total pour la pagination
    const total = await prisma.announcement.count({
      where: filters
    });

    // Transformer les données pour inclure les informations de modération
    const announcementsWithModerationInfo = announcements.map(announcement => ({
      id: announcement.id,
      title: announcement.title,
      description: announcement.description,
      type: announcement.type,
      status: announcement.status,
      isAnonymous: announcement.isAnonymous,
      deceasedName: announcement.deceasedName,
      deceasedBirthDate: announcement.deceasedBirthDate?.toISOString(),
      deceasedDeathDate: announcement.deceasedDeathDate.toISOString(),
      ceremonyDate: announcement.ceremonyDate?.toISOString(),
      ceremonyLocation: announcement.ceremonyLocation,
      createdAt: announcement.createdAt.toISOString(),
      updatedAt: announcement.updatedAt.toISOString(),
      submittedAt: announcement.createdAt.toISOString(),
      submitterName: announcement.isAnonymous ? 'Anonyme' : announcement.user?.name,
      submitterEmail: announcement.isAnonymous ? null : announcement.user?.email,
      userId: announcement.userId
    }));

    return NextResponse.json({
      announcements: announcementsWithModerationInfo,
      total,
      limit,
      offset
    });

  } catch (error) {
    console.error('Erreur lors de la récupération des annonces pour l\'administration:', error);
    const errorMessage = error instanceof Error ? error.message : 'Une erreur est survenue lors de la récupération des annonces';
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
} 