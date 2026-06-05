import { PrismaClient, Prisma } from '@prisma/client';
import {
  MarketplaceCategory,
  CreateCategoryDto,
  UpdateCategoryDto,
  CategoryQuery,
} from '../../domain/types/marketplace';

export interface ICategoryRepository {
  create(data: CreateCategoryDto): Promise<MarketplaceCategory>;
  update(id: string, data: UpdateCategoryDto): Promise<MarketplaceCategory>;
  delete(id: string): Promise<void>;
  findById(id: string): Promise<MarketplaceCategory | null>;
  findBySlug(slug: string): Promise<MarketplaceCategory | null>;
  findAll(query?: CategoryQuery): Promise<MarketplaceCategory[]>;
  count(filters?: Omit<CategoryQuery, 'limit' | 'offset'>): Promise<number>;
  getPrismaInstance(): PrismaClient;
  dispose(): Promise<void>;
}

export interface ICategoryRepositoryFactory {
  create(): ICategoryRepository;
}

type PrismaCategory = Prisma.MarketplaceCategoryGetPayload<{
  include: { _count: { select: { providers: true; products: true } } };
}>;

function mapFromPrisma(row: PrismaCategory): MarketplaceCategory {
  return {
    id: row.id,
    name: row.name,
    description: row.description,
    slug: row.slug,
    imageUrl: row.imageUrl,
    isActive: row.isActive,
    displayOrder: row.displayOrder,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
    _count: row._count,
  };
}

function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

const INCLUDE = { _count: { select: { providers: true as const, products: true as const } } };

export class PrismaCategoryRepository implements ICategoryRepository {
  private prisma: PrismaClient;

  constructor(prisma: PrismaClient) {
    this.prisma = prisma;
  }

  async dispose(): Promise<void> {
    await this.prisma.$disconnect();
  }

  getPrismaInstance(): PrismaClient {
    return this.prisma;
  }

  async create(data: CreateCategoryDto): Promise<MarketplaceCategory> {
    const slug = data.slug || generateSlug(data.name);
    const row = await this.prisma.marketplaceCategory.create({
      data: {
        name: data.name,
        description: data.description,
        slug,
        imageUrl: data.imageUrl,
        isActive: data.isActive ?? true,
        displayOrder: data.displayOrder ?? 0,
      },
      include: INCLUDE,
    });
    return mapFromPrisma(row);
  }

  async update(id: string, data: UpdateCategoryDto): Promise<MarketplaceCategory> {
    const row = await this.prisma.marketplaceCategory.update({
      where: { id },
      data: {
        ...(data.name !== undefined && { name: data.name }),
        ...(data.description !== undefined && { description: data.description }),
        ...(data.slug !== undefined && { slug: data.slug }),
        ...(data.imageUrl !== undefined && { imageUrl: data.imageUrl }),
        ...(data.isActive !== undefined && { isActive: data.isActive }),
        ...(data.displayOrder !== undefined && { displayOrder: data.displayOrder }),
      },
      include: INCLUDE,
    });
    return mapFromPrisma(row);
  }

  async delete(id: string): Promise<void> {
    await this.prisma.marketplaceCategory.delete({ where: { id } });
  }

  async findById(id: string): Promise<MarketplaceCategory | null> {
    const row = await this.prisma.marketplaceCategory.findUnique({
      where: { id },
      include: INCLUDE,
    });
    return row ? mapFromPrisma(row) : null;
  }

  async findBySlug(slug: string): Promise<MarketplaceCategory | null> {
    const row = await this.prisma.marketplaceCategory.findUnique({
      where: { slug },
      include: INCLUDE,
    });
    return row ? mapFromPrisma(row) : null;
  }

  async findAll(query: CategoryQuery = {}): Promise<MarketplaceCategory[]> {
    const { limit = 100, offset = 0, isActive } = query;
    const where: Prisma.MarketplaceCategoryWhereInput = {};
    if (isActive !== undefined) where.isActive = isActive;

    const rows = await this.prisma.marketplaceCategory.findMany({
      where,
      include: INCLUDE,
      skip: offset,
      take: limit,
      orderBy: [{ displayOrder: 'asc' }, { name: 'asc' }],
    });
    return rows.map(mapFromPrisma);
  }

  async count(filters: Omit<CategoryQuery, 'limit' | 'offset'> = {}): Promise<number> {
    const where: Prisma.MarketplaceCategoryWhereInput = {};
    if (filters.isActive !== undefined) where.isActive = filters.isActive;
    return this.prisma.marketplaceCategory.count({ where });
  }
}

export class PrismaCategoryRepositoryFactory implements ICategoryRepositoryFactory {
  create(): ICategoryRepository {
    return new PrismaCategoryRepository(new PrismaClient());
  }
}

export const categoryRepositoryFactory = new PrismaCategoryRepositoryFactory();
