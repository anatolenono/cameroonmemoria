import { NextResponse } from 'next/server';
import { auth } from '@/core/infrastructure/auth/auth';
import { headers } from 'next/headers';
import { orderService } from '@/features/feature-marketplace/application/services/orderService';

// GET /api/marketplace/orders/[id]
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session) return NextResponse.json({ error: 'Non connecté' }, { status: 403 });

    const { id } = await params;
    const order = await orderService.getOrderById(id);

    if (!order) return NextResponse.json({ error: 'Commande introuvable' }, { status: 404 });

    // Vérifier que l'utilisateur est le client ou un admin
    if (order.clientId !== session.user.id) {
      return NextResponse.json({ error: 'Accès non autorisé' }, { status: 403 });
    }

    return NextResponse.json(order);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Erreur serveur';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
