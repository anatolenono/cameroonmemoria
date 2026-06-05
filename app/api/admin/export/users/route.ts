import { NextResponse } from 'next/server';
import { auth } from '@/core/infrastructure/auth/auth';
import { headers } from 'next/headers';
import { prisma } from '@/lib/prisma';

/**
 * GET /api/admin/export/users
 * Exports users data in CSV format
 */
export async function GET() {
  try {
    // Verify admin authentication
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

    // Fetch all users
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        phoneNumber: true,
        role: true,
        status: true,
        emailVerified: true,
        createdAt: true,
        updatedAt: true,
        _count: {
          select: {
            announcements: true,
            condolences: true,
            donations: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    // Transform data for CSV export
    const exportData = users.map(user => ({
      id: user.id,
      email: user.email,
      nom: user.name || '',
      telephone: user.phoneNumber || '',
      role: user.role,
      statut: user.status,
      emailVerifie: user.emailVerified ? 'Oui' : 'Non',
      nombreAnnonces: user._count.announcements,
      nombreCondoleances: user._count.condolences,
      nombreDonations: user._count.donations,
      dateInscription: new Date(user.createdAt).toLocaleString('fr-FR'),
      dateMiseAJour: new Date(user.updatedAt).toLocaleString('fr-FR'),
    }));

    // Convert to CSV
    const csvRows: string[] = [];

    // Headers
    if (exportData.length > 0) {
      const headers = Object.keys(exportData[0]);
      csvRows.push(headers.map(h => `"${h}"`).join(','));

      // Data rows
      exportData.forEach(row => {
        const values = Object.values(row).map(value => {
          const stringValue = String(value || '');
          // Escape quotes and wrap in quotes
          return `"${stringValue.replace(/"/g, '""')}"`;
        });
        csvRows.push(values.join(','));
      });
    }

    const csv = '\ufeff' + csvRows.join('\n'); // BOM for Excel UTF-8 support

    // Return CSV file
    return new NextResponse(csv, {
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="utilisateurs_${new Date().toISOString().split('T')[0]}.csv"`,
      },
    });

  } catch (error) {
    console.error('Erreur lors de l\'export des utilisateurs:', error);
    return NextResponse.json(
      { error: 'Erreur lors de l\'export des données' },
      { status: 500 }
    );
  }
}
