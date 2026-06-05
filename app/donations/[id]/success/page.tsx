import { Suspense } from 'react';
import { notFound, redirect } from 'next/navigation';
import { CheckCircle, ArrowLeft, Download, Share2 } from 'lucide-react';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

import { stripe } from '@/lib/stripe';
import { announcementApiService } from '@/features/feature-announcement/presentation/services/announcementApiService';

interface PageProps {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ session_id?: string }>;
}

async function SuccessPageContent({ params, searchParams }: PageProps) {
  const { id } = await params;
  const { session_id } = await searchParams;

  if (!session_id) {
    redirect(`/donations/${id}`);
  }

  try {
    // Récupérer les détails de la session Stripe
    const session = await stripe.checkout.sessions.retrieve(session_id, {
      expand: ['line_items', 'payment_intent', 'customer'],
    });

    if (session.payment_status !== 'paid') {
      redirect(`/donations/${id}`);
    }

    // Récupérer les détails de l'annonce
    const announcement = await announcementApiService.getAnnouncementById(id);

    if (!announcement) {
      notFound();
    }

    const metadata = session.metadata;
    const amount = session.amount_total ? session.amount_total / 100 : 0;
    const isAnonymous = metadata?.isAnonymous === 'true';
    const transactionId = typeof session.payment_intent === 'string' 
      ? session.payment_intent 
      : session.payment_intent?.id || session.id;

    // Récupérer les informations du customer depuis Stripe
    const customerDetails = session.customer_details;
    const customerEmail = customerDetails?.email;
    const customerName = customerDetails?.name;

    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-2xl mx-auto px-4 space-y-6">
          {/* En-tête de succès */}
          <Card className="border-green-200 bg-green-50">
            <CardHeader className="text-center">
              <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
              <CardTitle className="text-2xl text-green-800">
                Paiement réussi !
              </CardTitle>
              <CardDescription className="text-green-700">
                Votre donation a été traitée avec succès
              </CardDescription>
            </CardHeader>
          </Card>

          {/* Détails de la donation */}
          <Card>
            <CardHeader>
              <CardTitle>Récapitulatif de votre donation</CardTitle>
              <CardDescription>
                Merci pour votre générosité envers la famille de {announcement.deceasedName}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Montant</p>
                  <p className="text-2xl font-bold text-green-600">
                    {amount.toLocaleString('fr-FR')} FCFA
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Type de donation</p>
                  <Badge variant={isAnonymous ? "secondary" : "default"}>
                    {isAnonymous ? 'Anonyme' : 'Publique'}
                  </Badge>
                </div>
              </div>

              <Separator />

              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Bénéficiaire</span>
                  <span className="font-medium">{announcement.deceasedName}</span>
                </div>
                {customerName && !isAnonymous && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Donateur</span>
                    <span className="font-medium">{customerName}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Date de donation</span>
                  <span className="font-medium">
                    {new Date(session.created * 1000).toLocaleDateString('fr-FR', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">ID de transaction</span>
                  <span className="font-mono text-sm">{transactionId}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Méthode de paiement</span>
                  <span className="font-medium">Carte bancaire (Stripe)</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Prochaines étapes */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Prochaines étapes</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 bg-blue-600 rounded-full mt-2"></div>
                <div>
                  <p className="font-medium">Confirmation par email</p>
                  <p className="text-sm text-muted-foreground">
                    {customerEmail ? (
                      <>Un reçu de donation sera envoyé à {customerEmail}</>
                    ) : (
                      <>Un reçu de donation sera envoyé par email</>
                    )}
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 bg-blue-600 rounded-full mt-2"></div>
                <div>
                  <p className="font-medium">Notification à la famille</p>
                  <p className="text-sm text-muted-foreground">
                    {isAnonymous 
                      ? 'La famille sera informée d\'une donation anonyme'
                      : 'La famille sera informée de votre donation'
                    }
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-3">
            <Button 
              variant="outline" 
              className="flex-1"
              onClick={() => window.location.href = `/announcements/${id}`}
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Retour à l&apos;annonce
            </Button>
            <Button 
              variant="outline" 
              className="flex-1"
              onClick={() => window.print()}
            >
              <Download className="mr-2 h-4 w-4" />
              Imprimer le reçu
            </Button>
            <Button 
              variant="outline" 
              className="flex-1"
              onClick={() => {
                if (navigator.share) {
                  navigator.share({
                    title: `Donation pour ${announcement.deceasedName}`,
                    text: `J'ai fait une donation pour ${announcement.deceasedName}`,
                    url: window.location.origin + `/announcements/${id}`
                  });
                }
              }}
            >
              <Share2 className="mr-2 h-4 w-4" />
              Partager
            </Button>
          </div>

          {/* Message de remerciement */}
          <Card className="border-blue-200 bg-blue-50">
            <CardContent className="pt-6">
              <p className="text-center text-blue-800">
                <strong>Merci pour votre générosité.</strong><br />
                Votre soutien apporte du réconfort à la famille en cette période difficile.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  } catch (error) {
    console.error('Erreur lors de la récupération des détails de paiement:', error);
    redirect(`/donations/${id}`);
  }
}

export default function SuccessPage(props: PageProps) {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p>Vérification du paiement...</p>
        </div>
      </div>
    }>
      <SuccessPageContent {...props} />
    </Suspense>
  );
} 