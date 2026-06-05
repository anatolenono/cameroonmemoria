import { IMediaRepositoryFactory, mediaRepositoryFactory } from '../../infrastructure/repositories/mediaRepository';
import {
  Media,
  MediaType,
  CreateMediaDto
} from '../../domain/types/media';

export class MediaService {
  private mediaRepositoryFactory: IMediaRepositoryFactory;

  constructor(mediaRepositoryFactory: IMediaRepositoryFactory) {
    this.mediaRepositoryFactory = mediaRepositoryFactory;
  }

  /**
   * Crée un nouveau média
   */
  async createMedia(data: CreateMediaDto): Promise<Media> {
    const repository = this.mediaRepositoryFactory.create();
    try {
      return await repository.create(data);
    } finally {
      await repository.dispose();
    }
  }

  /**
   * Crée plusieurs médias en une seule fois
   */
  async createManyMedia(dataArray: CreateMediaDto[]): Promise<Media[]> {
    const repository = this.mediaRepositoryFactory.create();
    try {
      return await repository.createMany(dataArray);
    } finally {
      await repository.dispose();
    }
  }

  /**
   * Récupère un média par son ID
   */
  async getMediaById(id: string): Promise<Media | null> {
    const repository = this.mediaRepositoryFactory.create();
    try {
      return await repository.findById(id);
    } finally {
      await repository.dispose();
    }
  }

  /**
   * Supprime un média
   */
  async deleteMedia(id: string): Promise<void> {
    const repository = this.mediaRepositoryFactory.create();
    try {
      await repository.delete(id);
    } finally {
      await repository.dispose();
    }
  }

  /**
   * Rattache un média à une annonce
   */
  async attachMediaToAnnouncement(mediaId: string, announcementId: string): Promise<Media> {
    const repository = this.mediaRepositoryFactory.create();
    try {
      return await repository.attachToAnnouncement(mediaId, announcementId);
    } finally {
      await repository.dispose();
    }
  }
  /**
   * Détermine le type de média à partir du type MIME
   */
  determineMediaType(mimetype: string): MediaType {
    if (mimetype.startsWith('image/')) {
      return MediaType.IMAGE;
    } else if (mimetype.startsWith('application/pdf') || 
              mimetype.startsWith('application/msword') ||
              mimetype.includes('document')) {
      return MediaType.DOCUMENT;
    } else {
      return MediaType.OTHER;
    }
  }
};

export const mediaService = new MediaService(mediaRepositoryFactory);