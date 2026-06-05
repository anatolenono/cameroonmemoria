import { PrismaClient, Announcement as PrismaAnnouncement, Media as PrismaMedia, Prisma } from '@prisma/client';
import {
  Announcement,
  AnnouncementQuery,
  CreateAnnouncementDto,
  UpdateAnnouncementDto,
  AnnouncementType,
  AnnouncementStatus,
  AnnouncementPlan
} from '../../domain/types/announcement';
import { MediaType } from '../../domain/types/media';

// Interface pour le repository d'annonces
export interface IAnnouncementRepository {
  create(data: CreateAnnouncementDto, userId?: string): Promise<Announcement>;
  update(id: string, data: UpdateAnnouncementDto): Promise<Announcement>;
  delete(id: string): Promise<void>;
  findById(id: string): Promise<Announcement | null>;
  findAll(query?: AnnouncementQuery): Promise<Announcement[]>;
  countAnnouncements(filters?: Omit<AnnouncementQuery, 'limit' | 'offset'>): Promise<number>;
  publishAnnouncement(id: string): Promise<Announcement>;
  rejectAnnouncement(id: string): Promise<Announcement>;
  getPrismaInstance(): PrismaClient;
  dispose(): Promise<void>;
}

// Interface pour la factory du repository d'annonces
export interface IAnnouncementRepositoryFactory {
  create(): IAnnouncementRepository;
}

// Implémentation avec Prisma
export class PrismaAnnouncementRepository implements IAnnouncementRepository {
  private prisma: PrismaClient;
  
  constructor(prisma: PrismaClient) {
    this.prisma = prisma;
  }
  
  // Fonction pour mapper le type Prisma vers notre type personnalisé
  private mapAnnouncementFromPrisma(
    announcement: PrismaAnnouncement & {
      media?: PrismaMedia[];
      bannerPreset?: { id: string; name: string; imageUrl: string; type: string } | null;
      _count?: { condolences?: number; offerings?: number };
      offerings?: { type: string }[];
    }
  ): Announcement {
    const flowerCount = announcement.offerings
      ? announcement.offerings.filter(o => o.type === 'FLOWER').length
      : undefined;
    const candleCount = announcement.offerings
      ? announcement.offerings.filter(o => o.type === 'CANDLE').length
      : undefined;

    return {
      id: announcement.id,
      title: announcement.title,
      description: announcement.description,
      type: announcement.type as unknown as AnnouncementType,
      status: announcement.status as unknown as AnnouncementStatus,
      isAnonymous: announcement.isAnonymous,
      deceasedName: announcement.deceasedName,
      deceasedPronoun: announcement.deceasedPronoun ?? undefined,
      deceasedBirthDate: announcement.deceasedBirthDate,
      deceasedBirthPlace: announcement.deceasedBirthPlace ?? undefined,
      deceasedDeathDate: announcement.deceasedDeathDate,
      deceasedPhotoUrl: announcement.deceasedPhotoUrl ?? undefined,
      ceremonyDate: announcement.ceremonyDate,
      ceremonyLocation: announcement.ceremonyLocation,
      events: announcement.events ? JSON.parse(announcement.events as string) : undefined,
      relationship: announcement.relationship ?? undefined,
      bannerPresetId: announcement.bannerPresetId ?? undefined,
      bannerPreset: announcement.bannerPreset ? {
        id: announcement.bannerPreset.id,
        name: announcement.bannerPreset.name,
        imageUrl: announcement.bannerPreset.imageUrl
      } : undefined,
      bannerCustomUrl: announcement.bannerCustomUrl ?? undefined,
      plan: (announcement.plan ?? 'FREE') as unknown as AnnouncementPlan,
      planPaidAt: announcement.planPaidAt ?? undefined,
      createdAt: announcement.createdAt,
      updatedAt: announcement.updatedAt,
      userId: announcement.userId,
      media: announcement.media?.map(media => ({
        id: media.id,
        url: media.url,
        type: media.type as unknown as MediaType,
        createdAt: media.createdAt,
        announcementId: media.announcementId
      })),
      condolenceCount: announcement._count?.condolences,
      flowerCount,
      candleCount,
    };
  }
  
  // Libère les ressources à la fin du cycle de vie
  async dispose(): Promise<void> {
    await this.prisma.$disconnect();
  }
  
  getPrismaInstance(): PrismaClient {
    return this.prisma;
  }
  
  private _buildWhereClause(filters: Omit<AnnouncementQuery, 'limit' | 'offset'>): Prisma.AnnouncementWhereInput {
    const { type, q, location, dateFrom, dateTo, withDonations, recentOnly, ...otherFilters } = filters;
    const where: Prisma.AnnouncementWhereInput = { ...otherFilters };

    if (q) {
      where.OR = [
        { title: { contains: q, mode: 'insensitive' } },
        { deceasedName: { contains: q, mode: 'insensitive' } },
      ];
    }

    if (Array.isArray(type) && type.length > 0) {
      where.type = { in: type };
    } else if (typeof type === 'string') {
      where.type = type;
    }
    
    if (location) {
      where.ceremonyLocation = { contains: location, mode: 'insensitive' };
    }

    if (dateFrom || dateTo) {
      where.ceremonyDate = {};
      if (dateFrom) {
        where.ceremonyDate.gte = new Date(dateFrom);
      }
      if (dateTo) {
        const endDate = new Date(dateTo);
        endDate.setHours(23, 59, 59, 999);
        where.ceremonyDate.lte = endDate;
      }
    }

    if (recentOnly) {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      where.createdAt = { gte: thirtyDaysAgo };
    }

    if (withDonations) {
      // TODO: Implémenter le filtrage par dons.
      // Cela suppose une relation 'transactions' sur le modèle 'Announcement'
      // where.transactions = { some: {} };
    }

    return where;
  }
  
  async create(data: CreateAnnouncementDto, userId?: string): Promise<Announcement> {
    const { mediaIds, ...announcementData } = data;

    const result = await this.prisma.announcement.create({
      data: {
        ...announcementData,
        userId,
        deceasedBirthDate: data.deceasedBirthDate ? new Date(data.deceasedBirthDate) : null,
        deceasedDeathDate: new Date(data.deceasedDeathDate),
        ceremonyDate: data.ceremonyDate ? new Date(data.ceremonyDate) : null,
        events: data.events ? JSON.stringify(data.events) : undefined,
        relationship: data.relationship,
        media: mediaIds ? {
          connect: mediaIds.map(id => ({ id }))
        } : undefined
      },
      include: {
        media: true,
        bannerPreset: true
      }
    });

    return this.mapAnnouncementFromPrisma(result);
  }

  async update(id: string, data: UpdateAnnouncementDto): Promise<Announcement> {
    const { mediaIds, ...updateData } = data;

    const result = await this.prisma.announcement.update({
      where: { id },
      data: {
        ...updateData,
        deceasedBirthDate: data.deceasedBirthDate ? new Date(data.deceasedBirthDate) : undefined,
        deceasedDeathDate: data.deceasedDeathDate ? new Date(data.deceasedDeathDate) : undefined,
        ceremonyDate: data.ceremonyDate ? new Date(data.ceremonyDate) : undefined,
        events: data.events ? JSON.stringify(data.events) : undefined,
        relationship: data.relationship,
        media: mediaIds ? {
          set: mediaIds.map(id => ({ id }))
        } : undefined
      },
      include: {
        media: true,
        bannerPreset: true
      }
    });

    return this.mapAnnouncementFromPrisma(result);
  }

  async delete(id: string): Promise<void> {
    await this.prisma.announcement.delete({
      where: { id }
    });
  }

  async findById(id: string): Promise<Announcement | null> {
    const result = await this.prisma.announcement.findUnique({
      where: { id },
      include: {
        media: true,
        bannerPreset: true
      }
    });

    return result ? this.mapAnnouncementFromPrisma(result) : null;
  }

  async findAll(query: AnnouncementQuery = {}): Promise<Announcement[]> {
    const { limit = 10, offset = 0, ...filters } = query;
    const where = this._buildWhereClause(filters);

    const results = await this.prisma.announcement.findMany({
      where,
      include: {
        media: true,
        bannerPreset: true,
        offerings: { select: { type: true } },
        _count: { select: { condolences: true } },
      },
      skip: offset,
      take: limit,
      orderBy: {
        createdAt: 'desc'
      }
    });

    return results.map(announcement => this.mapAnnouncementFromPrisma(announcement));
  }

  async countAnnouncements(filters: Omit<AnnouncementQuery, 'limit' | 'offset'> = {}): Promise<number> {
    const where = this._buildWhereClause(filters);
    return this.prisma.announcement.count({
      where
    });
  }

  async publishAnnouncement(id: string): Promise<Announcement> {
    const result = await this.prisma.announcement.update({
      where: { id },
      data: {
        status: 'PUBLISHED'
      },
      include: {
        media: true,
        bannerPreset: true
      }
    });

    return this.mapAnnouncementFromPrisma(result);
  }

  async rejectAnnouncement(id: string): Promise<Announcement> {
    const result = await this.prisma.announcement.update({
      where: { id },
      data: {
        status: 'REJECTED'
      },
      include: {
        media: true,
        bannerPreset: true
      }
    });

    return this.mapAnnouncementFromPrisma(result);
  }
}

// Implémentation de la factory
export class PrismaAnnouncementRepositoryFactory implements IAnnouncementRepositoryFactory {
  create(): IAnnouncementRepository {
    return new PrismaAnnouncementRepository(new PrismaClient());
  }
}

// Utilitaire pour gérer le cycle de vie du repository
export async function withAnnouncementRepository<T>(
  callback: (repository: IAnnouncementRepository) => Promise<T>
): Promise<T> {
  const repository = new PrismaAnnouncementRepository(new PrismaClient());
  
  try {
    return await callback(repository);
  } finally {
    await repository.dispose();
  }
}

// Exporter une instance de la factory
export const announcementRepositoryFactory = new PrismaAnnouncementRepositoryFactory(); 