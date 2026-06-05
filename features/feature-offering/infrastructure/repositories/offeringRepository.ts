import { prisma } from '@/lib/prisma';
import { OfferingCounts } from '../../domain/types/offering';
import { OfferingType } from '@prisma/client';

export class OfferingRepository {
  async create(type: OfferingType, announcementId: string, userId: string) {
    return prisma.offering.create({
      data: { type, announcementId, userId },
      include: { user: { select: { id: true, name: true } } },
    });
  }

  async getCountsByAnnouncementId(announcementId: string): Promise<OfferingCounts> {
    const counts = await prisma.offering.groupBy({
      by: ['type'],
      where: { announcementId },
      _count: true,
    });

    return {
      flowers: counts.find((c) => c.type === 'FLOWER')?._count ?? 0,
      candles: counts.find((c) => c.type === 'CANDLE')?._count ?? 0,
    };
  }

  async getUserOfferingTypes(userId: string, announcementId: string): Promise<OfferingType[]> {
    const offerings = await prisma.offering.findMany({
      where: { userId, announcementId },
      select: { type: true },
      distinct: ['type'],
    });
    return offerings.map((o) => o.type);
  }
}

export const offeringRepository = new OfferingRepository();
