import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/marketplace/providers/[id]
// Public route - get provider profile and active products
export async function GET(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;

    const provider = await prisma.provider.findUnique({
      where: { id },
      include: {
        category: { select: { id: true, name: true, slug: true } },
        user: { select: { id: true, name: true } },
      },
    });

    if (!provider) return NextResponse.json({ error: 'Prestataire introuvable' }, { status: 404 });

    if (provider.status !== 'ACTIVE') {
      return NextResponse.json({ error: 'Ce prestataire n\'est pas actif' }, { status: 403 });
    }

    const products = await prisma.providerProduct.findMany({
      where: { providerId: id, isActive: true },
      include: {
        category: { select: { id: true, name: true, slug: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({
      provider: {
        id: provider.id,
        userId: provider.userId,
        categoryId: provider.categoryId,
        category: provider.category,
        status: provider.status,
        companyName: provider.companyName,
        companyCity: provider.companyCity,
        companyDescription: provider.companyDescription,
        companyPhone: provider.companyPhone,
        companyEmail: provider.companyEmail,
      },
      products: products.map(p => ({
        id: p.id,
        providerId: p.providerId,
        categoryId: p.categoryId,
        category: p.category,
        name: p.name,
        description: p.description,
        price: p.price,
        currency: p.currency,
        imageUrl: p.imageUrl,
        conditions: p.conditions,
      })),
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Erreur serveur';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
