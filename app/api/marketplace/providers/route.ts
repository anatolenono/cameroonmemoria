import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/marketplace/providers
// Public route - list active providers with optional filtering
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const categoryId = searchParams.get('categoryId') ?? undefined;
    const city = searchParams.get('city') ?? undefined;
    const limit = Number(searchParams.get('limit')) || 50;
    const offset = Number(searchParams.get('offset')) || 0;

    const where: Record<string, unknown> = { status: 'ACTIVE' };
    if (categoryId) where.categoryId = categoryId;
    if (city) where.companyCity = { contains: city, mode: 'insensitive' };

    const [providers, total] = await Promise.all([
      prisma.provider.findMany({
        where,
        include: {
          category: { select: { id: true, name: true, slug: true } },
          user: { select: { id: true, name: true } },
        },
        skip: offset,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.provider.count({ where }),
    ]);

    return NextResponse.json({
      providers: providers.map(p => ({
        id: p.id,
        userId: p.userId,
        categoryId: p.categoryId,
        category: p.category,
        status: p.status,
        companyName: p.companyName,
        companyCity: p.companyCity,
        companyDescription: p.companyDescription,
        companyPhone: p.companyPhone,
        companyEmail: p.companyEmail,
      })),
      total,
      limit,
      offset,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Erreur serveur';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
