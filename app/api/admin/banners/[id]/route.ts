import { NextRequest, NextResponse } from 'next/server';
import { withBannerPresetRepository } from '@/features/feature-banner/infrastructure/repositories/bannerPresetRepository';
import { auth } from '@/core/infrastructure/auth/auth';
import { headers } from 'next/headers';
import { prisma } from '@/lib/prisma';
import { BannerType } from '@/features/feature-banner/domain/types/banner';

// GET /api/admin/banners/[id] - Get single banner preset
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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

    const { id } = await params;

    const preset = await withBannerPresetRepository(async (repo) => {
      return await repo.findById(id);
    });

    if (!preset) {
      return NextResponse.json(
        { error: 'Banner preset not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ preset }, { status: 200 });
  } catch (error) {
    console.error('Error fetching banner preset:', error);
    return NextResponse.json(
      { error: 'Failed to fetch banner preset' },
      { status: 500 }
    );
  }
}

// PATCH /api/admin/banners/[id] - Update banner preset
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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

    const { id } = await params;
    const formData = await request.formData();

    // Extract data (all optional for PATCH)
    const updateData: Record<string, string | number | boolean> = {};

    const name = formData.get('name');
    const type = formData.get('type');
    const imageUrl = formData.get('imageUrl');
    const thumbnailUrl = formData.get('thumbnailUrl');
    const category = formData.get('category');
    const isActive = formData.get('isActive');
    const displayOrder = formData.get('displayOrder');

    if (name) updateData.name = name as string;
    if (type) {
      const bannerType = type as BannerType;
      if (!Object.values(BannerType).includes(bannerType)) {
        return NextResponse.json(
          { error: 'Invalid banner type. Must be COLOR, GRADIENT, or PHOTO' },
          { status: 400 }
        );
      }
      updateData.type = bannerType;
    }
    if (imageUrl) updateData.imageUrl = imageUrl as string;
    if (thumbnailUrl !== null) updateData.thumbnailUrl = thumbnailUrl as string;
    if (category !== null) updateData.category = category as string;
    if (isActive !== null) updateData.isActive = isActive === 'true';
    if (displayOrder !== null) updateData.displayOrder = parseInt(displayOrder as string);

    const preset = await withBannerPresetRepository(async (repo) => {
      return await repo.update(id, updateData);
    });

    return NextResponse.json({ preset }, { status: 200 });
  } catch (error) {
    console.error('Error updating banner preset:', error);
    return NextResponse.json(
      { error: 'Failed to update banner preset' },
      { status: 500 }
    );
  }
}

// DELETE /api/admin/banners/[id] - Delete banner preset
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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

    const { id } = await params;

    await withBannerPresetRepository(async (repo) => {
      await repo.delete(id);
    });

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error('Error deleting banner preset:', error);
    return NextResponse.json(
      { error: 'Failed to delete banner preset' },
      { status: 500 }
    );
  }
}
