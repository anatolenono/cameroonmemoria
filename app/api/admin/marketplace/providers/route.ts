import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/core/infrastructure/auth/auth';
import { headers } from 'next/headers';
import { prisma } from '@/lib/prisma';
import { providerService } from '@/features/feature-marketplace/application/services/providerService';
import { ProviderStatus } from '@/features/feature-marketplace/domain/types/marketplace';

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

// GET /api/admin/marketplace/providers
export async function GET(request: NextRequest) {
  try {
    const session = await requireAdmin();
    if (!session) return NextResponse.json({ error: 'Non autorisé' }, { status: 403 });

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') as ProviderStatus | null;
    const categoryId = searchParams.get('categoryId') || undefined;
    const q = searchParams.get('q') || undefined;
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    const result = await providerService.getAllProviders({
      status: status ?? undefined,
      categoryId,
      q,
      limit,
      offset,
    });

    return NextResponse.json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Erreur serveur';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
