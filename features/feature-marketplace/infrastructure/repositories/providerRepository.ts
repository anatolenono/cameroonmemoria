import { PrismaClient, Prisma } from '@prisma/client';
import {
  Provider,
  CreateProviderDto,
  UpdateProviderDto,
  ProviderQuery,
  ProviderStatus,
  ProviderActivation,
  ActivationFeeStatus,
  CreateActivationFeeDto,
  UpdateActivationFeeDto,
} from '../../domain/types/marketplace';

export interface IProviderRepository {
  create(data: CreateProviderDto, userId: string): Promise<Provider>;
  update(id: string, data: UpdateProviderDto): Promise<Provider>;
  findById(id: string): Promise<Provider | null>;
  findByUserId(userId: string): Promise<Provider | null>;
  findAll(query?: ProviderQuery): Promise<Provider[]>;
  count(filters?: Omit<ProviderQuery, 'limit' | 'offset'>): Promise<number>;
  activate(id: string, commissionRate?: number): Promise<Provider>;
  suspend(id: string): Promise<Provider>;
  reject(id: string, notes?: string): Promise<Provider>;
  createActivationFee(data: CreateActivationFeeDto): Promise<ProviderActivation>;
  updateActivationFee(activationId: string, data: UpdateActivationFeeDto): Promise<ProviderActivation>;
  findActivationByProvider(providerId: string): Promise<ProviderActivation | null>;
  getPrismaInstance(): PrismaClient;
  dispose(): Promise<void>;
}

export interface IProviderRepositoryFactory {
  create(): IProviderRepository;
}

type PrismaProvider = Prisma.ProviderGetPayload<{
  include: {
    category: { select: { id: true; name: true; slug: true } };
    activation: true;
    user: { select: { id: true; name: true; email: true } };
  };
}>;

type PrismaActivation = Prisma.ProviderActivationGetPayload<Record<string, never>>;

function mapActivationFromPrisma(row: PrismaActivation): ProviderActivation {
  return {
    id: row.id,
    providerId: row.providerId,
    baseAmount: row.baseAmount,
    discountPct: row.discountPct,
    finalAmount: row.finalAmount,
    status: row.status as unknown as ActivationFeeStatus,
    paidAt: row.paidAt,
    notes: row.notes,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
}

function mapFromPrisma(row: PrismaProvider): Provider {
  return {
    id: row.id,
    userId: row.userId,
    categoryId: row.categoryId,
    category: row.category ?? undefined,
    status: row.status as unknown as ProviderStatus,
    companyName: row.companyName,
    companyAddress: row.companyAddress,
    companyCity: row.companyCity,
    companyPhone: row.companyPhone,
    companyEmail: row.companyEmail,
    companyDescription: row.companyDescription,
    repName: row.repName,
    repPhone: row.repPhone,
    repEmail: row.repEmail,
    mobileMoneyNumber: row.mobileMoneyNumber,
    mobileMoneyOperator: row.mobileMoneyOperator,
    commissionRate: row.commissionRate,
    adminNotes: row.adminNotes,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
    activation: row.activation ? mapActivationFromPrisma(row.activation) : null,
    user: row.user ?? null,
  };
}

const INCLUDE = {
  category: { select: { id: true as const, name: true as const, slug: true as const } },
  activation: true as const,
  user: { select: { id: true as const, name: true as const, email: true as const } },
};

export class PrismaProviderRepository implements IProviderRepository {
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

  async create(data: CreateProviderDto, userId: string): Promise<Provider> {
    const row = await this.prisma.provider.create({
      data: {
        userId,
        categoryId: data.categoryId,
        companyName: data.companyName,
        companyAddress: data.companyAddress,
        companyCity: data.companyCity,
        companyPhone: data.companyPhone,
        companyEmail: data.companyEmail,
        companyDescription: data.companyDescription,
        repName: data.repName,
        repPhone: data.repPhone,
        repEmail: data.repEmail,
        mobileMoneyNumber: data.mobileMoneyNumber,
        mobileMoneyOperator: data.mobileMoneyOperator,
        status: 'PENDING',
      },
      include: INCLUDE,
    });
    return mapFromPrisma(row);
  }

  async update(id: string, data: UpdateProviderDto): Promise<Provider> {
    const row = await this.prisma.provider.update({
      where: { id },
      data: {
        ...(data.categoryId !== undefined && { categoryId: data.categoryId }),
        ...(data.companyName !== undefined && { companyName: data.companyName }),
        ...(data.companyAddress !== undefined && { companyAddress: data.companyAddress }),
        ...(data.companyCity !== undefined && { companyCity: data.companyCity }),
        ...(data.companyPhone !== undefined && { companyPhone: data.companyPhone }),
        ...(data.companyEmail !== undefined && { companyEmail: data.companyEmail }),
        ...(data.companyDescription !== undefined && { companyDescription: data.companyDescription }),
        ...(data.repName !== undefined && { repName: data.repName }),
        ...(data.repPhone !== undefined && { repPhone: data.repPhone }),
        ...(data.repEmail !== undefined && { repEmail: data.repEmail }),
        ...(data.mobileMoneyNumber !== undefined && { mobileMoneyNumber: data.mobileMoneyNumber }),
        ...(data.mobileMoneyOperator !== undefined && { mobileMoneyOperator: data.mobileMoneyOperator }),
        ...(data.commissionRate !== undefined && { commissionRate: data.commissionRate }),
        ...(data.adminNotes !== undefined && { adminNotes: data.adminNotes }),
      },
      include: INCLUDE,
    });
    return mapFromPrisma(row);
  }

  async findById(id: string): Promise<Provider | null> {
    const row = await this.prisma.provider.findUnique({ where: { id }, include: INCLUDE });
    return row ? mapFromPrisma(row) : null;
  }

  async findByUserId(userId: string): Promise<Provider | null> {
    const row = await this.prisma.provider.findUnique({ where: { userId }, include: INCLUDE });
    return row ? mapFromPrisma(row) : null;
  }

  async findAll(query: ProviderQuery = {}): Promise<Provider[]> {
    const { limit = 50, offset = 0, status, categoryId, q } = query;
    const where: Prisma.ProviderWhereInput = {};
    if (status) where.status = status;
    if (categoryId) where.categoryId = categoryId;
    if (q) {
      where.OR = [
        { companyName: { contains: q, mode: 'insensitive' } },
        { repName: { contains: q, mode: 'insensitive' } },
        { repPhone: { contains: q, mode: 'insensitive' } },
      ];
    }

    const rows = await this.prisma.provider.findMany({
      where,
      include: INCLUDE,
      skip: offset,
      take: limit,
      orderBy: { createdAt: 'desc' },
    });
    return rows.map(mapFromPrisma);
  }

  async count(filters: Omit<ProviderQuery, 'limit' | 'offset'> = {}): Promise<number> {
    const where: Prisma.ProviderWhereInput = {};
    if (filters.status) where.status = filters.status;
    if (filters.categoryId) where.categoryId = filters.categoryId;
    return this.prisma.provider.count({ where });
  }

  async activate(id: string, commissionRate?: number): Promise<Provider> {
    const provider = await this.prisma.provider.findUnique({ where: { id } });
    if (!provider) throw new Error('Prestataire introuvable');

    const row = await this.prisma.$transaction(async (tx) => {
      const updated = await tx.provider.update({
        where: { id },
        data: {
          status: 'ACTIVE',
          ...(commissionRate !== undefined && { commissionRate }),
        },
        include: INCLUDE,
      });

      await tx.user.update({
        where: { id: provider.userId },
        data: { role: 'PROVIDER' },
      });

      return updated;
    });

    return mapFromPrisma(row);
  }

  async suspend(id: string): Promise<Provider> {
    const row = await this.prisma.provider.update({
      where: { id },
      data: { status: 'SUSPENDED' },
      include: INCLUDE,
    });
    return mapFromPrisma(row);
  }

  async reject(id: string, notes?: string): Promise<Provider> {
    const row = await this.prisma.provider.update({
      where: { id },
      data: {
        status: 'SUSPENDED',
        ...(notes !== undefined && { adminNotes: notes }),
      },
      include: INCLUDE,
    });
    return mapFromPrisma(row);
  }

  async createActivationFee(data: CreateActivationFeeDto): Promise<ProviderActivation> {
    const discountPct = data.discountPct ?? 0;
    const finalAmount = data.baseAmount * (1 - discountPct / 100);
    const row = await this.prisma.providerActivation.create({
      data: {
        providerId: data.providerId,
        baseAmount: data.baseAmount,
        discountPct,
        finalAmount,
        notes: data.notes,
        status: 'PENDING',
      },
    });
    return mapActivationFromPrisma(row);
  }

  async updateActivationFee(activationId: string, data: UpdateActivationFeeDto): Promise<ProviderActivation> {
    const updateData: Prisma.ProviderActivationUpdateInput = {};
    if (data.baseAmount !== undefined) updateData.baseAmount = data.baseAmount;
    if (data.discountPct !== undefined) updateData.discountPct = data.discountPct;
    if (data.notes !== undefined) updateData.notes = data.notes;
    if (data.status !== undefined) updateData.status = data.status;
    if (data.paidAt !== undefined) updateData.paidAt = data.paidAt;

    // Recalculate finalAmount if base or discount changed
    if (data.baseAmount !== undefined || data.discountPct !== undefined) {
      const existing = await this.prisma.providerActivation.findUnique({ where: { id: activationId } });
      if (existing) {
        const base = data.baseAmount ?? existing.baseAmount;
        const discount = data.discountPct ?? existing.discountPct;
        updateData.finalAmount = base * (1 - discount / 100);
      }
    }

    const row = await this.prisma.providerActivation.update({
      where: { id: activationId },
      data: updateData,
    });
    return mapActivationFromPrisma(row);
  }

  async findActivationByProvider(providerId: string): Promise<ProviderActivation | null> {
    const row = await this.prisma.providerActivation.findUnique({ where: { providerId } });
    return row ? mapActivationFromPrisma(row) : null;
  }
}

export class PrismaProviderRepositoryFactory implements IProviderRepositoryFactory {
  create(): IProviderRepository {
    return new PrismaProviderRepository(new PrismaClient());
  }
}

export const providerRepositoryFactory = new PrismaProviderRepositoryFactory();
