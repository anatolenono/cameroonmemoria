import { headers } from 'next/headers';
import { auth } from '@/core/infrastructure/auth/auth';
import { prisma } from '@/lib/prisma';
import { AnnouncementAdminService } from '@/features/feature-announcement/application/services/announcementAdminService';

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string; userId: string }> }
) {
  try {
    const { id: announcementId, userId } = await params;
    const headersList = await headers();

    const session = await auth.api.getSession({ headers: headersList });
    if (!session) {
      return Response.json({ error: 'Non authentifié' }, { status: 401 });
    }

    // Verify user is creator/admin of announcement
    const announcement = await prisma.announcement.findUnique({
      where: { id: announcementId },
      select: { userId: true },
    });

    if (!announcement) {
      return Response.json({ error: 'Annonce introuvable' }, { status: 404 });
    }

    if (announcement.userId !== session.user.id) {
      return Response.json(
        { error: 'Vous n\'avez pas la permission de modifier cette annonce' },
        { status: 403 }
      );
    }

    const service = new AnnouncementAdminService(prisma);
    await service.removeAdmin(announcementId, userId);

    return Response.json({ success: true });
  } catch (error) {
    console.error('Error removing admin:', error);
    return Response.json(
      { error: error instanceof Error ? error.message : 'Erreur serveur' },
      { status: 500 }
    );
  }
}
