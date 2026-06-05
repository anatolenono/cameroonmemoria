import { NextResponse } from 'next/server';
import { auth } from '@/core/infrastructure/auth/auth';
import { headers } from 'next/headers';
import { prisma } from '@/lib/prisma';
import { orderService } from '@/features/feature-marketplace/application/services/orderService';

async function requireAdmin() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return null;
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { role: true },
  });
  if (user?.role !== 'ADMIN') return null;
  return session;
}

// PATCH /api/admin/marketplace/orders/[id]
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireAdmin();
    if (!session) return NextResponse.json({ error: 'Non autorisé' }, { status: 403 });

    const { id } = await params;
    const body = await request.json();
    const { action, providerId, note, paymentMethod, paymentReference } = body;

    const order = await orderService.getOrderById(id);
    if (!order) return NextResponse.json({ error: 'Commande introuvable' }, { status: 404 });

    let updated = order;

    // Assigner à un prestataire
    if (action === 'assign' && providerId) {
      // Vérifier que le prestataire existe
      const provider = await prisma.provider.findUnique({
        where: { id: providerId },
      });
      if (!provider) {
        return NextResponse.json({ error: 'Prestataire introuvable' }, { status: 404 });
      }

      updated = await orderService.assignOrder(id, providerId, note);

      // Créer une facture pour le prestataire
      const commissionRate = provider.commissionRate || 10;
      const commissionAmount = (updated.totalAmount * commissionRate) / 100;
      const providerAmount = updated.totalAmount - commissionAmount;

      await prisma.marketplaceInvoice.create({
        data: {
          orderId: id,
          providerId,
          type: 'PROVIDER',
          invoiceNumber: `INV-PR-${Date.now()}-${id.slice(0, 8)}`,
          totalAmount: updated.totalAmount,
          commissionAmount,
          providerAmount,
          status: 'PENDING',
        },
      });
    }

    // Marquer comme payée
    if (action === 'mark_paid' && paymentMethod) {
      updated = await orderService.markOrderPaid(id, paymentMethod, paymentReference);
    }

    return NextResponse.json(updated);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Erreur serveur';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
