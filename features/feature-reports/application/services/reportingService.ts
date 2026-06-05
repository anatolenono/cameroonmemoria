import { prisma } from '@/lib/prisma';
import { FinancialReport, EconomicActivity, PaymentTransaction } from '../../domain/types/financial';
import { PaymentStatus, PaymentType, PaymentSource, AnnouncementPlan } from '@prisma/client';

export class ReportingService {
  /**
   * Generate financial report for a given period
   */
  async generateFinancialReport(startDate: Date, endDate: Date): Promise<FinancialReport> {
    const payments = await prisma.payment.findMany({
      where: {
        createdAt: {
          gte: startDate,
          lte: endDate,
        },
        status: PaymentStatus.COMPLETED,
      },
      include: {
        announcement: { select: { id: true, title: true } },
        provider: { select: { id: true, companyName: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    // Calculate summary
    const summary = {
      totalGenerated: 0,
      bySource: {
        stripe: 0,
        orangeMoney: 0,
        momo: 0,
      },
    };

    const byType = {
      planUpgrades: 0,
      prestations: 0,
      fundraisers: 0,
    };

    const transactions: PaymentTransaction[] = [];

    for (const payment of payments) {
      summary.totalGenerated += payment.amount;

      // By source
      if (payment.paymentSource === PaymentSource.STRIPE) {
        summary.bySource.stripe += payment.amount;
      } else if (payment.paymentSource === PaymentSource.ORANGE_MONEY) {
        summary.bySource.orangeMoney += payment.amount;
      } else if (payment.paymentSource === PaymentSource.MOMO) {
        summary.bySource.momo += payment.amount;
      }

      // By type
      if (payment.paymentType === PaymentType.PLAN_UPGRADE) {
        byType.planUpgrades += payment.amount;
      } else if (payment.paymentType === PaymentType.PRESTATION) {
        byType.prestations += payment.amount;
      } else if (payment.paymentType === PaymentType.FUNDRAISER) {
        byType.fundraisers += payment.amount;
      }

      // Build transaction record
      const reference = payment.announcement?.title || payment.provider?.companyName || payment.id;
      transactions.push({
        id: payment.id,
        date: payment.createdAt,
        source: payment.paymentSource as 'STRIPE' | 'ORANGE_MONEY' | 'MOMO',
        type: payment.paymentType as 'PLAN_UPGRADE' | 'PRESTATION' | 'FUNDRAISER',
        amount: payment.amount,
        reference,
        status: payment.status as any,
      });
    }

    return {
      period: { startDate, endDate },
      summary,
      byType,
      transactions,
    };
  }

  /**
   * Generate economic activity report
   */
  async generateEconomicActivity(): Promise<EconomicActivity> {
    // Announcements
    const announcements = await prisma.announcement.findMany({
      where: { status: 'PUBLISHED' },
      select: { plan: true },
    });

    const announcementCounts = {
      free: 0,
      essential: 0,
      complete: 0,
      premium: 0,
    };

    announcements.forEach(ann => {
      if (ann.plan === AnnouncementPlan.FREE) announcementCounts.free++;
      else if (ann.plan === AnnouncementPlan.ESSENTIAL) announcementCounts.essential++;
      else if (ann.plan === AnnouncementPlan.COMPLETE) announcementCounts.complete++;
      else if (ann.plan === AnnouncementPlan.PREMIUM) announcementCounts.premium++;
    });

    const totalAnnouncements =
      announcementCounts.free +
      announcementCounts.essential +
      announcementCounts.complete +
      announcementCounts.premium;

    const conversionRate =
      totalAnnouncements > 0
        ? (
            ((announcementCounts.essential +
              announcementCounts.complete +
              announcementCounts.premium) /
              totalAnnouncements) *
            100
          ).toFixed(1)
        : '0';

    // Prestations
    const prestationPayments = await prisma.payment.findMany({
      where: {
        paymentType: PaymentType.PRESTATION,
        status: PaymentStatus.COMPLETED,
      },
      include: {
        provider: {
          include: {
            category: { select: { name: true } },
          },
        },
      },
    });

    const totalPrestationVolume = prestationPayments.reduce((sum, p) => sum + p.amount, 0);
    const transactionCount = prestationPayments.length;

    // Top providers
    const providerMap = new Map<
      string,
      { name: string; category: string; volume: number; count: number }
    >();

    prestationPayments.forEach(payment => {
      if (payment.provider) {
        const key = payment.provider.id;
        const existing = providerMap.get(key) || {
          name: payment.provider.companyName,
          category: payment.provider.category.name,
          volume: 0,
          count: 0,
        };
        existing.volume += payment.amount;
        existing.count += 1;
        providerMap.set(key, existing);
      }
    });

    const topProviders = Array.from(providerMap.entries())
      .map(([id, data]) => ({
        id,
        name: data.name,
        category: data.category,
        totalVolume: data.volume,
        transactionCount: data.count,
        cmCommission: data.volume * 0.1, // Assume 10% avg commission
      }))
      .sort((a, b) => b.totalVolume - a.totalVolume)
      .slice(0, 5);

    // Fundraisers (cagnottes)
    const fundraiserPayments = await prisma.payment.findMany({
      where: {
        paymentType: PaymentType.FUNDRAISER,
        status: PaymentStatus.COMPLETED,
      },
    });

    const totalFundraisers = await prisma.announcement.count({
      where: {
        plan: { in: [AnnouncementPlan.PREMIUM] },
      },
    });

    const totalFundraisersCollected = fundraiserPayments.reduce((sum, p) => sum + p.amount, 0);
    const cmFundraiserCommission = totalFundraisersCollected * 0.05; // 5% CM commission

    // Plans revenue
    const plansPayments = await prisma.payment.findMany({
      where: {
        paymentType: PaymentType.PLAN_UPGRADE,
        status: PaymentStatus.COMPLETED,
      },
    });

    const totalPlansRevenue = plansPayments.reduce((sum, p) => sum + p.amount, 0);
    const totalPrestationsRevenue = totalPrestationVolume * 0.1; // Assume 10% avg commission
    const totalRevenue = totalPlansRevenue + totalPrestationsRevenue + cmFundraiserCommission;

    return {
      announcements: {
        total: totalAnnouncements,
        byPlan: announcementCounts,
        conversionRate: parseFloat(conversionRate as string),
      },
      prestations: {
        totalVolume: totalPrestationVolume,
        transactionCount,
        topProviders,
      },
      fundraisers: {
        activeCount: totalFundraisers,
        totalCollected: totalFundraisersCollected,
        cmCommission: cmFundraiserCommission,
      },
      revenue: {
        fromPlans: totalPlansRevenue,
        fromPrestations: totalPrestationsRevenue,
        fromFundraisers: cmFundraiserCommission,
        total: totalRevenue,
      },
    };
  }
}
