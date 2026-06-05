// ── Enums ──────────────────────────────────────────────────────────────────────

export enum ProviderStatus {
  PENDING = "PENDING",
  ACTIVE = "ACTIVE",
  SUSPENDED = "SUSPENDED",
}

export enum ActivationFeeStatus {
  PENDING = "PENDING",
  PAID = "PAID",
}

export enum OrderStatus {
  PENDING_PAYMENT = "PENDING_PAYMENT",
  PAID = "PAID",
  ASSIGNED = "ASSIGNED",
  IN_PROGRESS = "IN_PROGRESS",
  DELIVERED = "DELIVERED",
  CANCELLED = "CANCELLED",
  REFUNDED = "REFUNDED",
}

export enum OrderType {
  RECENT_DEATH = "RECENT_DEATH",
  COMMEMORATION = "COMMEMORATION",
}

export enum MarketplaceInvoiceType {
  CLIENT = "CLIENT",
  PROVIDER = "PROVIDER",
}

export enum MarketplaceInvoiceStatus {
  PENDING = "PENDING",
  PAID = "PAID",
}

// ── Category ───────────────────────────────────────────────────────────────────

export interface MarketplaceCategory {
  id: string;
  name: string;
  description?: string | null;
  slug: string;
  imageUrl?: string | null;
  isActive: boolean;
  displayOrder: number;
  createdAt: Date;
  updatedAt: Date;
  _count?: { providers: number; products: number };
}

export interface CreateCategoryDto {
  name: string;
  description?: string;
  slug?: string;
  imageUrl?: string;
  isActive?: boolean;
  displayOrder?: number;
}

export interface UpdateCategoryDto {
  name?: string;
  description?: string;
  slug?: string;
  imageUrl?: string;
  isActive?: boolean;
  displayOrder?: number;
}

export interface CategoryQuery {
  isActive?: boolean;
  limit?: number;
  offset?: number;
}

// ── Provider ───────────────────────────────────────────────────────────────────

export interface Provider {
  id: string;
  userId: string;
  categoryId: string;
  category?: Pick<MarketplaceCategory, "id" | "name" | "slug">;
  status: ProviderStatus;
  companyName: string;
  companyAddress?: string | null;
  companyCity?: string | null;
  companyPhone?: string | null;
  companyEmail?: string | null;
  companyDescription?: string | null;
  repName: string;
  repPhone: string;
  repEmail?: string | null;
  mobileMoneyNumber?: string | null;
  mobileMoneyOperator?: string | null;
  commissionRate: number;
  adminNotes?: string | null;
  createdAt: Date;
  updatedAt: Date;
  activation?: ProviderActivation | null;
  user?: { id: string; name?: string | null; email: string } | null;
}

export interface CreateProviderDto {
  categoryId: string;
  companyName: string;
  companyAddress?: string;
  companyCity?: string;
  companyPhone?: string;
  companyEmail?: string;
  companyDescription?: string;
  repName: string;
  repPhone: string;
  repEmail?: string;
  mobileMoneyNumber?: string;
  mobileMoneyOperator?: string;
}

export interface UpdateProviderDto {
  categoryId?: string;
  companyName?: string;
  companyAddress?: string;
  companyCity?: string;
  companyPhone?: string;
  companyEmail?: string;
  companyDescription?: string;
  repName?: string;
  repPhone?: string;
  repEmail?: string;
  mobileMoneyNumber?: string;
  mobileMoneyOperator?: string;
  commissionRate?: number;
  adminNotes?: string;
}

export interface ProviderQuery {
  status?: ProviderStatus;
  categoryId?: string;
  limit?: number;
  offset?: number;
  q?: string;
}

// ── ProviderActivation ─────────────────────────────────────────────────────────

export interface ProviderActivation {
  id: string;
  providerId: string;
  baseAmount: number;
  discountPct: number;
  finalAmount: number;
  status: ActivationFeeStatus;
  paidAt?: Date | null;
  notes?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateActivationFeeDto {
  providerId: string;
  baseAmount: number;
  discountPct?: number;
  notes?: string;
}

export interface UpdateActivationFeeDto {
  baseAmount?: number;
  discountPct?: number;
  status?: ActivationFeeStatus;
  paidAt?: Date;
  notes?: string;
}

// ── ProviderProduct ────────────────────────────────────────────────────────────

export interface ProviderProduct {
  id: string;
  providerId: string;
  categoryId: string;
  category?: Pick<MarketplaceCategory, "id" | "name" | "slug">;
  name: string;
  description?: string | null;
  price: number;
  currency: string;
  imageUrl?: string | null;
  conditions?: string | null;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateProductDto {
  categoryId: string;
  name: string;
  description?: string;
  price: number;
  currency?: string;
  imageUrl?: string;
  conditions?: string;
  isActive?: boolean;
}

export interface UpdateProductDto {
  categoryId?: string;
  name?: string;
  description?: string;
  price?: number;
  currency?: string;
  imageUrl?: string;
  conditions?: string;
  isActive?: boolean;
}

export interface ProductQuery {
  categoryId?: string;
  isActive?: boolean;
  limit?: number;
  offset?: number;
}

// ── MarketplaceOrder ───────────────────────────────────────────────────────────

export interface MarketplaceOrder {
  id: string;
  clientId: string;
  client?: { id: string; name?: string | null; email: string } | null;
  status: OrderStatus;
  orderType: OrderType;
  totalAmount: number;
  currency: string;
  paymentMethod?: string | null;
  paymentReference?: string | null;
  paidAt?: Date | null;
  announcementId?: string | null;
  deceasedName?: string | null;
  clientInstructions?: string | null;
  assignedProviderId?: string | null;
  assignedProvider?: Pick<Provider, "id" | "companyName"> | null;
  assignedAt?: Date | null;
  assignmentNote?: string | null;
  createdAt: Date;
  updatedAt: Date;
  items?: MarketplaceOrderItem[];
}

export interface CreateOrderDto {
  orderType: OrderType;
  announcementId?: string;
  deceasedName?: string;
  clientInstructions?: string;
  items: Array<{
    productId: string;
    quantity: number;
  }>;
}

export interface UpdateOrderDto {
  status?: OrderStatus;
  paymentMethod?: string;
  paymentReference?: string;
  paidAt?: Date;
  assignedProviderId?: string;
  assignmentNote?: string;
}

export interface MarketplaceOrderItem {
  id: string;
  orderId: string;
  productId: string;
  productName: string;
  productPrice: number;
  quantity: number;
  subtotal: number;
  createdAt: Date;
}

// ── MarketplaceInvoice ─────────────────────────────────────────────────────────

export interface MarketplaceInvoice {
  id: string;
  orderId: string;
  providerId?: string | null;
  type: MarketplaceInvoiceType;
  invoiceNumber: string;
  totalAmount: number;
  commissionAmount?: number | null;
  providerAmount?: number | null;
  status: MarketplaceInvoiceStatus;
  paidAt?: Date | null;
  pdfUrl?: string | null;
  issuedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}
