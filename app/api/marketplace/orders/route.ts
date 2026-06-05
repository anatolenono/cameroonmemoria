import { NextResponse } from 'next/server';
import { auth } from '@/core/infrastructure/auth/auth';
import { headers } from 'next/headers';
import { orderService } from '@/features/feature-marketplace/application/services/orderService';
import { AnnouncementAdminService } from '@/features/feature-announcement/application/services/announcementAdminService';
import { OrderType } from '@/features/feature-marketplace/domain/types/marketplace';
import { prisma } from '@/lib/prisma';

// GET /api/marketplace/orders - Mes commandes
export async function GET() {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session) return NextResponse.json({ error: 'Non connecté' }, { status: 403 });

    const { orders, total } = await orderService.getClientOrders(session.user.id);

    return NextResponse.json({
      orders,
      total,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Erreur serveur';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// POST /api/marketplace/orders - Créer une commande
export async function POST(request: Request) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session) return NextResponse.json({ error: 'Non connecté' }, { status: 403 });

    const body = await request.json();
    const { orderType, announcementId, deceasedName, clientInstructions, items } = body;

    if (!orderType || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { error: 'Données invalides: orderType et items requis' },
        { status: 400 }
      );
    }

    if (!items.every(
      (i: Record<string, unknown>) =>
        i.productId &&
        typeof i.quantity === 'number' &&
        i.quantity > 0
    )) {
      return NextResponse.json(
        { error: 'Chaque item doit avoir productId et quantity > 0' },
        { status: 400 }
      );
    }

    // Verify permission if announcementId is provided
    if (announcementId) {
      const adminService = new AnnouncementAdminService(prisma);
      const canPay = await adminService.canPayForAnnouncement(announcementId, session.user.id);
      if (!canPay) {
        return NextResponse.json(
          { error: 'Vous n\'avez pas la permission de payer pour cette annonce' },
          { status: 403 }
        );
      }
    }

    const order = await orderService.createOrder(session.user.id, {
      orderType: orderType as OrderType,
      announcementId,
      deceasedName,
      clientInstructions,
      items,
    });

    return NextResponse.json(order, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Erreur serveur';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
