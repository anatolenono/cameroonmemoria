import { headers } from 'next/headers';
import { auth } from '@/core/infrastructure/auth/auth';
import { prisma } from '@/lib/prisma';
import { AnnouncementAdminService } from '@/features/feature-announcement/application/services/announcementAdminService';
import { z } from 'zod';

const inviteSchema = z.object({
  email: z.string().email('Email invalide'),
});

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: announcementId } = await params;
    const headersList = await headers();

    const session = await auth.api.getSession({ headers: headersList });
    if (!session) {
      return Response.json({ error: 'Non authentifié' }, { status: 401 });
    }

    const service = new AnnouncementAdminService(prisma);
    const admins = await service.getAdmins(announcementId);

    return Response.json({ success: true, data: admins });
  } catch (error) {
    console.error('Error getting admins:', error);
    return Response.json(
      { error: error instanceof Error ? error.message : 'Erreur serveur' },
      { status: 500 }
    );
  }
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: announcementId } = await params;
    const headersList = await headers();

    const session = await auth.api.getSession({ headers: headersList });
    if (!session) {
      return Response.json({ error: 'Non authentifié' }, { status: 401 });
    }

    const body = await req.json();
    const { email } = inviteSchema.parse(body);

    // Verify user is admin/creator of announcement
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

    // Find user by email
    const targetUser = await prisma.user.findUnique({
      where: { email },
      select: { id: true },
    });

    if (!targetUser) {
      return Response.json(
        { error: 'Utilisateur avec cet email introuvable' },
        { status: 404 }
      );
    }

    const service = new AnnouncementAdminService(prisma);
    const admin = await service.inviteAdmin({
      announcementId,
      userId: targetUser.id,
      role: 'ADMIN',
    });

    return Response.json({ success: true, data: admin }, { status: 201 });
  } catch (error) {
    console.error('Error inviting admin:', error);
    if (error instanceof z.ZodError) {
      return Response.json({ error: error.errors }, { status: 400 });
    }
    return Response.json(
      { error: error instanceof Error ? error.message : 'Erreur serveur' },
      { status: 500 }
    );
  }
}
