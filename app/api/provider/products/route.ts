import { NextRequest, NextResponse } from 'next/server';
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

// GET /api/provider/products
export async function GET(request: NextRequest) {
  try {
    const session = await requireProvider();
    if (!session) return NextResponse.json({ error: 'Non autorisé' }, { status: 403 });

    const provider = await providerService.getProviderByUserId(session.user.id);
    if (!provider) return NextResponse.json({ error: 'Prestataire introuvable' }, { status: 404 });

    const searchParams = request.nextUrl.searchParams;
    const limit = Number(searchParams.get('limit')) || 50;
    const offset = Number(searchParams.get('offset')) || 0;
    const isActive = searchParams.get('isActive') === 'true' ? true : searchParams.get('isActive') === 'false' ? false : undefined;

    const result = await productService.getProductsByProvider(provider.id, {
      limit,
      offset,
      isActive,
    });

    return NextResponse.json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Erreur serveur';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// POST /api/provider/products
export async function POST(request: NextRequest) {
  try {
    const session = await requireProvider();
    if (!session) return NextResponse.json({ error: 'Non autorisé' }, { status: 403 });

    const provider = await providerService.getProviderByUserId(session.user.id);
    if (!provider) return NextResponse.json({ error: 'Prestataire introuvable' }, { status: 404 });

    const body = await request.json();
    const { categoryId, name, description, price, currency, imageUrl, conditions, isActive } = body;

    if (!categoryId || !name || price === undefined) {
      return NextResponse.json(
        { error: 'categoryId, name et price sont requis' },
        { status: 400 }
      );
    }

    if (typeof price !== 'number' || price <= 0) {
      return NextResponse.json({ error: 'price doit être un nombre positif' }, { status: 400 });
    }

    const product = await productService.createProduct(
      {
        categoryId,
        name,
        description,
        price,
        currency,
        imageUrl,
        conditions,
        isActive,
      },
      provider.id
    );

    return NextResponse.json(product, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Erreur serveur';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
