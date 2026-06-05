"use client";

import { useState, useEffect } from 'react';
import { CreditCard, Lock, Loader2, ArrowLeft } from 'lucide-react';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

import { PaymentFlowProps } from '../../../domain/types';
import { stripeService } from '../../services/stripeService';

export function StripePaymentFlow({ 
  data, 
  onError, 
  onCancel, 
  isLoading = false 
}: PaymentFlowProps) {
  const [isProcessing, setIsProcessing] = useState(false);

  // Rediriger automatiquement vers Stripe au chargement du composant
  useEffect(() => {
    const redirectToStripe = async () => {
      try {
        setIsProcessing(true);

        // Vérifier que Stripe est configuré
        if (!stripeService.isConfigured()) {
          throw new Error('Configuration Stripe manquante');
        }

        // Créer la session de checkout Stripe via le service
        const session = await stripeService.createCheckoutSession({
          amount: data.amount,
          announcementId: data.announcementId,
          deceasedName: data.deceasedName,
          isAnonymous: data.isAnonymous,
        });

        // Rediriger vers Stripe Checkout
        stripeService.redirectToCheckout(session.url);

      } catch (error) {
        console.error('Erreur lors du traitement Stripe:', error);
        onError(error instanceof Error ? error.message : 'Erreur lors du traitement du paiement. Veuillez réessayer.');
        setIsProcessing(false);
      }
    };

    // Délai court pour permettre à l'utilisateur de voir l'interface avant la redirection
    const timer = setTimeout(redirectToStripe, 1000);

    return () => clearTimeout(timer);
  }, [data, onError]);

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* En-tête */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <CreditCard className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <CardTitle>Paiement par carte bancaire</CardTitle>
                <CardDescription>
                  Redirection vers Stripe pour {data.deceasedName}
                </CardDescription>
              </div>
            </div>
            <Badge variant="secondary" className="flex items-center gap-1">
              <Lock className="h-3 w-3" />
              Sécurisé
            </Badge>
          </div>
        </CardHeader>
      </Card>

      {/* Récapitulatif */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Récapitulatif de la donation</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Montant</span>
              <span className="font-medium">{stripeService.formatAmount(data.amount)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Bénéficiaire</span>
              <span className="font-medium">{data.deceasedName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Type</span>
              <span className="font-medium">{data.isAnonymous ? 'Anonyme' : 'Public'}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* État de redirection */}
      <Card className="border-blue-200 bg-blue-50">
        <CardContent className="pt-6">
          <div className="text-center space-y-4">
            {isProcessing ? (
              <>
                <div className="flex justify-center">
                  <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                </div>
                <div>
                  <p className="font-medium text-blue-800">Redirection vers Stripe...</p>
                  <p className="text-sm text-blue-700">
                    Vous allez être redirigé vers la page de paiement sécurisée de Stripe
                  </p>
                </div>
              </>
            ) : (
              <div>
                <p className="font-medium text-blue-800">Préparation du paiement</p>
                <p className="text-sm text-blue-700">
                  Initialisation de la session de paiement sécurisée
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex gap-3">
        <Button 
          variant="outline" 
          onClick={onCancel}
          disabled={isProcessing || isLoading}
          className="flex-1"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Annuler
        </Button>
        <Button 
          disabled={true}
          className="flex-1 bg-blue-600 hover:bg-blue-700"
        >
          <Lock className="mr-2 h-4 w-4" />
          Redirection en cours...
        </Button>
      </div>

      {/* Sécurité */}
      <Card className="border-green-200 bg-green-50">
        <CardContent className="pt-6">
          <div className="flex items-center gap-2 text-green-800 mb-2">
            <Lock className="h-4 w-4" />
            <span className="font-medium">Paiement sécurisé</span>
          </div>
          <p className="text-sm text-green-700">
            Vous serez redirigé vers la page de paiement sécurisée de Stripe pour saisir vos informations de carte bancaire.
            Stripe utilise le chiffrement SSL et ne stocke jamais vos informations de carte.
          </p>
        </CardContent>
      </Card>
    </div>
  );
} 