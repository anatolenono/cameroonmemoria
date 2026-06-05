import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/core/infrastructure/auth/auth';
import { headers } from 'next/headers';
import { announcementService } from '@/features/feature-announcement/application/services/announcementService';
import { AnnouncementStatus, AnnouncementType } from '@/features/feature-announcement/domain/types/announcement';

/**
 * GET /api/admin/export/announcements
 * Exports announcements data in CSV format
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
    const status = searchParams.get('status') as AnnouncementStatus | null;
    const type = searchParams.get('type');
    const dateFrom = searchParams.get('dateFrom');
    const dateTo = searchParams.get('dateTo');

    // Fetch all announcements (no pagination for export)
    const announcements = await announcementService.getAllAnnouncements({
      status: status || undefined,
      type: type ? [type as AnnouncementType] : undefined,
      dateFrom: dateFrom || undefined,
      dateTo: dateTo || undefined,
      limit: 10000, // Large limit for export
    });

    // Transform data for CSV export
    const exportData = announcements.announcements.map(announcement => ({
      id: announcement.id,
      titre: announcement.title,
      type: announcement.type,
      statut: announcement.status,
      nomDefunt: announcement.deceasedName,
      pronomDefunt: announcement.deceasedPronoun || '',
      dateNaissance: announcement.deceasedBirthDate
        ? new Date(announcement.deceasedBirthDate).toLocaleDateString('fr-FR')
        : '',
      lieuNaissance: announcement.deceasedBirthPlace || '',
      dateDeces: new Date(announcement.deceasedDeathDate).toLocaleDateString('fr-FR'),
      dateCeremonie: announcement.ceremonyDate
        ? new Date(announcement.ceremonyDate).toLocaleDateString('fr-FR')
        : '',
      lieuCeremonie: announcement.ceremonyLocation || '',
      relation: announcement.relationship || '',
      anonyme: announcement.isAnonymous ? 'Oui' : 'Non',
      utilisateurId: announcement.userId || '',
      dateCreation: new Date(announcement.createdAt).toLocaleString('fr-FR'),
      dateMiseAJour: new Date(announcement.updatedAt).toLocaleString('fr-FR'),
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
        'Content-Disposition': `attachment; filename="annonces_${new Date().toISOString().split('T')[0]}.csv"`,
      },
    });

  } catch (error) {
    console.error('Erreur lors de l\'export des annonces:', error);
    return NextResponse.json(
      { error: 'Erreur lors de l\'export des données' },
      { status: 500 }
    );
  }
}
