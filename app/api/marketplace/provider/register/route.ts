import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/core/infrastructure/auth/auth';
import { headers } from 'next/headers';
import { providerService } from '@/features/feature-marketplace/application/services/providerService';

// POST /api/marketplace/provider/register
export async function POST(request: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session) {
      return NextResponse.json({ error: 'Vous devez être connecté pour vous inscrire comme prestataire' }, { status: 401 });
    }

    const body = await request.json();
    const {
      categoryId,
      companyName,
      companyAddress,
      companyCity,
      companyPhone,
      companyEmail,
      companyDescription,
      repName,
      repPhone,
      repEmail,
      mobileMoneyNumber,
      mobileMoneyOperator,
    } = body;

    // Basic validation
    if (!categoryId) return NextResponse.json({ error: 'La catégorie est requise' }, { status: 400 });
    if (!companyName?.trim()) return NextResponse.json({ error: 'Le nom de l\'entreprise est requis' }, { status: 400 });
    if (!repName?.trim()) return NextResponse.json({ error: 'Le nom du représentant est requis' }, { status: 400 });
    if (!repPhone?.trim()) return NextResponse.json({ error: 'Le téléphone du représentant est requis' }, { status: 400 });

    const provider = await providerService.registerProvider(
      {
        categoryId,
        companyName: companyName.trim(),
        companyAddress: companyAddress?.trim(),
        companyCity: companyCity?.trim(),
        companyPhone: companyPhone?.trim(),
        companyEmail: companyEmail?.trim(),
        companyDescription: companyDescription?.trim(),
        repName: repName.trim(),
        repPhone: repPhone.trim(),
        repEmail: repEmail?.trim(),
        mobileMoneyNumber: mobileMoneyNumber?.trim(),
        mobileMoneyOperator: mobileMoneyOperator?.trim(),
      },
      session.user.id
    );

    return NextResponse.json(provider, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Erreur serveur';
    const status = message.includes('déjà enregistré') ? 409 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}

// GET /api/marketplace/provider/register — check if current user already has a provider profile
export async function GET() {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session) {
      return NextResponse.json({ error: 'Non connecté' }, { status: 401 });
    }

    const provider = await providerService.getProviderByUserId(session.user.id);
    return NextResponse.json({ provider });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Erreur serveur';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
