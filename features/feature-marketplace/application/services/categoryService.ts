import {
  categoryRepositoryFactory,
  ICategoryRepositoryFactory,
} from '../../infrastructure/repositories/categoryRepository';
import {
  MarketplaceCategory,
  CreateCategoryDto,
  UpdateCategoryDto,
  CategoryQuery,
} from '../../domain/types/marketplace';

export class CategoryService {
  private factory: ICategoryRepositoryFactory;

  constructor(factory: ICategoryRepositoryFactory) {
    this.factory = factory;
  }

  async createCategory(data: CreateCategoryDto): Promise<MarketplaceCategory> {
    const repo = this.factory.create();
    try {
      if (data.slug) {
        const existing = await repo.findBySlug(data.slug);
        if (existing) throw new Error(`Le slug "${data.slug}" est déjà utilisé`);
      }
      return await repo.create(data);
    } finally {
      await repo.dispose();
    }
  }

  async updateCategory(id: string, data: UpdateCategoryDto): Promise<MarketplaceCategory> {
    const repo = this.factory.create();
    try {
      const category = await repo.findById(id);
      if (!category) throw new Error('Catégorie introuvable');

      if (data.slug && data.slug !== category.slug) {
        const existing = await repo.findBySlug(data.slug);
        if (existing) throw new Error(`Le slug "${data.slug}" est déjà utilisé`);
      }
      return await repo.update(id, data);
    } finally {
      await repo.dispose();
    }
  }

  async deleteCategory(id: string): Promise<void> {
    const repo = this.factory.create();
    try {
      const category = await repo.findById(id);
      if (!category) throw new Error('Catégorie introuvable');
      if (category._count && (category._count.providers > 0 || category._count.products > 0)) {
        throw new Error('Impossible de supprimer une catégorie liée à des prestataires ou produits');
      }
      await repo.delete(id);
    } finally {
      await repo.dispose();
    }
  }

  async getCategoryById(id: string): Promise<MarketplaceCategory> {
    const repo = this.factory.create();
    try {
      const category = await repo.findById(id);
      if (!category) throw new Error('Catégorie introuvable');
      return category;
    } finally {
      await repo.dispose();
    }
  }

  async getAllCategories(query: CategoryQuery = {}): Promise<{
    categories: MarketplaceCategory[];
    total: number;
    limit: number;
    offset: number;
  }> {
    const repo = this.factory.create();
    try {
      const { limit = 100, offset = 0 } = query;
      const [categories, total] = await Promise.all([
        repo.findAll(query),
        repo.count({ isActive: query.isActive }),
      ]);
      return { categories, total, limit: Number(limit), offset: Number(offset) };
    } finally {
      await repo.dispose();
    }
  }
}

export const categoryService = new CategoryService(categoryRepositoryFactory);
