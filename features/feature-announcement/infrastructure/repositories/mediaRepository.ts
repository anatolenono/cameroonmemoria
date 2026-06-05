import { PrismaClient, Media as PrismaMedia, MediaType as PrismaMediaType } from '@prisma/client';
import { 
  Media, 
  MediaType,
  CreateMediaDto
} from '../../domain/types/media';

// Interface pour le repository de médias
export interface IMediaRepository {
  create(data: CreateMediaDto): Promise<Media>;
  createMany(dataArray: CreateMediaDto[]): Promise<Media[]>;
  findById(id: string): Promise<Media | null>;
  delete(id: string): Promise<void>;
  attachToAnnouncement(mediaId: string, announcementId: string): Promise<Media>;
  getPrismaInstance(): PrismaClient;
  dispose(): Promise<void>;
}

// Interface pour la factory du repository de médias
export interface IMediaRepositoryFactory {
  create(): IMediaRepository;
}

// Implémentation avec Prisma
export class PrismaMediaRepository implements IMediaRepository {
  private prisma: PrismaClient;
  
  constructor() {
    this.prisma = new PrismaClient();
  }
  
  // Fonction pour mapper le type Prisma vers notre type personnalisé
  private mapMediaFromPrisma(media: PrismaMedia): Media {
    return {
      id: media.id,
      url: media.url,
      type: media.type as unknown as MediaType,
      createdAt: media.createdAt,
      announcementId: media.announcementId
    };
  }
  
  // Libère les ressources à la fin du cycle de vie
  async dispose(): Promise<void> {
    await this.prisma.$disconnect();
  }
  
  /**
   * Crée un nouveau média
   */
  async create(data: CreateMediaDto): Promise<Media> {
    const result = await this.prisma.media.create({
      data: {
        url: data.url,
        type: data.type as unknown as PrismaMediaType,
        announcementId: data.announcementId || '',
      }
    });
    
    return this.mapMediaFromPrisma(result);
  }

  /**
   * Crée plusieurs médias à la fois
   */
  async createMany(dataArray: CreateMediaDto[]): Promise<Media[]> {
    const results = await Promise.all(
      dataArray.map(data => 
        this.prisma.media.create({
          data: {
            url: data.url,
            type: data.type as unknown as PrismaMediaType,
            announcementId: data.announcementId || '',
          }
        })
      )
    );
    
    return results.map(media => this.mapMediaFromPrisma(media));
  }
  
  /**
   * Récupère un média par son ID
   */
  async findById(id: string): Promise<Media | null> {
    const result = await this.prisma.media.findUnique({
      where: { id }
    });
    
    return result ? this.mapMediaFromPrisma(result) : null;
  }
  
  /**
   * Supprime un média
   */
  async delete(id: string): Promise<void> {
    await this.prisma.media.delete({
      where: { id }
    });
  }
  
  /**
   * Rattache un média à une annonce
   */
  async attachToAnnouncement(mediaId: string, announcementId: string): Promise<Media> {
    const result = await this.prisma.media.update({
      where: { id: mediaId },
      data: {
        announcementId: announcementId
      }
    });
    
    return this.mapMediaFromPrisma(result);
  }

  /**
   * Récupère l'instance Prisma pour des transactions
   */
  getPrismaInstance(): PrismaClient {
    return this.prisma;
  }
}

// Implémentation de la factory
export class PrismaMediaRepositoryFactory implements IMediaRepositoryFactory {
  create(): IMediaRepository {
    return new PrismaMediaRepository();
  }
}

// Utilitaire pour gérer le cycle de vie du repository
export async function withMediaRepository<T>(
  callback: (repository: IMediaRepository) => Promise<T>
): Promise<T> {
  const repository = new PrismaMediaRepository();
  
  try {
    return await callback(repository);
  } finally {
    await repository.dispose();
  }
}

// Exporter une instance de la factory
export const mediaRepositoryFactory = new PrismaMediaRepositoryFactory(); 