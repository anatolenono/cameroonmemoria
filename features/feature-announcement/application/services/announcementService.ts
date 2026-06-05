import { 
  announcementRepositoryFactory,
  IAnnouncementRepositoryFactory
} from '../../infrastructure/repositories/announcementRepository';
import { 
  mediaRepositoryFactory,
} from '../../infrastructure/repositories/mediaRepository';
import { 
  Announcement, 
  AnnouncementQuery, 
  AnnouncementType, 
  CreateAnnouncementDto, 
  UpdateAnnouncementDto 
} from '../../domain/types/announcement';
import { CreateMediaDto, Media } from '../../domain/types/media';

export class AnnouncementService {
  private announcementRepositoryFactory: IAnnouncementRepositoryFactory;
  constructor(announcementRepositoryFactory: IAnnouncementRepositoryFactory) {
    this.announcementRepositoryFactory = announcementRepositoryFactory;
  }
  async createAnnouncement(data: CreateAnnouncementDto, userId?: string): Promise<Announcement> {
    const repository = this.announcementRepositoryFactory.create();
    try {
      return await repository.create(data, userId);
    } finally {
      await repository.dispose();
    }
  }

  /**
   * Crée une annonce avec des médias en utilisant une transaction pour garantir l'atomicité
   * @param data Les données de l'annonce
   * @param uploadedMedias Les médias à créer et associer à l'annonce
   * @param userId ID de l'utilisateur (optionnel)
   * @returns L'annonce créée avec ses médias
   */
  async createAnnouncementWithMedia(
    data: CreateAnnouncementDto, 
    uploadedMedias: CreateMediaDto[], 
    userId?: string
  ): Promise<Announcement> {
    // Créer des repositories temporaires pour la transaction
    const announcementRepo = announcementRepositoryFactory.create();
    const mediaRepo = mediaRepositoryFactory.create();
    
    try {
      // Récupérer l'instance Prisma
      const prisma = mediaRepo.getPrismaInstance();
      
      // Utiliser une transaction pour garantir l'atomicité
      const result = await prisma.$transaction(async (tx) => {
        // 1. Créer l'annonce
        const { mediaIds, ...announcementData } = data;
        // All announcements require moderation before publication
        const status = 'PENDING';

        console.log('Creating announcement with data:', {
          bannerPresetId: announcementData.bannerPresetId,
          bannerCustomUrl: announcementData.bannerCustomUrl
        });

        const announcement = await tx.announcement.create({
          data: {
            ...announcementData,
            userId,
            status: status,
            deceasedBirthDate: data.deceasedBirthDate ? new Date(data.deceasedBirthDate) : null,
            deceasedDeathDate: new Date(data.deceasedDeathDate),
            ceremonyDate: data.ceremonyDate ? new Date(data.ceremonyDate) : null,
            events: data.events ? JSON.stringify(data.events) : undefined,
            media: mediaIds ? {
              connect: mediaIds.map(id => ({ id }))
            } : undefined
          },
          include: {
            media: true,
            bannerPreset: true
          }
        });

        console.log('Announcement created with banner fields:', {
          id: announcement.id,
          bannerPresetId: announcement.bannerPresetId,
          bannerCustomUrl: announcement.bannerCustomUrl
        });
        
        // 2. Si des médias ont été uploadés, les créer et les associer à l'annonce
        if (uploadedMedias && uploadedMedias.length > 0) {
          // Traitement synchrone des médias un par un
          for (const media of uploadedMedias) {
            await tx.media.create({
              data: {
                url: media.url,
                type: media.type,
                announcementId: announcement.id
              }
            });
          }
          
          // Récupérer l'annonce mise à jour avec tous les médias
          return await tx.announcement.findUnique({
            where: { id: announcement.id },
            include: {
              media: true,
              bannerPreset: true
            }
          });
        }
        
        // Retourner l'annonce créée
        return announcement;
      });

      // Convertir le résultat Prisma vers le type Announcement du domaine
      if (!result) {
        throw new Error('Échec de la création de l\'annonce');
      }

      const bannerPreset = result.bannerPreset ? {
        id: result.bannerPreset.id,
        name: result.bannerPreset.name,
        imageUrl: result.bannerPreset.imageUrl
      } : null;

      return {
        id: result.id,
        title: result.title,
        description: result.description,
        type: result.type,
        status: result.status,
        isAnonymous: result.isAnonymous,
        deceasedName: result.deceasedName,
        deceasedPronoun: (result as Record<string, unknown>).deceasedPronoun ?? null,
        deceasedBirthDate: result.deceasedBirthDate,
        deceasedBirthPlace: (result as Record<string, unknown>).deceasedBirthPlace ?? null,
        deceasedDeathDate: result.deceasedDeathDate,
        deceasedPhotoUrl: (result as Record<string, unknown>).deceasedPhotoUrl ?? null,
        ceremonyDate: result.ceremonyDate,
        ceremonyLocation: result.ceremonyLocation,
        events: typeof result.events === 'string' ? JSON.parse(result.events) : result.events,
        relationship: result.relationship,
        bannerPresetId: result.bannerPresetId,
        bannerPreset: bannerPreset ? {
          id: bannerPreset.id,
          name: bannerPreset.name,
          imageUrl: bannerPreset.imageUrl
        } : null,
        bannerCustomUrl: result.bannerCustomUrl,
        createdAt: result.createdAt,
        updatedAt: result.updatedAt,
        userId: result.userId,
        media: Array.isArray((result as { media?: unknown[] }).media) ? (result as { media: Media[] }).media : []
      } as Announcement;
    } finally {
      // Libérer les ressources
      await Promise.all([
        announcementRepo.dispose(),
        mediaRepo.dispose()
      ]);
    }
  }

  async updateAnnouncement(id: string, data: UpdateAnnouncementDto): Promise<Announcement> {
    const repository = this.announcementRepositoryFactory.create();
    try {
      const announcement = await repository.findById(id);
      
      if (!announcement) {
        throw new Error('Announcement not found');
      }
      
      return await repository.update(id, data);
    } finally {
      await repository.dispose();
    }
  }

  async deleteAnnouncement(id: string): Promise<void> {
    const repository = this.announcementRepositoryFactory.create();
    try {
      const announcement = await repository.findById(id);
      
      if (!announcement) {
        throw new Error('Announcement not found');
      }
      
      await repository.delete(id);
    } finally {
      await repository.dispose();
    }
  }

  async getAnnouncementById(id: string): Promise<Announcement> {
    const repository = this.announcementRepositoryFactory.create();
    try {
      const announcement = await repository.findById(id);
      
      if (!announcement) {
        throw new Error('Announcement not found');
      }
      
      return announcement;
    } finally {
      await repository.dispose();
    }
  }

  async getAllAnnouncements(query: AnnouncementQuery = {}): Promise<{
    announcements: Announcement[];
    total: number;
    limit: number;
    offset: number;
  }> {
    const repository = this.announcementRepositoryFactory.create();
    try {
      const { limit = 10, offset = 0 } = query;
      
      const [announcements, total] = await Promise.all([
        repository.findAll(query),
        repository.countAnnouncements({
          type: query.type,
          status: query.status,
          userId: query.userId
        })
      ]);
      
      return {
        announcements,
        total,
        limit: Number(limit),
        offset: Number(offset)
      };
    } finally {
      await repository.dispose();
    }
  }

  async publishAnnouncement(id: string): Promise<Announcement> {
    const repository = this.announcementRepositoryFactory.create();
    try {
      const announcement = await repository.findById(id);
      
      if (!announcement) {
        throw new Error('Announcement not found');
      }
      
      return await repository.publishAnnouncement(id);
    } finally {
      await repository.dispose();
    }
  }

  async rejectAnnouncement(id: string): Promise<Announcement> {
    const repository = this.announcementRepositoryFactory.create();
    try {
      const announcement = await repository.findById(id);
      
      if (!announcement) {
        throw new Error('Announcement not found');
      }
      
      return await repository.rejectAnnouncement(id);
    } finally {
      await repository.dispose();
    }
  }
}

export const announcementService = new AnnouncementService(announcementRepositoryFactory);
