import { PrismaClient, BannerPreset as PrismaBannerPreset, BannerType as PrismaBannerType } from '@prisma/client';
import {
  BannerPreset,
  BannerType,
  CreateBannerPresetDto,
  UpdateBannerPresetDto
} from '../../domain/types/banner';

// Interface for the banner preset repository
export interface IBannerPresetRepository {
  findAll(): Promise<BannerPreset[]>;
  findAllActive(): Promise<BannerPreset[]>;
  findAllActiveGrouped(): Promise<Map<BannerType, BannerPreset[]>>;
  findById(id: string): Promise<BannerPreset | null>;
  create(data: CreateBannerPresetDto): Promise<BannerPreset>;
  update(id: string, data: UpdateBannerPresetDto): Promise<BannerPreset>;
  delete(id: string): Promise<void>;
  getPrismaInstance(): PrismaClient;
  dispose(): Promise<void>;
}

// Factory interface
export interface IBannerPresetRepositoryFactory {
  create(): IBannerPresetRepository;
}

// Implementation with Prisma
export class PrismaBannerPresetRepository implements IBannerPresetRepository {
  private prisma: PrismaClient;

  constructor() {
    this.prisma = new PrismaClient();
  }

  // Map Prisma type to domain type
  private mapFromPrisma(preset: PrismaBannerPreset): BannerPreset {
    return {
      id: preset.id,
      name: preset.name,
      type: preset.type as unknown as BannerType,
      imageUrl: preset.imageUrl,
      thumbnailUrl: preset.thumbnailUrl,
      category: preset.category,
      isActive: preset.isActive,
      displayOrder: preset.displayOrder,
      createdAt: preset.createdAt,
      updatedAt: preset.updatedAt,
    };
  }

  async dispose(): Promise<void> {
    await this.prisma.$disconnect();
  }

  async findAll(): Promise<BannerPreset[]> {
    const results = await this.prisma.bannerPreset.findMany({
      orderBy: [
        { type: 'asc' },
        { displayOrder: 'asc' },
      ],
    });

    return results.map(r => this.mapFromPrisma(r));
  }

  async findAllActive(): Promise<BannerPreset[]> {
    const results = await this.prisma.bannerPreset.findMany({
      where: { isActive: true },
      orderBy: [
        { type: 'asc' },
        { displayOrder: 'asc' },
      ],
    });

    return results.map(r => this.mapFromPrisma(r));
  }

  async findAllActiveGrouped(): Promise<Map<BannerType, BannerPreset[]>> {
    const presets = await this.findAllActive();
    const grouped = new Map<BannerType, BannerPreset[]>();

    presets.forEach(preset => {
      const existing = grouped.get(preset.type) || [];
      existing.push(preset);
      grouped.set(preset.type, existing);
    });

    return grouped;
  }

  async findById(id: string): Promise<BannerPreset | null> {
    const result = await this.prisma.bannerPreset.findUnique({
      where: { id },
    });

    return result ? this.mapFromPrisma(result) : null;
  }

  async create(data: CreateBannerPresetDto): Promise<BannerPreset> {
    const result = await this.prisma.bannerPreset.create({
      data: {
        name: data.name,
        type: data.type as unknown as PrismaBannerType,
        imageUrl: data.imageUrl,
        thumbnailUrl: data.thumbnailUrl || null,
        category: data.category || null,
        displayOrder: data.displayOrder || 0,
        isActive: true,
      },
    });

    return this.mapFromPrisma(result);
  }

  async update(id: string, data: UpdateBannerPresetDto): Promise<BannerPreset> {
    const updateData: {
      name?: string;
      type?: PrismaBannerType;
      imageUrl?: string;
      thumbnailUrl?: string;
      category?: string;
      isActive?: boolean;
      displayOrder?: number;
    } = {};

    if (data.name !== undefined) updateData.name = data.name;
    if (data.type !== undefined) updateData.type = data.type as unknown as PrismaBannerType;
    if (data.imageUrl !== undefined) updateData.imageUrl = data.imageUrl;
    if (data.thumbnailUrl !== undefined) updateData.thumbnailUrl = data.thumbnailUrl;
    if (data.category !== undefined) updateData.category = data.category;
    if (data.isActive !== undefined) updateData.isActive = data.isActive;
    if (data.displayOrder !== undefined) updateData.displayOrder = data.displayOrder;

    const result = await this.prisma.bannerPreset.update({
      where: { id },
      data: updateData,
    });

    return this.mapFromPrisma(result);
  }

  async delete(id: string): Promise<void> {
    await this.prisma.bannerPreset.delete({
      where: { id },
    });
  }

  getPrismaInstance(): PrismaClient {
    return this.prisma;
  }
}

// Factory implementation
export class PrismaBannerPresetRepositoryFactory implements IBannerPresetRepositoryFactory {
  create(): IBannerPresetRepository {
    return new PrismaBannerPresetRepository();
  }
}

// Utility to manage repository lifecycle
export async function withBannerPresetRepository<T>(
  callback: (repository: IBannerPresetRepository) => Promise<T>
): Promise<T> {
  const repository = new PrismaBannerPresetRepository();

  try {
    return await callback(repository);
  } finally {
    await repository.dispose();
  }
}

// Export singleton factory instance
export const bannerPresetRepositoryFactory = new PrismaBannerPresetRepositoryFactory();
