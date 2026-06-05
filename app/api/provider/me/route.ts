import { NextResponse } from 'next/server';
import { auth } from '@/core/infrastructure/auth/auth';
import { headers } from 'next/headers';
import { prisma } from '@/lib/prisma';
import { providerService } from '@/features/feature-marketplace/application/services/providerService';
import { productService } from '@/features/feature-marketplace/application/services/productService';

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

// GET /api/provider/me
export async function GET() {
  try {
    const session = await requireProvider();
    if (!session) return NextResponse.json({ error: 'Non connecté ou non prestataire' }, { status: 403 });

    const provider = await providerService.getProviderByUserId(session.user.id);
    if (!provider) return NextResponse.json({ error: 'Prestataire introuvable' }, { status: 404 });

    const { products } = await productService.getProductsByProvider(provider.id, { limit: 1000 });
    const activeProducts = products.filter(p => p.isActive).length;

    return NextResponse.json({
      provider,
      stats: {
        activeProducts,
        totalProducts: products.length,
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Erreur serveur';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
