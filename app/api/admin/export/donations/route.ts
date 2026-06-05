import { NextResponse } from 'next/server';
import { auth } from '@/core/infrastructure/auth/auth';
import { headers } from 'next/headers';
import { prisma } from '@/lib/prisma';

/**
 * GET /api/admin/export/donations
 * Exports donations data in CSV format
 */
export async function GET() {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { role: true },
    });

    if (user?.role !== 'ADMIN' && user?.role !== 'MODERATOR') {
      return NextResponse.json({ error: 'Accès interdit' }, { status: 403 });
    }

    const donations = await prisma.donation.findMany({
      include: {
        transaction: { select: { status: true } },
        announcement: { select: { title: true, deceasedName: true } },
        user: { select: { name: true, email: true } },
      },
      orderBy: { createdAt: 'desc' },
      take: 10000,
    });

    const exportData = donations.map(d => ({
      id: d.id,
      donateur: d.isAnonymous ? 'Anonyme' : (d.user?.name ?? 'Inconnu'),
      email: d.isAnonymous ? '' : (d.user?.email ?? ''),
      montant: d.amount,
      devise: 'XAF',
      annonce: d.announcement.title,
      defunt: d.announcement.deceasedName,
      statut: d.transaction.status,
      anonyme: d.isAnonymous ? 'Oui' : 'Non',
      dateCreation: new Date(d.createdAt).toLocaleString('fr-FR'),
    }));

    const csvRows: string[] = [];

    if (exportData.length > 0) {
      const csvHeaders = Object.keys(exportData[0]);
      csvRows.push(csvHeaders.map(h => `"${h}"`).join(','));

      exportData.forEach(row => {
        const values = Object.values(row).map(value => {
          const stringValue = String(value ?? '');
          return `"${stringValue.replace(/"/g, '""')}"`;
        });
        csvRows.push(values.join(','));
      });
    }

    const csv = '\ufeff' + csvRows.join('\n');

    return new NextResponse(csv, {
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="donations_${new Date().toISOString().split('T')[0]}.csv"`,
      },
    });
  } catch (error) {
    console.error('Erreur lors de l\'export des donations:', error);
    return NextResponse.json(
      { error: 'Erreur lors de l\'export des données' },
      { status: 500 }
    );
  }
}
