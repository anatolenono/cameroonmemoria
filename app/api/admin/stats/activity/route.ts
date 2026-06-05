import { NextResponse } from 'next/server';
import { auth } from '@/core/infrastructure/auth/auth';
import { headers } from 'next/headers';
import { prisma } from '@/lib/prisma';

/**
 * GET /api/admin/stats/activity
 * Returns user activity metrics by period
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

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    weekAgo.setHours(0, 0, 0, 0);

    const monthAgo = new Date();
    monthAgo.setDate(monthAgo.getDate() - 30);
    monthAgo.setHours(0, 0, 0, 0);

    const [totalUsers, activeUsersToday, activeUsersWeek, activeUsersMonth] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({
        where: {
          OR: [
            { announcements: { some: { createdAt: { gte: today } } } },
            { condolences: { some: { createdAt: { gte: today } } } }
          ]
        }
      }),
      prisma.user.count({
        where: {
          OR: [
            { announcements: { some: { createdAt: { gte: weekAgo } } } },
            { condolences: { some: { createdAt: { gte: weekAgo } } } }
          ]
        }
      }),
      prisma.user.count({
        where: {
          OR: [
            { announcements: { some: { createdAt: { gte: monthAgo } } } },
            { condolences: { some: { createdAt: { gte: monthAgo } } } }
          ]
        }
      })
    ]);

    const userActivity = [
      { period: "Aujourd'hui", active: activeUsersToday, total: totalUsers },
      { period: "Cette semaine", active: activeUsersWeek, total: totalUsers },
      { period: "Ce mois", active: activeUsersMonth, total: totalUsers }
    ];

    return NextResponse.json({ userActivity });

  } catch (error) {
    console.error('Erreur stats activity:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
