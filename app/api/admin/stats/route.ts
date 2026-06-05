import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/core/infrastructure/auth/auth';
import { headers } from 'next/headers';
import { prisma } from '@/lib/prisma';

// GET /api/admin/stats
export async function GET(req: NextRequest) {
  try {
    // Récupérer la session utilisateur
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    // Vérifier si l'utilisateur est connecté
    if (!session) {
      return NextResponse.json(
        { error: 'Vous devez être connecté pour accéder à cette ressource' },
        { status: 401 }
      );
    }

    // Récupérer le rôle de l'utilisateur depuis la base de données
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { role: true }
    });

    // Vérifier si l'utilisateur est un modérateur ou un administrateur
    if (user?.role !== 'ADMIN' && user?.role !== 'MODERATOR') {
      return NextResponse.json(
        { error: 'Vous n\'avez pas les permissions nécessaires pour accéder à cette ressource' },
        { status: 403 }
      );
    }

    // Get period parameter (default: 30d)
    const searchParams = req.nextUrl.searchParams;
    const period = searchParams.get('period') || '30d';

    const periodDays = period === '7d' ? 7 : period === '90d' ? 90 : period === '1y' ? 365 : 30;

    // Calculer les dates pour les statistiques temporelles
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

    // Récupérer les statistiques de base
    const [
      pendingAnnouncements,
      totalAnnouncements,
      publishedAnnouncements,
      rejectedAnnouncements,
      totalUsers,
      totalCondolences,
      pendingCondolences,
      todaySubmissions,
      thisWeekUsers,
      currentPeriodUsers,
      previousPeriodUsers,
      currentPeriodAnnouncements,
      previousPeriodAnnouncements,
      currentPeriodCondolences,
      previousPeriodCondolences,
      activeUsersToday,
      activeUsersWeek,
      activeUsersMonth
    ] = await Promise.all([
      prisma.announcement.count({ where: { status: 'PENDING' } }),
      prisma.announcement.count(),
      prisma.announcement.count({ where: { status: 'PUBLISHED' } }),
      prisma.announcement.count({ where: { status: 'REJECTED' } }),
      prisma.user.count(),
      prisma.condolence.count(),
      prisma.condolence.count({ where: { isApproved: false } }),
      prisma.announcement.count({ where: { createdAt: { gte: today } } }),
      prisma.user.count({ where: { createdAt: { gte: weekAgo } } }),
      prisma.user.count({ where: { createdAt: { gte: startOfPeriod } } }),
      prisma.user.count({ where: { createdAt: { gte: previousPeriodStart, lt: startOfPeriod } } }),
      prisma.announcement.count({ where: { createdAt: { gte: startOfPeriod } } }),
      prisma.announcement.count({ where: { createdAt: { gte: previousPeriodStart, lt: startOfPeriod } } }),
      prisma.condolence.count({ where: { createdAt: { gte: startOfPeriod } } }),
      prisma.condolence.count({ where: { createdAt: { gte: previousPeriodStart, lt: startOfPeriod } } }),
      // Active users based on announcements or condolences
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
            { announcements: { some: { createdAt: { gte: startOfPeriod } } } },
            { condolences: { some: { createdAt: { gte: startOfPeriod } } } }
          ]
        }
      })
    ]);

    // Calculer les taux de croissance
    const userGrowth = previousPeriodUsers > 0
      ? Math.round(((currentPeriodUsers - previousPeriodUsers) / previousPeriodUsers) * 100)
      : currentPeriodUsers > 0 ? 100 : 0;

    const announcementGrowth = previousPeriodAnnouncements > 0
      ? Math.round(((currentPeriodAnnouncements - previousPeriodAnnouncements) / previousPeriodAnnouncements) * 100)
      : currentPeriodAnnouncements > 0 ? 100 : 0;

    const condolenceGrowth = previousPeriodCondolences > 0
      ? Math.round(((currentPeriodCondolences - previousPeriodCondolences) / previousPeriodCondolences) * 100)
      : currentPeriodCondolences > 0 ? 100 : 0;

    // Récupérer les statistiques par type d'annonce
    const announcementsByType = await prisma.announcement.groupBy({
      by: ['type'],
      _count: { id: true },
      where: { status: 'PUBLISHED' }
    });

    const topCategories = announcementsByType.map(item => ({
      category: item.type === 'FUNERAL' ? 'Funérailles' :
                item.type === 'ANNIVERSARY' ? 'Anniversaires' :
                item.type === 'THANKS' ? 'Remerciements' : 'Autre',
      count: item._count.id,
      percentage: publishedAnnouncements > 0
        ? Math.round((item._count.id / publishedAnnouncements) * 100)
        : 0
    }));

    // Récupérer les données mensuelles pour les 6 derniers mois
    const monthlyData = [];
    const monthNames = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin', 'Juil', 'Aoû', 'Sep', 'Oct', 'Nov', 'Déc'];

    for (let i = 5; i >= 0; i--) {
      const monthStart = new Date();
      monthStart.setMonth(monthStart.getMonth() - i);
      monthStart.setDate(1);
      monthStart.setHours(0, 0, 0, 0);

      const monthEnd = new Date();
      monthEnd.setMonth(monthEnd.getMonth() - i + 1);
      monthEnd.setDate(0);
      monthEnd.setHours(23, 59, 59, 999);

      const [users, announcements, condolences] = await Promise.all([
        prisma.user.count({
          where: {
            createdAt: {
              gte: monthStart,
              lte: monthEnd
            }
          }
        }),
        prisma.announcement.count({
          where: {
            createdAt: {
              gte: monthStart,
              lte: monthEnd
            }
          }
        }),
        prisma.condolence.count({
          where: {
            createdAt: {
              gte: monthStart,
              lte: monthEnd
            }
          }
        })
      ]);

      monthlyData.push({
        month: monthNames[monthStart.getMonth()],
        users,
        announcements,
        condolences
      });
    }

    return NextResponse.json({
      overview: {
        totalUsers,
        totalAnnouncements,
        totalCondolences,
        activeUsers: activeUsersMonth,
        userGrowth,
        announcementGrowth,
        condolenceGrowth
      },
      pendingAnnouncements,
      publishedAnnouncements,
      rejectedAnnouncements,
      pendingCondolences,
      todaySubmissions,
      thisWeekUsers,
      monthlyData,
      topCategories,
      userActivity: [
        { period: "Aujourd'hui", active: activeUsersToday, total: totalUsers },
        { period: "Cette semaine", active: activeUsersWeek, total: totalUsers },
        { period: "Ce mois", active: activeUsersMonth, total: totalUsers }
      ]
    });

  } catch (error) {
    console.error('Erreur lors de la récupération des statistiques:', error);
    const errorMessage = error instanceof Error ? error.message : 'Une erreur est survenue lors de la récupération des statistiques';
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
} 