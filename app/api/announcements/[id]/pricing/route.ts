import { auth } from '@/core/infrastructure/auth/auth';
import { headers } from 'next/headers';
import { prisma } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';
import { AnnouncementPlan } from '@/features/feature-announcement/domain/types/announcement';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { id: announcementId } = await params;
    const body = await request.json();
    const { plan } = body;

    // Validate plan
    if (!Object.values(AnnouncementPlan).includes(plan)) {
      return NextResponse.json(
        { error: 'Invalid plan' },
        { status: 400 }
      );
    }

    // Check ownership or admin role
    const announcement = await prisma.announcement.findUnique({
      where: { id: announcementId },
      select: { userId: true },
    });

    if (!announcement) {
      return NextResponse.json(
        { error: 'Announcement not found' },
        { status: 404 }
      );
    }

    if (announcement.userId !== session.user.id) {
      return NextResponse.json(
        { error: 'Forbidden' },
        { status: 403 }
      );
    }

    // Update plan
    const updated = await prisma.announcement.update({
      where: { id: announcementId },
      data: {
        plan,
        planPaidAt: plan !== AnnouncementPlan.FREE ? new Date() : null,
      },
    });

    return NextResponse.json(
      {
        success: true,
        data: updated,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error updating announcement plan:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update plan' },
      { status: 500 }
    );
  }
}
