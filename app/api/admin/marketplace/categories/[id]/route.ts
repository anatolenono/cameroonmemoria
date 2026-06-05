import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/core/infrastructure/auth/auth';
import { headers } from 'next/headers';
import { prisma } from '@/lib/prisma';
import { categoryService } from '@/features/feature-marketplace/application/services/categoryService';

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

// GET /api/admin/marketplace/categories/[id]
export async function GET(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await requireAdmin();
    if (!session) return NextResponse.json({ error: 'Non autorisé' }, { status: 403 });

    const { id } = await params;
    const category = await categoryService.getCategoryById(id);
    return NextResponse.json(category);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Erreur serveur';
    const status = message.includes('introuvable') ? 404 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}

// PATCH /api/admin/marketplace/categories/[id]
export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await requireAdmin();
    if (!session) return NextResponse.json({ error: 'Non autorisé' }, { status: 403 });

    const { id } = await params;
    const body = await request.json();
    const { name, description, slug, imageUrl, isActive, displayOrder } = body;

    const category = await categoryService.updateCategory(id, {
      name: name?.trim(),
      description: description?.trim(),
      slug: slug?.trim(),
      imageUrl,
      isActive,
      displayOrder,
    });

    return NextResponse.json(category);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Erreur serveur';
    const status = message.includes('introuvable') ? 404 : message.includes('déjà utilisé') ? 409 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}

// DELETE /api/admin/marketplace/categories/[id]
export async function DELETE(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await requireAdmin();
    if (!session) return NextResponse.json({ error: 'Non autorisé' }, { status: 403 });

    const { id } = await params;
    await categoryService.deleteCategory(id);
    return NextResponse.json({ success: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Erreur serveur';
    const status = message.includes('introuvable') ? 404 : message.includes('Impossible') ? 409 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
