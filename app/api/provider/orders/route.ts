import { NextResponse } from 'next/server';
import { auth } from '@/core/infrastructure/auth/auth';
import { headers } from 'next/headers';
import { prisma } from '@/lib/prisma';
import { providerService } from '@/features/feature-marketplace/application/services/providerService';

async function requireProvider() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return null;
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { role: true },
  });
  if (user?.role !== 'PROVIDER') return null;
  return session;
}

// GET /api/provider/orders - Get orders assigned to provider
export async function GET() {
  try {
    const session = await requireProvider();
    if (!session) return NextResponse.json({ error: 'Non autorisé' }, { status: 403 });

    const provider = await providerService.getProviderByUserId(session.user.id);
    if (!provider) return NextResponse.json({ error: 'Prestataire introuvable' }, { status: 404 });

    const orders = await prisma.marketplaceOrder.findMany({
      where: {
        assignedProviderId: provider.id,
      },
      include: {
        items: {
          include: {
            product: {
              select: { name: true, price: true },
            },
          },
        },
        invoices: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({
      orders,
      total: orders.length,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Erreur serveur';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
