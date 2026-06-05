import { NextResponse } from 'next/server';
import { auth } from '@/core/infrastructure/auth/auth';
import { headers } from 'next/headers';
import { prisma } from '@/lib/prisma';

// GET /api/donations/my - Get donations made by the current user
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

    const donations = await prisma.donation.findMany({
      where: { userId },
      include: {
        announcement: {
          select: {
            id: true,
            title: true,
            deceasedName: true,
          },
        },
        transaction: {
          select: {
            status: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const formattedDonations = donations.map((d: any) => ({
      id: d.id,
      amount: d.amount,
      message: d.message,
      isAnonymous: d.isAnonymous,
      status: d.transaction.status,
      createdAt: d.createdAt.toISOString(),
      announcementId: d.announcement.id,
      announcementTitle: d.announcement.title,
      deceasedName: d.announcement.deceasedName,
    }));

    const totalAmount = donations
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .filter((d: any) => d.transaction.status === 'COMPLETED')
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .reduce((sum: number, d: any) => sum + d.amount, 0);

    const totalCount = donations.length;
    const completedCount = donations.filter(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (d: any) => d.transaction.status === 'COMPLETED'
    ).length;
    const pendingCount = donations.filter(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (d: any) => d.transaction.status === 'PENDING'
    ).length;

    return NextResponse.json({
      donations: formattedDonations,
      totalAmount,
      totalCount,
      completedCount,
      pendingCount,
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des donations:', error);
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
}
