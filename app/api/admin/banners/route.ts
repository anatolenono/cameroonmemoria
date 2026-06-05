import { NextRequest, NextResponse } from 'next/server';
import { withBannerPresetRepository } from '@/features/feature-banner/infrastructure/repositories/bannerPresetRepository';
import { auth } from '@/core/infrastructure/auth/auth';
import { headers } from 'next/headers';
import { prisma } from '@/lib/prisma';
import { BannerType } from '@/features/feature-banner/domain/types/banner';

// GET /api/admin/banners - Get all banner presets (including inactive)
export async function GET() {
  try {
    // Check authentication
    const session = await auth.api.getSession({
      headers: await headers()
    });

    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized. Login required.' },
        { status: 401 }
      );
    }

    // Get user role from database
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { role: true }
    });

    if (user?.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Unauthorized. Admin access required.' },
        { status: 403 }
      );
    }

    const presets = await withBannerPresetRepository(async (repo) => {
      return await repo.findAll();
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

// POST /api/admin/banners - Create new banner preset
export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const session = await auth.api.getSession({
      headers: await headers()
    });

    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized. Login required.' },
        { status: 401 }
      );
    }

    // Get user role from database
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { role: true }
    });

    if (user?.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Unauthorized. Admin access required.' },
        { status: 403 }
      );
    }

    const formData = await request.formData();

    // Extract data
    const name = formData.get('name') as string;
    const type = formData.get('type') as BannerType;
    const imageUrl = formData.get('imageUrl') as string;
    const thumbnailUrl = formData.get('thumbnailUrl') as string | null;
    const category = formData.get('category') as string | null;
    const displayOrder = formData.get('displayOrder') ? parseInt(formData.get('displayOrder') as string) : 0;

    console.log('Creating banner preset with data:', { name, type, imageUrl, thumbnailUrl, category, displayOrder });

    // Validate required fields
    if (!name || !type || !imageUrl) {
      console.error('Missing required fields:', { name, type, imageUrl });
      return NextResponse.json(
        { error: 'Missing required fields: name, type, imageUrl' },
        { status: 400 }
      );
    }

    // Validate type
    if (!Object.values(BannerType).includes(type)) {
      return NextResponse.json(
        { error: 'Invalid banner type. Must be COLOR, GRADIENT, or PHOTO' },
        { status: 400 }
      );
    }

    const preset = await withBannerPresetRepository(async (repo) => {
      return await repo.create({
        name,
        type,
        imageUrl,
        thumbnailUrl: thumbnailUrl || undefined,
        category: category || undefined,
        displayOrder,
      });
    });

    console.log('Banner preset created successfully:', preset);

    return NextResponse.json({ preset }, { status: 201 });
  } catch (error) {
    console.error('Error creating banner preset:', error);
    return NextResponse.json(
      { error: 'Failed to create banner preset' },
      { status: 500 }
    );
  }
}
