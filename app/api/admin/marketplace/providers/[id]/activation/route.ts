import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/core/infrastructure/auth/auth';
import { headers } from 'next/headers';
import { prisma } from '@/lib/prisma';
import { providerService } from '@/features/feature-marketplace/application/services/providerService';
import { ActivationFeeStatus } from '@/features/feature-marketplace/domain/types/marketplace';

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

// GET /api/admin/marketplace/providers/[id]/activation
export async function GET(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await requireAdmin();
    if (!session) return NextResponse.json({ error: 'Non autorisé' }, { status: 403 });

    const { id } = await params;
    const activation = await providerService.getActivationFee(id);
    if (!activation) return NextResponse.json({ error: 'Aucun frais d\'activation défini' }, { status: 404 });
    return NextResponse.json(activation);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Erreur serveur';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// POST /api/admin/marketplace/providers/[id]/activation
// Create or update activation fee
export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await requireAdmin();
    if (!session) return NextResponse.json({ error: 'Non autorisé' }, { status: 403 });

    const { id } = await params;
    const body = await request.json();
    const { baseAmount, discountPct, notes } = body;

    if (typeof baseAmount !== 'number' || baseAmount <= 0) {
      return NextResponse.json({ error: 'Le montant de base doit être un nombre positif' }, { status: 400 });
    }

    const activation = await providerService.setActivationFee({
      providerId: id,
      baseAmount,
      discountPct: discountPct ?? 0,
      notes,
    });

    return NextResponse.json(activation, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Erreur serveur';
    return NextResponse.json({ error: message }, { status: message.includes('introuvable') ? 404 : 500 });
  }
}

// PATCH /api/admin/marketplace/providers/[id]/activation
// Update activation fee status (mark as paid, etc.)
export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await requireAdmin();
    if (!session) return NextResponse.json({ error: 'Non autorisé' }, { status: 403 });

    const { id } = await params;
    const body = await request.json();
    const { status, paidAt, baseAmount, discountPct, notes } = body;

    const activation = await providerService.updateActivationFeeStatus(id, {
      status: status as ActivationFeeStatus | undefined,
      paidAt: paidAt ? new Date(paidAt) : undefined,
      baseAmount,
      discountPct,
      notes,
    });

    return NextResponse.json(activation);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Erreur serveur';
    return NextResponse.json({ error: message }, { status: message.includes('introuvable') ? 404 : 500 });
  }
}
