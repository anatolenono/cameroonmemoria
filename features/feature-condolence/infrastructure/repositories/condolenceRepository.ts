import { PrismaClient } from '@prisma/client';
import { 
  Condolence, 
  CreateCondolenceDto, 
  UpdateCondolenceDto, 
  CondolenceQuery 
} from '../../domain/types/condolence';

export interface ICondolenceRepository {
  create(data: CreateCondolenceDto, userId: string): Promise<Condolence>;
  findById(id: string): Promise<Condolence | null>;
  findAll(query: CondolenceQuery): Promise<Condolence[]>;
  update(id: string, data: UpdateCondolenceDto): Promise<Condolence>;
  delete(id: string): Promise<void>;
  countCondolences(query: Omit<CondolenceQuery, 'limit' | 'offset'>): Promise<number>;
  dispose(): Promise<void>;
}

export class CondolenceRepository implements ICondolenceRepository {
  private prisma: PrismaClient;

  constructor(prisma?: PrismaClient) {
    this.prisma = prisma || new PrismaClient();
  }

  async create(data: CreateCondolenceDto, userId: string): Promise<Condolence> {
    const condolence = await this.prisma.condolence.create({
      data: {
        ...data,
        userId,
        isApproved: false, // Par défaut, les condoléances doivent être approuvées
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          }
        },
        announcement: {
          select: {
            id: true,
            title: true,
          }
        }
      }
    });

    return this.mapPrismaToCondolence(condolence);
  }

  async findById(id: string): Promise<Condolence | null> {
    const condolence = await this.prisma.condolence.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          }
        },
        announcement: {
          select: {
            id: true,
            title: true,
          }
        }
      }
    });

    return condolence ? this.mapPrismaToCondolence(condolence) : null;
  }

  async findAll(query: CondolenceQuery): Promise<Condolence[]> {
    const { limit = 10, offset = 0, ...filters } = query;

    const condolences = await this.prisma.condolence.findMany({
      where: {
        ...(filters.announcementId && { announcementId: filters.announcementId }),
        ...(filters.userId && { userId: filters.userId }),
        ...(filters.isApproved !== undefined && { isApproved: filters.isApproved }),
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          }
        },
        announcement: {
          select: {
            id: true,
            title: true,
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: limit,
      skip: offset,
    });

    return condolences.map(this.mapPrismaToCondolence);
  }

  async update(id: string, data: UpdateCondolenceDto): Promise<Condolence> {
    const condolence = await this.prisma.condolence.update({
      where: { id },
      data,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          }
        },
        announcement: {
          select: {
            id: true,
            title: true,
          }
        }
      }
    });

    return this.mapPrismaToCondolence(condolence);
  }

  async delete(id: string): Promise<void> {
    await this.prisma.condolence.delete({
      where: { id }
    });
  }

  async countCondolences(query: Omit<CondolenceQuery, 'limit' | 'offset'>): Promise<number> {
    return await this.prisma.condolence.count({
      where: {
        ...(query.announcementId && { announcementId: query.announcementId }),
        ...(query.userId && { userId: query.userId }),
        ...(query.isApproved !== undefined && { isApproved: query.isApproved }),
      }
    });
  }

  async dispose(): Promise<void> {
    await this.prisma.$disconnect();
  }

  private mapPrismaToCondolence(prismaCondolence: {
    id: string;
    message: string;
    isAnonymous: boolean;
    isApproved: boolean;
    createdAt: Date;
    updatedAt: Date;
    userId: string;
    announcementId: string;
    user?: {
      id: string;
      name: string | null;
      email: string;
    } | null;
    announcement?: {
      id: string;
      title: string;
    } | null;
  }): Condolence {
    return {
      id: prismaCondolence.id,
      message: prismaCondolence.message,
      isAnonymous: prismaCondolence.isAnonymous,
      isApproved: prismaCondolence.isApproved,
      createdAt: prismaCondolence.createdAt,
      updatedAt: prismaCondolence.updatedAt,
      userId: prismaCondolence.userId,
      announcementId: prismaCondolence.announcementId,
      user: prismaCondolence.user ? {
        id: prismaCondolence.user.id,
        name: prismaCondolence.user.name || undefined,
        email: prismaCondolence.user.email,
      } : undefined,
      announcement: prismaCondolence.announcement || undefined,
    };
  }
}

export interface ICondolenceRepositoryFactory {
  create(): ICondolenceRepository;
}

export class CondolenceRepositoryFactory implements ICondolenceRepositoryFactory {
  create(): ICondolenceRepository {
    return new CondolenceRepository();
  }
}

export const condolenceRepositoryFactory = new CondolenceRepositoryFactory(); 