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

// GET /api/admin/marketplace/categories
export async function GET(request: NextRequest) {
  try {
    const session = await requireAdmin();
    if (!session) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const isActiveParam = searchParams.get('isActive');
    const limit = parseInt(searchParams.get('limit') || '100');
    const offset = parseInt(searchParams.get('offset') || '0');

    const result = await categoryService.getAllCategories({
      isActive: isActiveParam !== null ? isActiveParam === 'true' : undefined,
      limit,
      offset,
    });

    return NextResponse.json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Erreur serveur';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// POST /api/admin/marketplace/categories
export async function POST(request: NextRequest) {
  try {
    const session = await requireAdmin();
    if (!session) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 403 });
    }

    const body = await request.json();
    const { name, description, slug, imageUrl, isActive, displayOrder } = body;

    if (!name || typeof name !== 'string' || name.trim().length < 2) {
      return NextResponse.json({ error: 'Le nom est requis (min. 2 caractères)' }, { status: 400 });
    }

    const category = await categoryService.createCategory({
      name: name.trim(),
      description: description?.trim(),
      slug: slug?.trim(),
      imageUrl,
      isActive,
      displayOrder,
    });

    return NextResponse.json(category, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Erreur serveur';
    const status = message.includes('déjà utilisé') ? 409 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
