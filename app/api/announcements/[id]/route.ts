import { NextRequest, NextResponse } from 'next/server';
import { announcementService } from '@/features/feature-announcement/application/services/announcementService';
import { UpdateAnnouncementDto } from '@/features/feature-announcement/domain/types/announcement';
import { auth } from '@/core/infrastructure/auth/auth';
import { headers } from 'next/headers';
import { prisma } from '@/lib/prisma';

// GET /api/announcements/[id]
export async function GET(
  request: NextRequest,
) {
  try {
    // Extraire l'ID de l'annonce depuis l'URL
    const path = request.nextUrl.pathname;
    const id = path.split('/')[3]; // Format: /api/announcements/[id]

    const announcement = await announcementService.getAnnouncementById(id);
    console.log('announcement', announcement);
    return NextResponse.json(announcement);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Une erreur est survenue lors de la récupération de l\'annonce';
    return NextResponse.json({ error: errorMessage }, { status: 404 });
  }
}

// PUT /api/announcements/[id]
export async function PUT(
  request: NextRequest,
) {
  try {
    // Extraire l'ID de l'annonce depuis l'URL
    const path = request.nextUrl.pathname;
    const id = path.split('/')[3]; // Format: /api/announcements/[id]

    // Récupérer la session utilisateur
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    // Vérifier si l'utilisateur est connecté
    if (!session) {
      return NextResponse.json(
        { error: 'Vous devez être connecté pour mettre à jour une annonce' },
        { status: 401 }
      );
    }

    // Vérifier que l'annonce existe
    const existingAnnouncement = await prisma.announcement.findUnique({
      where: { id },
      select: { userId: true }
    });

    if (!existingAnnouncement) {
      return NextResponse.json(
        { error: 'Annonce introuvable' },
        { status: 404 }
      );
    }

    // Vérifier que l'utilisateur est le propriétaire ou un administrateur
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { role: true }
    });

    if (existingAnnouncement.userId !== session.user.id && user?.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Vous n\'êtes pas autorisé à modifier cette annonce' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const updateData: UpdateAnnouncementDto = {
      title: body.title,
      description: body.description,
      type: body.type,
      isAnonymous: body.isAnonymous,
      deceasedName: body.deceasedName,
      deceasedPronoun: body.deceasedPronoun,
      deceasedBirthDate: body.deceasedBirthDate,
      deceasedBirthPlace: body.deceasedBirthPlace,
      deceasedDeathDate: body.deceasedDeathDate,
      ceremonyDate: body.ceremonyDate,
      ceremonyLocation: body.ceremonyLocation,
      mediaIds: body.mediaIds,
      relationship: body.relationship,
      bannerPresetId: body.bannerPresetId,
      bannerCustomUrl: body.bannerCustomUrl
    };

    const announcement = await announcementService.updateAnnouncement(id, updateData);
    return NextResponse.json(announcement);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Une erreur est survenue lors de la mise à jour de l\'annonce';
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}

// DELETE /api/announcements/[id]
export async function DELETE(
  request: NextRequest,
) {
  try {
    // Extraire l'ID de l'annonce depuis l'URL
    const path = request.nextUrl.pathname;
    const id = path.split('/')[3]; // Format: /api/announcements/[id]

    // Récupérer la session utilisateur
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    // Vérifier si l'utilisateur est connecté
    if (!session) {
      return NextResponse.json(
        { error: 'Vous devez être connecté pour supprimer une annonce' },
        { status: 401 }
      );
    }

    // Vérifier que l'annonce existe
    const existingAnnouncement = await prisma.announcement.findUnique({
      where: { id },
      select: { userId: true }
    });

    if (!existingAnnouncement) {
      return NextResponse.json(
        { error: 'Annonce introuvable' },
        { status: 404 }
      );
    }

    // Vérifier que l'utilisateur est le propriétaire ou un administrateur
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { role: true }
    });

    if (existingAnnouncement.userId !== session.user.id && user?.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Vous n\'êtes pas autorisé à supprimer cette annonce' },
        { status: 403 }
      );
    }

    await announcementService.deleteAnnouncement(id);
    return NextResponse.json({ success: true });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Une erreur est survenue lors de la suppression de l\'annonce';
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
} 