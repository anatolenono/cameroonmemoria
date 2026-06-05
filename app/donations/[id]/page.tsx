"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, AlertCircle, CheckCircle, Loader2 } from 'lucide-react';
import Link from 'next/link';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';

import { DonationAmountForm } from '@/features/feature-wallet/presentation/components/DonationAmountForm';
import { PaymentMethodSelector } from '@/features/feature-wallet/presentation/components/PaymentMethodSelector';
import { PaymentFlowData, PaymentFlowResult } from '@/features/feature-wallet/domain/types';
import { donationApiService } from '@/features/feature-wallet/presentation/services/donationApiService';
import { announcementApiService } from '@/features/feature-announcement/presentation/services';

interface PageProps {
  params: Promise<{
    id: string;
  }>;
}

interface AnnouncementData {
  id: string;
  title: string;
  deceasedName: string;
  description?: string;
}

type DonationStep = 'amount' | 'payment' | 'processing' | 'success';

export default function DonationPage({ params }: PageProps) {
  const router = useRouter();
  const [id, setId] = useState<string>('');
  const [announcement, setAnnouncement] = useState<AnnouncementData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // États pour le flux de donation
  const [currentStep, setCurrentStep] = useState<DonationStep>('amount');
  const [paymentFlowData, setPaymentFlowData] = useState<PaymentFlowData | null>(null);
  const [donationResult, setDonationResult] = useState<PaymentFlowResult | null>(null);

  useEffect(() => {
    const getParams = async () => {
      const resolvedParams = await params;
      setId(resolvedParams.id);
    };
    getParams();
  }, [params]);

  useEffect(() => {
    if (!id) return;

    const fetchAnnouncement = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        const response = await announcementApiService.getAnnouncementById(id);
        setAnnouncement({
          id: response.id,
          title: response.title,
          deceasedName: response.deceasedName,
          description: response.description || undefined
        });
      } catch (err) {
        console.error('Erreur lors du chargement de l&apos;annonce:', err);
        setError('Impossible de charger les informations de l&apos;annonce');
      } finally {
        setIsLoading(false);
      }
    };

    fetchAnnouncement();
  }, [id]);

  const handleAmountNext = (data: PaymentFlowData) => {
    setPaymentFlowData(data);
    setCurrentStep('payment');
  };

  const handlePaymentSuccess = async (result: PaymentFlowResult) => {
    if (!paymentFlowData) return;

    try {
      setCurrentStep('processing');

      // Créer la donation via l'API
      const donationData = {
        amount: paymentFlowData.amount,
        isAnonymous: paymentFlowData.isAnonymous,
        paymentMethod: 'stripe', // Sera déterminé par le flux de paiement
        phoneNumber: undefined,
        mobileProvider: undefined,
        email: undefined
      };

      const donationResponse = await donationApiService.createDonation(
        paymentFlowData.announcementId, 
        donationData
      );
      
      console.log('Donation créée avec succès:', donationResponse);

      // Si une URL de paiement est fournie, rediriger vers le processeur de paiement
      if (donationResponse.paymentUrl) {
        window.location.href = donationResponse.paymentUrl;
        return;
      }

      // Sinon, afficher le succès
      setDonationResult(result);
      setCurrentStep('success');
      
      // Rediriger vers la page de confirmation après 3 secondes
      setTimeout(() => {
        router.push(`/announcements/${paymentFlowData.announcementId}?donation=success`);
      }, 3000);

    } catch (err) {
      console.error('Erreur lors de la création de la donation:', err);
      setError('Une erreur est survenue lors du traitement de votre donation. Veuillez réessayer.');
      setCurrentStep('payment');
    }
  };

  const handlePaymentError = (errorMessage: string) => {
    setError(errorMessage);
  };

  const handleCancel = () => {
    router.back();
  };

  const handleBackToAmount = () => {
    setCurrentStep('amount');
    setPaymentFlowData(null);
    setError(null);
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
            <p className="text-muted-foreground">Chargement...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error && !announcement) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
          
          <div className="mt-6 text-center">
            <Button asChild variant="outline">
              <Link href="/">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Retour à l&apos;accueil
              </Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (currentStep === 'success' && donationResult) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <Card>
            <CardHeader className="text-center">
              <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
              <CardTitle className="text-2xl text-green-600">
                Donation envoyée avec succès !
              </CardTitle>
              <CardDescription>
                Merci pour votre générosité. Votre don sera transmis à la famille.
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <div className="space-y-2 mb-6">
                <p className="font-medium">
                  Montant: {donationResult.data?.amount.toLocaleString('fr-FR')} FCFA
                </p>
                <p className="text-sm text-muted-foreground">
                  Transaction ID: {donationResult.data?.transactionId}
                </p>
              </div>
              <p className="text-sm text-muted-foreground mb-6">
                Vous allez être redirigé automatiquement vers l&apos;annonce...
              </p>
              <Button asChild>
                <Link href={`/announcements/${announcement?.id}`}>
                  Voir l&apos;annonce
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (currentStep === 'processing') {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
            <p className="text-muted-foreground">Traitement de votre donation...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Navigation */}
      <div className="mb-6">
        <Button 
          variant="ghost" 
          onClick={currentStep === 'amount' ? handleCancel : handleBackToAmount} 
          className="mb-4"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          {currentStep === 'amount' ? 'Retour' : 'Retour au montant'}
        </Button>
      </div>

      {/* Erreur */}
      {error && (
        <div className="max-w-2xl mx-auto mb-6">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        </div>
      )}

      {/* Contenu selon l'étape */}
      {announcement && (
        <>
          {currentStep === 'amount' && (
            <DonationAmountForm
              deceasedName={announcement.deceasedName}
              announcementId={announcement.id}
              onNext={handleAmountNext}
              onCancel={handleCancel}
            />
          )}

          {currentStep === 'payment' && paymentFlowData && (
            <PaymentMethodSelector
              data={paymentFlowData}
              onSuccess={handlePaymentSuccess}
              onError={handlePaymentError}
              onCancel={handleBackToAmount}
            />
          )}
        </>
      )}
    </div>
  );
} 