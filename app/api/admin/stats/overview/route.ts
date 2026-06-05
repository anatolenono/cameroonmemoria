import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/core/infrastructure/auth/auth';
import { headers } from 'next/headers';
import { prisma } from '@/lib/prisma';

/**
 * GET /api/admin/stats/overview
 * Returns overview statistics with growth metrics
 */
export async function GET(req: NextRequest) {
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

    const searchParams = req.nextUrl.searchParams;
    const period = searchParams.get('period') || '30d';
    const periodDays = period === '7d' ? 7 : period === '90d' ? 90 : period === '1y' ? 365 : 30;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const startOfPeriod = new Date();
    startOfPeriod.setDate(startOfPeriod.getDate() - periodDays);
    startOfPeriod.setHours(0, 0, 0, 0);

    const previousPeriodStart = new Date();
    previousPeriodStart.setDate(previousPeriodStart.getDate() - (periodDays * 2));
    previousPeriodStart.setHours(0, 0, 0, 0);

    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    weekAgo.setHours(0, 0, 0, 0);

    const [
      totalUsers,
      totalAnnouncements,
      totalCondolences,
      currentPeriodUsers,
      previousPeriodUsers,
      currentPeriodAnnouncements,
      previousPeriodAnnouncements,
      currentPeriodCondolences,
      previousPeriodCondolences,
      activeUsersMonth,
      todaySubmissions,
      thisWeekUsers
    ] = await Promise.all([
      prisma.user.count(),
      prisma.announcement.count(),
      prisma.condolence.count(),
      prisma.user.count({ where: { createdAt: { gte: startOfPeriod } } }),
      prisma.user.count({ where: { createdAt: { gte: previousPeriodStart, lt: startOfPeriod } } }),
      prisma.announcement.count({ where: { createdAt: { gte: startOfPeriod } } }),
      prisma.announcement.count({ where: { createdAt: { gte: previousPeriodStart, lt: startOfPeriod } } }),
      prisma.condolence.count({ where: { createdAt: { gte: startOfPeriod } } }),
      prisma.condolence.count({ where: { createdAt: { gte: previousPeriodStart, lt: startOfPeriod } } }),
      prisma.user.count({
        where: {
          OR: [
            { announcements: { some: { createdAt: { gte: startOfPeriod } } } },
            { condolences: { some: { createdAt: { gte: startOfPeriod } } } }
          ]
        }
      }),
      prisma.announcement.count({ where: { createdAt: { gte: today } } }),
      prisma.user.count({ where: { createdAt: { gte: weekAgo } } })
    ]);

    const userGrowth = previousPeriodUsers > 0
      ? Math.round(((currentPeriodUsers - previousPeriodUsers) / previousPeriodUsers) * 100)
      : currentPeriodUsers > 0 ? 100 : 0;

    const announcementGrowth = previousPeriodAnnouncements > 0
      ? Math.round(((currentPeriodAnnouncements - previousPeriodAnnouncements) / previousPeriodAnnouncements) * 100)
      : currentPeriodAnnouncements > 0 ? 100 : 0;

    const condolenceGrowth = previousPeriodCondolences > 0
      ? Math.round(((currentPeriodCondolences - previousPeriodCondolences) / previousPeriodCondolences) * 100)
      : currentPeriodCondolences > 0 ? 100 : 0;

    return NextResponse.json({
      totalUsers,
      totalAnnouncements,
      totalCondolences,
      activeUsers: activeUsersMonth,
      userGrowth,
      announcementGrowth,
      condolenceGrowth,
      todaySubmissions,
      thisWeekUsers
    });

  } catch (error) {
    console.error('Erreur stats overview:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
