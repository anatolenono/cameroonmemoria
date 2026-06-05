import { NextResponse } from 'next/server';
import { withBannerPresetRepository } from '@/features/feature-banner';

/**
 * GET /api/banners/presets
 * Fetch all active banner presets for the picker
 * Public endpoint - no authentication required
 */
export async function GET() {
  try {
    const presets = await withBannerPresetRepository(async (repo) => {
      return await repo.findAllActive();
    });

    return NextResponse.json({ presets }, { status: 200 });
  } catch (error) {
    console.error('Error fetching banner presets:', error);
    return NextResponse.json(
      { error: 'Failed to fetch banner presets' },
      { status: 500 }
    );
  }
}
