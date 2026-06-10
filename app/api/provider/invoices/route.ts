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

// GET /api/provider/invoices - Get invoices for provider
export async function GET() {
  try {
    const session = await requireProvider();
    if (!session) return NextResponse.json({ error: 'Non autorisé' }, { status: 403 });

    const provider = await providerService.getProviderByUserId(session.user.id);
    if (!provider) return NextResponse.json({ error: 'Prestataire introuvable' }, { status: 404 });

    const invoices = await prisma.marketplaceInvoice.findMany({
      where: {
        providerId: provider.id,
      },
      include: {
        order: {
          select: {
            id: true,
            createdAt: true,
            totalAmount: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    // Calculate stats
    const paidInvoices = invoices.filter((inv: typeof invoices[0]) => inv.status === 'PAID');
    const totalRevenue = paidInvoices.reduce((sum: number, inv: typeof invoices[0]) => sum + (inv.totalAmount || 0), 0);

    return NextResponse.json({
      invoices,
      stats: {
        totalInvoices: invoices.length,
        paidInvoices: paidInvoices.length,
        totalRevenue,
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Erreur serveur';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
