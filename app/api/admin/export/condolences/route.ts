import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/core/infrastructure/auth/auth';
import { headers } from 'next/headers';
import { condolenceService } from '@/features/feature-condolence/application/services/condolenceService';

/**
 * GET /api/admin/export/condolences
 * Exports condolences data in CSV format
 */
export async function GET(req: NextRequest) {
  try {
    // Verify admin authentication
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
    }

    // Get query parameters for filtering
    const searchParams = req.nextUrl.searchParams;
    const approved = searchParams.get('approved');
    const announcementId = searchParams.get('announcementId');

    // Fetch all condolences (no pagination for export)
    const condolences = await condolenceService.getAllCondolences({
      isApproved: approved === 'true' ? true : approved === 'false' ? false : undefined,
      announcementId: announcementId || undefined,
      limit: 10000, // Large limit for export
    });

    // Transform data for CSV export
    const exportData = condolences.condolences.map(condolence => ({
      id: condolence.id,
      message: condolence.message.replace(/\n/g, ' ').substring(0, 500), // Truncate long messages
      approuve: condolence.isApproved ? 'Oui' : 'Non',
      anonyme: condolence.isAnonymous ? 'Oui' : 'Non',
      utilisateurId: condolence.userId,
      annonceId: condolence.announcementId,
      dateCreation: new Date(condolence.createdAt).toLocaleString('fr-FR'),
      dateMiseAJour: new Date(condolence.updatedAt).toLocaleString('fr-FR'),
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
        'Content-Disposition': `attachment; filename="condoleances_${new Date().toISOString().split('T')[0]}.csv"`,
      },
    });

  } catch (error) {
    console.error('Erreur lors de l\'export des condoléances:', error);
    return NextResponse.json(
      { error: 'Erreur lors de l\'export des données' },
      { status: 500 }
    );
  }
}
