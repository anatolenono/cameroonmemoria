import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { auth } from '@/core/infrastructure/auth/auth';
import { headers } from 'next/headers';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { amount, announcementId, deceasedName, isAnonymous } = body;

    // Validation des données
    if (!amount || !announcementId || !deceasedName || typeof isAnonymous !== 'boolean') {
      return NextResponse.json(
        { error: 'Données manquantes pour créer la session de paiement' },
        { status: 400 }
      );
    }

    // Récupérer l'utilisateur connecté
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      return NextResponse.json(
        { error: 'Vous devez être connecté pour faire une donation' },
        { status: 401 }
      );
    }

    const donorId = session.user.id;

    // Récupérer le propriétaire de l'annonce
    const announcement = await prisma.announcement.findUnique({
      where: { id: announcementId },
      select: { userId: true },
    });

    if (!announcement || !announcement.userId) {
      return NextResponse.json(
        { error: 'Annonce introuvable' },
        { status: 404 }
      );
    }

    const ownerId = announcement.userId;

    // Créer la transaction et la donation en statut PENDING
    const result = await prisma.$transaction(async (tx) => {
      const wallet = await tx.wallet.upsert({
        where: { userId: ownerId },
        create: {
          userId: ownerId,
          balance: 0,
          currency: 'XAF',
        },
        update: {},
      });

      const transaction = await tx.transaction.create({
        data: {
          amount,
          type: 'DONATION',
          status: 'PENDING',
          description: `Donation pour ${deceasedName}`,
          currency: 'XAF',
          userId: ownerId,
          walletId: wallet.id,
        },
      });

      const donation = await tx.donation.create({
        data: {
          amount,
          isAnonymous,
          transactionId: transaction.id,
          userId: donorId,
          announcementId,
        },
      });

      return { transaction, donation };
    });

    // Créer la session de checkout Stripe avec le transactionId en metadata
    const stripeSession = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'xaf',
            product_data: {
              name: `Don pour ${deceasedName}`,
              description: `Donation ${isAnonymous ? 'anonyme' : 'publique'} pour les funérailles`,
            },
            unit_amount: amount, // XAF is a zero-decimal currency
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${request.nextUrl.origin}/announcements/${announcementId}?payment=success`,
      cancel_url: `${request.nextUrl.origin}/donations/${announcementId}`,
      metadata: {
        transactionId: result.transaction.id,
        donationId: result.donation.id,
        announcementId,
        ownerId,
        deceasedName,
        isAnonymous: isAnonymous.toString(),
      },
      billing_address_collection: 'required',
      customer_creation: 'always',
      phone_number_collection: {
        enabled: true,
      },
      shipping_address_collection: {
        allowed_countries: ['CM', 'FR', 'CA', 'US'],
      },
    });

    // Store the Stripe session ID on the transaction for reference
    await prisma.transaction.update({
      where: { id: result.transaction.id },
      data: {
        description: `Donation pour ${deceasedName} - Session: ${stripeSession.id}`,
      },
    });

    return NextResponse.json({
      sessionId: stripeSession.id,
      url: stripeSession.url
    });

  } catch (error) {
    console.error('Erreur lors de la création de la session Stripe:', error);
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
}
