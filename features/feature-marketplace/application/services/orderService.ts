import { PrismaClient } from "@prisma/client";
import type {
  MarketplaceOrder,
  CreateOrderDto,
  OrderStatus,
} from "@/features/feature-marketplace/domain/types/marketplace";
import { PrismaOrderRepository } from "@/features/feature-marketplace/infrastructure/repositories/orderRepository";

export interface IOrderService {
  createOrder(clientId: string, data: CreateOrderDto): Promise<MarketplaceOrder>;
  getOrderById(id: string): Promise<MarketplaceOrder | null>;
  getClientOrders(clientId: string, limit?: number, offset?: number): Promise<{ orders: MarketplaceOrder[]; total: number }>;
  markOrderPaid(id: string, paymentMethod: string, paymentReference?: string): Promise<MarketplaceOrder>;
  assignOrder(id: string, providerId: string, note?: string): Promise<MarketplaceOrder>;
  listOrders(limit?: number, offset?: number): Promise<{ orders: MarketplaceOrder[]; total: number }>;
}

export class OrderService implements IOrderService {
  private repository: PrismaOrderRepository;
  private prisma: PrismaClient;

  constructor(prisma?: PrismaClient) {
    this.prisma = prisma || new PrismaClient();
    this.repository = new PrismaOrderRepository(this.prisma);
  }

  async createOrder(clientId: string, data: CreateOrderDto): Promise<MarketplaceOrder> {
    try {
      // Récupère tous les produits
      const products = await this.prisma.providerProduct.findMany({
        where: { id: { in: data.items.map((i) => i.productId) } },
      });

      // Calcule le montant total
      let totalAmount = 0;
      for (const item of data.items) {
        const product = products.find((p) => p.id === item.productId);
        if (!product) throw new Error(`Produit ${item.productId} introuvable`);
        totalAmount += product.price * item.quantity;
      }

      // Crée la commande
      const order = await this.repository.createOrder(clientId, data, totalAmount);

      // Crée les factures (client + prestataire)
      await this.createInvoices(order);

      return order;
    } finally {
      await this.repository.dispose();
    }
  }

  async getOrderById(id: string): Promise<MarketplaceOrder | null> {
    try {
      return await this.repository.findById(id);
    } finally {
      await this.repository.dispose();
    }
  }

  async getClientOrders(
    clientId: string,
    limit: number = 50,
    offset: number = 0
  ): Promise<{ orders: MarketplaceOrder[]; total: number }> {
    try {
      return await this.repository.findByClient(clientId, limit, offset);
    } finally {
      await this.repository.dispose();
    }
  }

  async markOrderPaid(id: string, paymentMethod: string, paymentReference?: string): Promise<MarketplaceOrder> {
    try {
      const order = await this.repository.markPaid(id, paymentMethod, paymentReference);

      // Met à jour les factures à PAID
      await this.prisma.marketplaceInvoice.updateMany({
        where: { orderId: id },
        data: { status: "PAID", paidAt: new Date() },
      });

      return order;
    } finally {
      await this.repository.dispose();
    }
  }

  async assignOrder(id: string, providerId: string, note?: string): Promise<MarketplaceOrder> {
    try {
      return await this.repository.assignOrder(id, providerId, note);
    } finally {
      await this.repository.dispose();
    }
  }

  async listOrders(limit: number = 50, offset: number = 0): Promise<{ orders: MarketplaceOrder[]; total: number }> {
    try {
      return await this.repository.list(limit, offset);
    } finally {
      await this.repository.dispose();
    }
  }

  private async createInvoices(order: MarketplaceOrder) {
    // Facture CLIENT
    await this.prisma.marketplaceInvoice.create({
      data: {
        orderId: order.id,
        type: "CLIENT",
        invoiceNumber: `INV-CL-${Date.now()}-${order.id.slice(0, 8)}`,
        totalAmount: order.totalAmount,
        status: "PENDING",
      },
    });

    // Facture PROVIDER (si commande assignée après paiement, sinon laisse en attente)
    // On crée une facture "template" qui sera associée au prestataire à l'assignation
    // Pour maintenant, on crée juste une facture client
  }
}

export const orderService = new OrderService();
