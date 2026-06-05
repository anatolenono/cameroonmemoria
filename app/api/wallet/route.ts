import { NextResponse } from 'next/server';
import { auth } from '@/core/infrastructure/auth/auth';
import { headers } from 'next/headers';
import { prisma } from '@/lib/prisma';

// GET /api/wallet - Get current user's wallet and received donations grouped by announcement
export async function GET() {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      return NextResponse.json(
        { error: 'Vous devez être connecté' },
        { status: 401 }
      );
    }

    const userId = session.user.id;

    // Start from announcements owned by the user, include their donations
    const [wallet, announcements] = await Promise.all([
      prisma.wallet.findUnique({
        where: { userId },
      }),
      prisma.announcement.findMany({
        where: { userId },
        select: {
          id: true,
          title: true,
          deceasedName: true,
          status: true,
          createdAt: true,
          donations: {
            include: {
              transaction: {
                select: { status: true },
              },
              user: {
                select: { name: true, email: true },
              },
            },
            orderBy: { createdAt: 'desc' },
          },
        },
        orderBy: { createdAt: 'desc' },
      }),
    ]);

    // Build per-announcement groups with aggregation
    let totalReceived = 0;
    let totalDonations = 0;

    const announcementGroups = announcements
      .filter(a => a.donations.length > 0)
      .map(a => {
        let completedAmount = 0;
        let pendingAmount = 0;
        let completedCount = 0;
        let pendingCount = 0;

        const donations = a.donations.map(d => {
          const status = d.transaction.status;
          if (status === 'COMPLETED') {
            completedAmount += d.amount;
            completedCount++;
          } else if (status === 'PENDING') {
            pendingAmount += d.amount;
            pendingCount++;
          }

          return {
            id: d.id,
            amount: d.amount,
            isAnonymous: d.isAnonymous,
            donorName: d.isAnonymous ? 'Anonyme' : (d.user?.name ?? 'Inconnu'),
            donorEmail: d.isAnonymous ? null : (d.user?.email ?? null),
            status,
            createdAt: d.createdAt.toISOString(),
          };
        });

        totalReceived += completedAmount;
        totalDonations += donations.length;

        return {
          announcementId: a.id,
          announcementTitle: a.title,
          deceasedName: a.deceasedName,
          announcementStatus: a.status,
          completedAmount,
          pendingAmount,
          completedCount,
          pendingCount,
          donationCount: donations.length,
          donations,
        };
      });

    return NextResponse.json({
      wallet: {
        balance: wallet?.balance ?? 0,
        currency: wallet?.currency ?? 'XAF',
      },
      totalReceived,
      totalDonations,
      announcementGroups,
    });
  } catch (error) {
    console.error('Erreur lors de la récupération du wallet:', error);
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
}
