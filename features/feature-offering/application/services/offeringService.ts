import { offeringRepository } from '../../infrastructure/repositories/offeringRepository';
import { OfferingCounts } from '../../domain/types/offering';
import { OfferingType } from '@prisma/client';

class OfferingService {
  async createOffering(type: OfferingType, announcementId: string, userId: string) {
    return offeringRepository.create(type, announcementId, userId);
  }

  async getCountsByAnnouncementId(announcementId: string): Promise<OfferingCounts> {
    return offeringRepository.getCountsByAnnouncementId(announcementId);
  }

  async getUserOfferingTypes(userId: string, announcementId: string): Promise<OfferingType[]> {
    return offeringRepository.getUserOfferingTypes(userId, announcementId);
  }
}

export const offeringService = new OfferingService();
