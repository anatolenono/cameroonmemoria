import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { stripe } from '@/lib/stripe';
import { prisma } from '@/lib/prisma';
import Stripe from 'stripe';

export async function POST(request: NextRequest) {
  const body = await request.text();
  const headersList = await headers();
  const signature = headersList.get('stripe-signature');

  if (!signature) {
    return NextResponse.json(
      { error: 'Signature Stripe manquante' },
      { status: 400 }
    );
  }

  if (!process.env.STRIPE_WEBHOOK_SECRET) {
    console.error('STRIPE_WEBHOOK_SECRET non défini');
    return NextResponse.json(
      { error: 'Configuration webhook manquante' },
      { status: 500 }
    );
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (error) {
    console.error('Erreur de vérification de signature webhook:', error);
    return NextResponse.json(
      { error: 'Signature webhook invalide' },
      { status: 400 }
    );
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        await handleSuccessfulPayment(session);
        break;
      }

      case 'checkout.session.expired': {
        const session = event.data.object as Stripe.Checkout.Session;
        await handleFailedPayment(session, 'CANCELED');
        break;
      }

      case 'payment_intent.payment_failed': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        await handlePaymentIntentFailed(paymentIntent);
        break;
      }

      default:
        console.log(`Type d'événement non géré: ${event.type}`);
    }

    return NextResponse.json({ received: true });

  } catch (error) {
    console.error('Erreur lors du traitement du webhook:', error);
    return NextResponse.json(
      { error: 'Erreur lors du traitement du webhook' },
      { status: 500 }
    );
  }
}

async function handleSuccessfulPayment(session: Stripe.Checkout.Session) {
  const metadata = session.metadata;
  const transactionId = metadata?.transactionId;
  const ownerId = metadata?.ownerId;

  if (!transactionId || !ownerId) {
    console.error('Métadonnées manquantes dans la session:', session.id);
    return;
  }

  // Check if already processed
  const existing = await prisma.transaction.findUnique({
    where: { id: transactionId },
    select: { status: true },
  });

  if (!existing) {
    console.error('Transaction introuvable:', transactionId);
    return;
  }

  if (existing.status === 'COMPLETED') {
    console.log('Transaction déjà traitée:', transactionId);
    return;
  }

  const amountInFcfa = session.amount_total || 0;

  if (amountInFcfa <= 0) {
    console.error('Montant invalide:', session.amount_total);
    return;
  }

  // Update transaction to COMPLETED and increment wallet balance atomically
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  await prisma.$transaction(async (tx: any) => {
    await tx.transaction.update({
      where: { id: transactionId },
      data: {
        status: 'COMPLETED',
        description: `${existing.status === 'PENDING' ? '' : '[Updated] '}Donation complétée - Session: ${session.id}`,
      },
    });

    await tx.wallet.update({
      where: { userId: ownerId },
      data: {
        balance: {
          increment: amountInFcfa,
        },
      },
    });
  });

  console.log('Paiement traité avec succès:', {
    transactionId,
    amount: amountInFcfa,
    sessionId: session.id,
    customerEmail: session.customer_details?.email,
  });
}

async function handleFailedPayment(session: Stripe.Checkout.Session, status: 'FAILED' | 'CANCELED') {
  const transactionId = session.metadata?.transactionId;

  if (!transactionId) {
    console.error('transactionId manquant pour session échouée:', session.id);
    return;
  }

  const existing = await prisma.transaction.findUnique({
    where: { id: transactionId },
    select: { status: true },
  });

  if (!existing || existing.status !== 'PENDING') {
    return;
  }

  await prisma.transaction.update({
    where: { id: transactionId },
    data: { status },
  });

  console.log(`Transaction ${status}:`, transactionId);
}

async function handlePaymentIntentFailed(paymentIntent: Stripe.PaymentIntent) {
  // Retrieve the checkout session linked to this payment intent
  const sessions = await stripe.checkout.sessions.list({
    payment_intent: paymentIntent.id,
    limit: 1,
  });

  const session = sessions.data[0];
  if (!session) {
    console.error('Aucune session trouvée pour le payment_intent:', paymentIntent.id);
    return;
  }

  await handleFailedPayment(session, 'FAILED');
}
