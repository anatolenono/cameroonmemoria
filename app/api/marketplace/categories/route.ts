import { NextResponse } from 'next/server';
import { categoryService } from '@/features/feature-marketplace/application/services/categoryService';

// GET /api/marketplace/categories — public, active categories only
export async function GET() {
  try {
    const result = await categoryService.getAllCategories({ isActive: true });
    return NextResponse.json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Erreur serveur';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
