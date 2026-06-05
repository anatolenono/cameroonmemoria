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

// GET /api/provider/products/[id]
export async function GET(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await requireProvider();
    if (!session) return NextResponse.json({ error: 'Non autorisé' }, { status: 403 });

    const { id } = await params;
    const product = await productService.getProductById(id);

    const provider = await providerService.getProviderByUserId(session.user.id);
    if (!provider || product.providerId !== provider.id) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 403 });
    }

    return NextResponse.json(product);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Erreur serveur';
    return NextResponse.json(
      { error: message },
      { status: message.includes('introuvable') ? 404 : 500 }
    );
  }
}

// PATCH /api/provider/products/[id]
export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await requireProvider();
    if (!session) return NextResponse.json({ error: 'Non autorisé' }, { status: 403 });

    const { id } = await params;
    const body = await request.json();

    const provider = await providerService.getProviderByUserId(session.user.id);
    if (!provider) return NextResponse.json({ error: 'Prestataire introuvable' }, { status: 404 });

    const product = await productService.updateProduct(id, provider.id, body);
    return NextResponse.json(product);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Erreur serveur';
    return NextResponse.json(
      { error: message },
      { status: message.includes('introuvable') ? 404 : message.includes('Non autorisé') ? 403 : 500 }
    );
  }
}

// DELETE /api/provider/products/[id]
export async function DELETE(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await requireProvider();
    if (!session) return NextResponse.json({ error: 'Non autorisé' }, { status: 403 });

    const { id } = await params;
    const provider = await providerService.getProviderByUserId(session.user.id);
    if (!provider) return NextResponse.json({ error: 'Prestataire introuvable' }, { status: 404 });

    await productService.deleteProduct(id, provider.id);
    return NextResponse.json({ success: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Erreur serveur';
    return NextResponse.json(
      { error: message },
      { status: message.includes('introuvable') ? 404 : message.includes('Non autorisé') ? 403 : 500 }
    );
  }
}
