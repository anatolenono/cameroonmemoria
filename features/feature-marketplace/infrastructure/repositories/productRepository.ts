import { PrismaClient, Prisma } from '@prisma/client';
import {
  ProviderProduct,
  CreateProductDto,
  UpdateProductDto,
  ProductQuery,
} from '../../domain/types/marketplace';

export interface IProductRepository {
  create(data: CreateProductDto, providerId: string): Promise<ProviderProduct>;
  update(id: string, data: UpdateProductDto): Promise<ProviderProduct>;
  delete(id: string): Promise<void>;
  findById(id: string): Promise<ProviderProduct | null>;
  findByProvider(providerId: string, query?: ProductQuery): Promise<ProviderProduct[]>;
  count(providerId: string, filters?: Omit<ProductQuery, 'limit' | 'offset'>): Promise<number>;
  getPrismaInstance(): PrismaClient;
  dispose(): Promise<void>;
}

export interface IProductRepositoryFactory {
  create(): IProductRepository;
}

type PrismaProduct = Prisma.ProviderProductGetPayload<{
  include: {
    category: { select: { id: true; name: true; slug: true } };
  };
}>;

function mapFromPrisma(row: PrismaProduct): ProviderProduct {
  return {
    id: row.id,
    providerId: row.providerId,
    categoryId: row.categoryId,
    category: row.category ?? undefined,
    name: row.name,
    description: row.description,
    price: row.price,
    currency: row.currency,
    imageUrl: row.imageUrl,
    conditions: row.conditions,
    isActive: row.isActive,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
}

const INCLUDE = {
  category: { select: { id: true as const, name: true as const, slug: true as const } },
};

export class PrismaProductRepository implements IProductRepository {
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

  async create(data: CreateProductDto, providerId: string): Promise<ProviderProduct> {
    const row = await this.prisma.providerProduct.create({
      data: {
        providerId,
        categoryId: data.categoryId,
        name: data.name,
        description: data.description,
        price: data.price,
        currency: data.currency ?? 'XAF',
        imageUrl: data.imageUrl,
        conditions: data.conditions,
        isActive: data.isActive ?? true,
      },
      include: INCLUDE,
    });
    return mapFromPrisma(row);
  }

  async update(id: string, data: UpdateProductDto): Promise<ProviderProduct> {
    const row = await this.prisma.providerProduct.update({
      where: { id },
      data: {
        ...(data.categoryId !== undefined && { categoryId: data.categoryId }),
        ...(data.name !== undefined && { name: data.name }),
        ...(data.description !== undefined && { description: data.description }),
        ...(data.price !== undefined && { price: data.price }),
        ...(data.currency !== undefined && { currency: data.currency }),
        ...(data.imageUrl !== undefined && { imageUrl: data.imageUrl }),
        ...(data.conditions !== undefined && { conditions: data.conditions }),
        ...(data.isActive !== undefined && { isActive: data.isActive }),
      },
      include: INCLUDE,
    });
    return mapFromPrisma(row);
  }

  async delete(id: string): Promise<void> {
    await this.prisma.providerProduct.delete({ where: { id } });
  }

  async findById(id: string): Promise<ProviderProduct | null> {
    const row = await this.prisma.providerProduct.findUnique({
      where: { id },
      include: INCLUDE,
    });
    return row ? mapFromPrisma(row) : null;
  }

  async findByProvider(providerId: string, query: ProductQuery = {}): Promise<ProviderProduct[]> {
    const { limit = 50, offset = 0, isActive, categoryId } = query;
    const where: Prisma.ProviderProductWhereInput = { providerId };
    if (isActive !== undefined) where.isActive = isActive;
    if (categoryId !== undefined) where.categoryId = categoryId;

    const rows = await this.prisma.providerProduct.findMany({
      where,
      include: INCLUDE,
      skip: offset,
      take: limit,
      orderBy: { createdAt: 'desc' },
    });
    return rows.map(mapFromPrisma);
  }

  async count(providerId: string, filters: Omit<ProductQuery, 'limit' | 'offset'> = {}): Promise<number> {
    const where: Prisma.ProviderProductWhereInput = { providerId };
    if (filters.isActive !== undefined) where.isActive = filters.isActive;
    if (filters.categoryId !== undefined) where.categoryId = filters.categoryId;
    return this.prisma.providerProduct.count({ where });
  }
}

export class PrismaProductRepositoryFactory implements IProductRepositoryFactory {
  create(): IProductRepository {
    return new PrismaProductRepository(new PrismaClient());
  }
}

export const productRepositoryFactory = new PrismaProductRepositoryFactory();
