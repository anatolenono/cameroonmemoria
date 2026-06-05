import {
  providerRepositoryFactory,
  IProviderRepositoryFactory,
} from '../../infrastructure/repositories/providerRepository';
import {
  Provider,
  CreateProviderDto,
  UpdateProviderDto,
  ProviderQuery,
  ProviderActivation,
  CreateActivationFeeDto,
  UpdateActivationFeeDto,
} from '../../domain/types/marketplace';

export class ProviderService {
  private factory: IProviderRepositoryFactory;

  constructor(factory: IProviderRepositoryFactory) {
    this.factory = factory;
  }

  async registerProvider(data: CreateProviderDto, userId: string): Promise<Provider> {
    const repo = this.factory.create();
    try {
      const existing = await repo.findByUserId(userId);
      if (existing) throw new Error('Cet utilisateur est déjà enregistré comme prestataire');
      return await repo.create(data, userId);
    } finally {
      await repo.dispose();
    }
  }

  async updateProvider(id: string, data: UpdateProviderDto): Promise<Provider> {
    const repo = this.factory.create();
    try {
      const provider = await repo.findById(id);
      if (!provider) throw new Error('Prestataire introuvable');
      return await repo.update(id, data);
    } finally {
      await repo.dispose();
    }
  }

  async getProviderById(id: string): Promise<Provider> {
    const repo = this.factory.create();
    try {
      const provider = await repo.findById(id);
      if (!provider) throw new Error('Prestataire introuvable');
      return provider;
    } finally {
      await repo.dispose();
    }
  }

  async getProviderByUserId(userId: string): Promise<Provider | null> {
    const repo = this.factory.create();
    try {
      return await repo.findByUserId(userId);
    } finally {
      await repo.dispose();
    }
  }

  async getAllProviders(query: ProviderQuery = {}): Promise<{
    providers: Provider[];
    total: number;
    limit: number;
    offset: number;
  }> {
    const repo = this.factory.create();
    try {
      const { limit = 50, offset = 0 } = query;
      const [providers, total] = await Promise.all([
        repo.findAll(query),
        repo.count({ status: query.status, categoryId: query.categoryId }),
      ]);
      return { providers, total, limit: Number(limit), offset: Number(offset) };
    } finally {
      await repo.dispose();
    }
  }

  async activateProvider(id: string, commissionRate?: number): Promise<Provider> {
    const repo = this.factory.create();
    try {
      const provider = await repo.findById(id);
      if (!provider) throw new Error('Prestataire introuvable');
      return await repo.activate(id, commissionRate);
    } finally {
      await repo.dispose();
    }
  }

  async suspendProvider(id: string): Promise<Provider> {
    const repo = this.factory.create();
    try {
      const provider = await repo.findById(id);
      if (!provider) throw new Error('Prestataire introuvable');
      return await repo.suspend(id);
    } finally {
      await repo.dispose();
    }
  }

  async rejectProvider(id: string, notes?: string): Promise<Provider> {
    const repo = this.factory.create();
    try {
      const provider = await repo.findById(id);
      if (!provider) throw new Error('Prestataire introuvable');
      return await repo.reject(id, notes);
    } finally {
      await repo.dispose();
    }
  }

  // ── Activation fee ──────────────────────────────────────────────────────────

  async setActivationFee(data: CreateActivationFeeDto): Promise<ProviderActivation> {
    const repo = this.factory.create();
    try {
      const provider = await repo.findById(data.providerId);
      if (!provider) throw new Error('Prestataire introuvable');

      const existing = await repo.findActivationByProvider(data.providerId);
      if (existing) {
        // Update existing activation fee
        return await repo.updateActivationFee(existing.id, {
          baseAmount: data.baseAmount,
          discountPct: data.discountPct,
          notes: data.notes,
        });
      }
      return await repo.createActivationFee(data);
    } finally {
      await repo.dispose();
    }
  }

  async updateActivationFeeStatus(
    providerId: string,
    data: UpdateActivationFeeDto
  ): Promise<ProviderActivation> {
    const repo = this.factory.create();
    try {
      const activation = await repo.findActivationByProvider(providerId);
      if (!activation) throw new Error('Frais d\'activation introuvable');
      return await repo.updateActivationFee(activation.id, data);
    } finally {
      await repo.dispose();
    }
  }

  async getActivationFee(providerId: string): Promise<ProviderActivation | null> {
    const repo = this.factory.create();
    try {
      return await repo.findActivationByProvider(providerId);
    } finally {
      await repo.dispose();
    }
  }
}

export const providerService = new ProviderService(providerRepositoryFactory);
