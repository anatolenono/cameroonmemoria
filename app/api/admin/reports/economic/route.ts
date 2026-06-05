import { auth } from '@/core/infrastructure/auth/auth';
import { headers } from 'next/headers';
import { prisma } from '@/lib/prisma';
import { ReportingService } from '@/features/feature-reports/application/services/reportingService';
import { NextResponse } from 'next/server';

const reportingService = new ReportingService();

export async function GET() {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check admin role
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { role: true },
    });

    if (user?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const activity = await reportingService.generateEconomicActivity();

    return NextResponse.json(
      {
        success: true,
        data: activity,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error generating economic activity report:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to generate report' },
      { status: 500 }
    );
  }
}
