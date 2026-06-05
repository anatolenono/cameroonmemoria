import { PricingService } from '@/features/feature-announcement/application/services/pricingService';
import { NextResponse } from 'next/server';

const pricingService = new PricingService();

export async function GET() {
  try {
    const plans = pricingService.getAllPlans();
    // Convert Infinity to a string representation for JSON serialization
    const sanitizedPlans = plans.map(plan => ({
      ...plan,
      features: {
        ...plan.features,
        photoCount: plan.features.photoCount === Infinity ? 'unlimited' : plan.features.photoCount,
      },
    }));
    return NextResponse.json(
      {
        success: true,
        data: sanitizedPlans,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error fetching pricing plans:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch pricing plans' },
      { status: 500 }
    );
  }
}
