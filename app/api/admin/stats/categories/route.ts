import { NextResponse } from 'next/server';
import { auth } from '@/core/infrastructure/auth/auth';
import { headers } from 'next/headers';
import { prisma } from '@/lib/prisma';

/**
 * GET /api/admin/stats/categories
 * Returns announcement distribution by category
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
      select: { role: true }
    });

    if (user?.role !== 'ADMIN' && user?.role !== 'MODERATOR') {
      return NextResponse.json({ error: 'Permissions insuffisantes' }, { status: 403 });
    }

    const [publishedAnnouncements, announcementsByType] = await Promise.all([
      prisma.announcement.count({ where: { status: 'PUBLISHED' } }),
      prisma.announcement.groupBy({
        by: ['type'],
        _count: { id: true },
        where: { status: 'PUBLISHED' }
      })
    ]);

    const topCategories = announcementsByType.map(item => ({
      category: item.type === 'FUNERAL' ? 'Funérailles' :
                item.type === 'ANNIVERSARY' ? 'Anniversaires' :
                item.type === 'THANKS' ? 'Remerciements' : 'Autre',
      count: item._count.id,
      percentage: publishedAnnouncements > 0
        ? Math.round((item._count.id / publishedAnnouncements) * 100)
        : 0
    }));

    return NextResponse.json({ topCategories });

  } catch (error) {
    console.error('Erreur stats categories:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
