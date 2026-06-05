import {
  productRepositoryFactory,
  IProductRepositoryFactory,
} from '../../infrastructure/repositories/productRepository';
import {
  ProviderProduct,
  CreateProductDto,
  UpdateProductDto,
  ProductQuery,
} from '../../domain/types/marketplace';

export class ProductService {
  private factory: IProductRepositoryFactory;

  constructor(factory: IProductRepositoryFactory) {
    this.factory = factory;
  }

  async createProduct(data: CreateProductDto, providerId: string): Promise<ProviderProduct> {
    const repo = this.factory.create();
    try {
      return await repo.create(data, providerId);
    } finally {
      await repo.dispose();
    }
  }

  async updateProduct(
    id: string,
    providerId: string,
    data: UpdateProductDto
  ): Promise<ProviderProduct> {
    const repo = this.factory.create();
    try {
      const product = await repo.findById(id);
      if (!product) throw new Error('Produit introuvable');
      if (product.providerId !== providerId) throw new Error('Non autorisé');
      return await repo.update(id, data);
    } finally {
      await repo.dispose();
    }
  }

  async deleteProduct(id: string, providerId: string): Promise<void> {
    const repo = this.factory.create();
    try {
      const product = await repo.findById(id);
      if (!product) throw new Error('Produit introuvable');
      if (product.providerId !== providerId) throw new Error('Non autorisé');
      await repo.delete(id);
    } finally {
      await repo.dispose();
    }
  }

  async getProductById(id: string): Promise<ProviderProduct> {
    const repo = this.factory.create();
    try {
      const product = await repo.findById(id);
      if (!product) throw new Error('Produit introuvable');
      return product;
    } finally {
      await repo.dispose();
    }
  }

  async getProductsByProvider(providerId: string, query: ProductQuery = {}): Promise<{
    products: ProviderProduct[];
    total: number;
    limit: number;
    offset: number;
  }> {
    const repo = this.factory.create();
    try {
      const { limit = 50, offset = 0 } = query;
      const [products, total] = await Promise.all([
        repo.findByProvider(providerId, query),
        repo.count(providerId, { isActive: query.isActive, categoryId: query.categoryId }),
      ]);
      return { products, total, limit: Number(limit), offset: Number(offset) };
    } finally {
      await repo.dispose();
    }
  }

  async getPublicProductsByProvider(providerId: string): Promise<ProviderProduct[]> {
    const repo = this.factory.create();
    try {
      return await repo.findByProvider(providerId, { isActive: true });
    } finally {
      await repo.dispose();
    }
  }
}

export const productService = new ProductService(productRepositoryFactory);
