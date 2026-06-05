import { 
  condolenceRepositoryFactory,
  ICondolenceRepositoryFactory
} from '../../infrastructure/repositories/condolenceRepository';
import { 
  Condolence, 
  CreateCondolenceDto, 
  UpdateCondolenceDto, 
  CondolenceQuery 
} from '../../domain/types/condolence';

export class CondolenceService {
  private condolenceRepositoryFactory: ICondolenceRepositoryFactory;

  constructor(condolenceRepositoryFactory: ICondolenceRepositoryFactory) {
    this.condolenceRepositoryFactory = condolenceRepositoryFactory;
  }

  async createCondolence(data: CreateCondolenceDto, userId: string): Promise<Condolence> {
    const repository = this.condolenceRepositoryFactory.create();
    try {
      return await repository.create(data, userId);
    } finally {
      await repository.dispose();
    }
  }

  async getCondolenceById(id: string): Promise<Condolence> {
    const repository = this.condolenceRepositoryFactory.create();
    try {
      const condolence = await repository.findById(id);
      
      if (!condolence) {
        throw new Error('Condolence not found');
      }
      
      return condolence;
    } finally {
      await repository.dispose();
    }
  }

  async getCondolencesByAnnouncementId(announcementId: string, query: Omit<CondolenceQuery, 'announcementId'> = {}): Promise<{
    condolences: Condolence[];
    total: number;
    limit: number;
    offset: number;
  }> {
    const repository = this.condolenceRepositoryFactory.create();
    try {
      const { limit = 10, offset = 0, isApproved = true } = query;
      
      const fullQuery: CondolenceQuery = {
        announcementId,
        isApproved,
        limit,
        offset,
        ...query
      };
      
      const [condolences, total] = await Promise.all([
        repository.findAll(fullQuery),
        repository.countCondolences({
          announcementId,
          isApproved,
          userId: query.userId
        })
      ]);
      
      return {
        condolences,
        total,
        limit: Number(limit),
        offset: Number(offset)
      };
    } finally {
      await repository.dispose();
    }
  }

  async getAllCondolences(query: CondolenceQuery = {}): Promise<{
    condolences: Condolence[];
    total: number;
    limit: number;
    offset: number;
  }> {
    const repository = this.condolenceRepositoryFactory.create();
    try {
      const { limit = 10, offset = 0 } = query;
      
      const [condolences, total] = await Promise.all([
        repository.findAll(query),
        repository.countCondolences({
          announcementId: query.announcementId,
          userId: query.userId,
          isApproved: query.isApproved
        })
      ]);
      
      return {
        condolences,
        total,
        limit: Number(limit),
        offset: Number(offset)
      };
    } finally {
      await repository.dispose();
    }
  }

  async updateCondolence(id: string, data: UpdateCondolenceDto): Promise<Condolence> {
    const repository = this.condolenceRepositoryFactory.create();
    try {
      const condolence = await repository.findById(id);
      
      if (!condolence) {
        throw new Error('Condolence not found');
      }
      
      return await repository.update(id, data);
    } finally {
      await repository.dispose();
    }
  }

  async deleteCondolence(id: string): Promise<void> {
    const repository = this.condolenceRepositoryFactory.create();
    try {
      const condolence = await repository.findById(id);
      
      if (!condolence) {
        throw new Error('Condolence not found');
      }
      
      await repository.delete(id);
    } finally {
      await repository.dispose();
    }
  }

  async approveCondolence(id: string): Promise<Condolence> {
    return await this.updateCondolence(id, { isApproved: true });
  }

  async rejectCondolence(id: string): Promise<Condolence> {
    return await this.updateCondolence(id, { isApproved: false });
  }
}

export const condolenceService = new CondolenceService(condolenceRepositoryFactory); 