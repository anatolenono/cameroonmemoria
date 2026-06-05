import { PrismaClient } from '@prisma/client';

export interface AnnouncementAdminDto {
  announcementId: string;
  userId: string;
  role?: 'CREATOR' | 'ADMIN' | 'VIEWER';
}

export interface AnnouncementAdminResult {
  id: string;
  announcementId: string;
  userId: string;
  role: string;
  addedAt: Date;
  user: {
    id: string;
    name: string | null;
    email: string;
  };
}

export class AnnouncementAdminService {
  private prisma: PrismaClient;

  constructor(prisma: PrismaClient) {
    this.prisma = prisma;
  }

  async inviteAdmin(dto: AnnouncementAdminDto): Promise<AnnouncementAdminResult> {
    // Verify announcement exists
    const announcement = await this.prisma.announcement.findUnique({
      where: { id: dto.announcementId },
      select: { id: true, userId: true },
    });

    if (!announcement) {
      throw new Error('Annonce introuvable');
    }

    // Verify user exists
    const user = await this.prisma.user.findUnique({
      where: { id: dto.userId },
      select: { id: true, name: true, email: true },
    });

    if (!user) {
      throw new Error('Utilisateur introuvable');
    }

    // Check if already invited
    const existing = await this.prisma.announcementAdmin.findUnique({
      where: {
        announcementId_userId: {
          announcementId: dto.announcementId,
          userId: dto.userId,
        },
      },
    });

    if (existing) {
      throw new Error('Cet utilisateur est déjà admin de cette annonce');
    }

    // Create admin relation
    const admin = await this.prisma.announcementAdmin.create({
      data: {
        announcementId: dto.announcementId,
        userId: dto.userId,
        role: dto.role || 'ADMIN',
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    return admin;
  }

  async removeAdmin(announcementId: string, userId: string): Promise<void> {
    // Prevent removing the creator
    const announcement = await this.prisma.announcement.findUnique({
      where: { id: announcementId },
      select: { userId: true },
    });

    if (announcement?.userId === userId) {
      throw new Error('Impossible de retirer le créateur de l\'annonce');
    }

    await this.prisma.announcementAdmin.delete({
      where: {
        announcementId_userId: {
          announcementId,
          userId,
        },
      },
    });
  }

  async getAdmins(announcementId: string): Promise<AnnouncementAdminResult[]> {
    const admins = await this.prisma.announcementAdmin.findMany({
      where: { announcementId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: { addedAt: 'desc' },
    });

    return admins;
  }

  async isAdmin(announcementId: string, userId: string): Promise<boolean> {
    // Creator is always admin
    const announcement = await this.prisma.announcement.findUnique({
      where: { id: announcementId },
      select: { userId: true },
    });

    if (announcement?.userId === userId) {
      return true;
    }

    // Check explicit admin relation
    const admin = await this.prisma.announcementAdmin.findUnique({
      where: {
        announcementId_userId: {
          announcementId,
          userId,
        },
      },
      select: { role: true },
    });

    return admin?.role === 'ADMIN' || admin?.role === 'CREATOR';
  }

  async canManageAnnouncement(announcementId: string, userId: string): Promise<boolean> {
    return this.isAdmin(announcementId, userId);
  }

  async canPayForAnnouncement(announcementId: string, userId: string): Promise<boolean> {
    // Only CREATOR and ADMIN can pay
    return this.isAdmin(announcementId, userId);
  }
}
