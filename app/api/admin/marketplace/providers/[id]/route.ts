import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/core/infrastructure/auth/auth';
import { headers } from 'next/headers';
import { prisma } from '@/lib/prisma';
import { providerService } from '@/features/feature-marketplace/application/services/providerService';

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

// GET /api/admin/marketplace/providers/[id]
export async function GET(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await requireAdmin();
    if (!session) return NextResponse.json({ error: 'Non autorisé' }, { status: 403 });

    const { id } = await params;
    const provider = await providerService.getProviderById(id);
    return NextResponse.json(provider);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Erreur serveur';
    return NextResponse.json({ error: message }, { status: message.includes('introuvable') ? 404 : 500 });
  }
}

// PATCH /api/admin/marketplace/providers/[id]
// Body: { action: 'activate' | 'suspend' | 'reject', commissionRate?, notes?, ...updateFields }
export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await requireAdmin();
    if (!session) return NextResponse.json({ error: 'Non autorisé' }, { status: 403 });

    const { id } = await params;
    const body = await request.json();
    const { action, commissionRate, notes, ...updateFields } = body;

    let provider;

    if (action === 'activate') {
      provider = await providerService.activateProvider(id, commissionRate);
    } else if (action === 'suspend') {
      provider = await providerService.suspendProvider(id);
    } else if (action === 'reject') {
      provider = await providerService.rejectProvider(id, notes);
    } else {
      // Generic field update (commissionRate, adminNotes, etc.)
      provider = await providerService.updateProvider(id, { commissionRate, adminNotes: notes, ...updateFields });
    }

    return NextResponse.json(provider);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Erreur serveur';
    return NextResponse.json({ error: message }, { status: message.includes('introuvable') ? 404 : 500 });
  }
}
