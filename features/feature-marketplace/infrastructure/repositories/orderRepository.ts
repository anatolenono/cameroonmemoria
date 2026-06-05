import { PrismaClient } from "@prisma/client";
import type {
  MarketplaceOrder,
  MarketplaceOrderItem,
  MarketplaceInvoice,
  CreateOrderDto,
  OrderStatus,
} from "@/features/feature-marketplace/domain/types/marketplace";
import { OrderStatus as OrderStatusEnum } from "@prisma/client";

export interface IOrderRepository {
  createOrder(
    clientId: string,
    data: CreateOrderDto,
    totalAmount: number
  ): Promise<MarketplaceOrder>;
  updateOrder(id: string, status: OrderStatus): Promise<MarketplaceOrder>;
  findById(id: string): Promise<MarketplaceOrder | null>;
  findByClient(clientId: string, limit?: number, offset?: number): Promise<{ orders: MarketplaceOrder[]; total: number }>;
  assignOrder(id: string, providerId: string, note?: string): Promise<MarketplaceOrder>;
  markPaid(id: string, paymentMethod: string, paymentReference?: string): Promise<MarketplaceOrder>;
  list(limit?: number, offset?: number): Promise<{ orders: MarketplaceOrder[]; total: number }>;
  dispose(): Promise<void>;
}

export class PrismaOrderRepository implements IOrderRepository {
  private prisma: PrismaClient;

  constructor(prisma?: PrismaClient) {
    this.prisma = prisma || new PrismaClient();
  }

  async createOrder(
    clientId: string,
    data: CreateOrderDto,
    totalAmount: number
  ): Promise<MarketplaceOrder> {
    const order = await this.prisma.marketplaceOrder.create({
      data: {
        clientId,
        orderType: data.orderType as any,
        totalAmount,
        currency: "XAF",
        announcementId: data.announcementId,
        deceasedName: data.deceasedName,
        clientInstructions: data.clientInstructions,
        status: OrderStatusEnum.PENDING_PAYMENT,
        items: {
          create: await Promise.all(
            data.items.map(async (item) => {
              const product = await this.prisma.providerProduct.findUnique({
                where: { id: item.productId },
              });
              if (!product) throw new Error(`Product ${item.productId} not found`);

              return {
                productId: item.productId,
                productName: product.name,
                productPrice: product.price,
                quantity: item.quantity,
                subtotal: product.price * item.quantity,
              };
            })
          ),
        },
      },
      include: {
        items: true,
        client: { select: { id: true, name: true, email: true } },
        assignedProvider: { select: { id: true, companyName: true } },
      },
    });

    return this.mapOrder(order);
  }

  async updateOrder(id: string, status: OrderStatus): Promise<MarketplaceOrder> {
    const order = await this.prisma.marketplaceOrder.update({
      where: { id },
      data: { status: status as any },
      include: {
        items: true,
        client: { select: { id: true, name: true, email: true } },
        assignedProvider: { select: { id: true, companyName: true } },
      },
    });

    return this.mapOrder(order);
  }

  async findById(id: string): Promise<MarketplaceOrder | null> {
    const order = await this.prisma.marketplaceOrder.findUnique({
      where: { id },
      include: {
        items: true,
        client: { select: { id: true, name: true, email: true } },
        assignedProvider: { select: { id: true, companyName: true } },
      },
    });

    return order ? this.mapOrder(order) : null;
  }

  async findByClient(
    clientId: string,
    limit: number = 50,
    offset: number = 0
  ): Promise<{ orders: MarketplaceOrder[]; total: number }> {
    const [orders, total] = await Promise.all([
      this.prisma.marketplaceOrder.findMany({
        where: { clientId },
        include: {
          items: true,
          client: { select: { id: true, name: true, email: true } },
          assignedProvider: { select: { id: true, companyName: true } },
        },
        take: limit,
        skip: offset,
        orderBy: { createdAt: "desc" },
      }),
      this.prisma.marketplaceOrder.count({ where: { clientId } }),
    ]);

    return {
      orders: orders.map((order) => this.mapOrder(order)),
      total,
    };
  }

  async assignOrder(id: string, providerId: string, note?: string): Promise<MarketplaceOrder> {
    const order = await this.prisma.marketplaceOrder.update({
      where: { id },
      data: {
        assignedProviderId: providerId,
        assignedAt: new Date(),
        assignmentNote: note,
        status: OrderStatusEnum.ASSIGNED,
      },
      include: {
        items: true,
        client: { select: { id: true, name: true, email: true } },
        assignedProvider: { select: { id: true, companyName: true } },
      },
    });

    return this.mapOrder(order);
  }

  async markPaid(
    id: string,
    paymentMethod: string,
    paymentReference?: string
  ): Promise<MarketplaceOrder> {
    const order = await this.prisma.marketplaceOrder.update({
      where: { id },
      data: {
        status: OrderStatusEnum.PAID,
        paymentMethod,
        paymentReference,
        paidAt: new Date(),
      },
      include: {
        items: true,
        client: { select: { id: true, name: true, email: true } },
        assignedProvider: { select: { id: true, companyName: true } },
      },
    });

    return this.mapOrder(order);
  }

  async list(limit: number = 50, offset: number = 0): Promise<{ orders: MarketplaceOrder[]; total: number }> {
    const [orders, total] = await Promise.all([
      this.prisma.marketplaceOrder.findMany({
        include: {
          items: true,
          client: { select: { id: true, name: true, email: true } },
          assignedProvider: { select: { id: true, companyName: true } },
        },
        take: limit,
        skip: offset,
        orderBy: { createdAt: "desc" },
      }),
      this.prisma.marketplaceOrder.count(),
    ]);

    return {
      orders: orders.map((order) => this.mapOrder(order)),
      total,
    };
  }

  async dispose(): Promise<void> {
    await this.prisma.$disconnect();
  }

  private mapOrder(order: any): MarketplaceOrder {
    return {
      id: order.id,
      clientId: order.clientId,
      client: order.client,
      status: order.status,
      orderType: order.orderType,
      totalAmount: order.totalAmount,
      currency: order.currency,
      paymentMethod: order.paymentMethod,
      paymentReference: order.paymentReference,
      paidAt: order.paidAt,
      announcementId: order.announcementId,
      deceasedName: order.deceasedName,
      clientInstructions: order.clientInstructions,
      assignedProviderId: order.assignedProviderId,
      assignedProvider: order.assignedProvider,
      assignedAt: order.assignedAt,
      assignmentNote: order.assignmentNote,
      createdAt: order.createdAt,
      updatedAt: order.updatedAt,
      items: order.items,
    };
  }
}
