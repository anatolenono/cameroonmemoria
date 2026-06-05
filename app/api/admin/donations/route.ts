import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/core/infrastructure/auth/auth';
import { headers } from 'next/headers';
import { prisma } from '@/lib/prisma';

// GET /api/admin/donations - Get all donations (admin only)
export async function GET(req: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      return NextResponse.json(
        { error: 'Non authentifié' },
        { status: 401 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { role: true },
    });

    if (user?.role !== 'ADMIN' && user?.role !== 'MODERATOR') {
      return NextResponse.json(
        { error: 'Accès interdit' },
        { status: 403 }
      );
    }

    const searchParams = req.nextUrl.searchParams;
    const status = searchParams.get('status');
    const search = searchParams.get('search');
    const limit = parseInt(searchParams.get('limit') || '100');
    const offset = parseInt(searchParams.get('offset') || '0');

    // Build where clause
    const where: Record<string, unknown> = {};

    if (status && status !== 'ALL') {
      where.transaction = { status };
    }

    if (search) {
      where.OR = [
        { announcement: { title: { contains: search, mode: 'insensitive' } } },
        { announcement: { deceasedName: { contains: search, mode: 'insensitive' } } },
        { user: { name: { contains: search, mode: 'insensitive' } } },
        { user: { email: { contains: search, mode: 'insensitive' } } },
      ];
    }

    const [donations, total, stats] = await Promise.all([
      prisma.donation.findMany({
        where,
        include: {
          transaction: {
            select: { status: true },
          },
          announcement: {
            select: { title: true, deceasedName: true },
          },
          user: {
            select: { name: true, email: true },
          },
        },
        orderBy: { createdAt: 'desc' },
        take: limit,
        skip: offset,
      }),
      prisma.donation.count({ where }),
      // Aggregate stats
      Promise.all([
        prisma.donation.aggregate({
          _sum: { amount: true },
          _count: true,
          where: { transaction: { status: 'COMPLETED' } },
        }),
        prisma.donation.count({ where: { transaction: { status: 'PENDING' } } }),
        prisma.donation.count({ where: { transaction: { status: 'FAILED' } } }),
      ]),
    ]);

    const [completedStats, pendingCount, failedCount] = stats;

    return NextResponse.json({
      donations: donations.map(d => ({
        id: d.id,
        amount: d.amount,
        isAnonymous: d.isAnonymous,
        donorName: d.user?.name ?? 'Inconnu',
        donorEmail: d.user?.email ?? '',
        announcementTitle: d.announcement.title,
        deceasedName: d.announcement.deceasedName,
        announcementId: d.announcementId,
        status: d.transaction.status,
        createdAt: d.createdAt.toISOString(),
      })),
      total,
      stats: {
        totalAmount: completedStats._sum.amount ?? 0,
        completedCount: completedStats._count,
        pendingCount,
        failedCount,
      },
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des donations:', error);
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
}
