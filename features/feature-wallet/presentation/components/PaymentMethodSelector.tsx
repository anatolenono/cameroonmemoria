"use client";

import { useState } from 'react';
import { Heart, CreditCard, Smartphone, DollarSign, ArrowLeft, Lock, Shield, ChevronRight } from 'lucide-react';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

import { PaymentFlowData, PaymentFlowResult } from '../../domain/types';
import { PAYMENT_METHODS } from '../constants/paymentMethods';
import { StripePaymentFlow } from './payment-flows/StripePaymentFlow';

interface PaymentMethodSelectorProps {
  data: PaymentFlowData;
  onSuccess: (result: PaymentFlowResult) => void;
  onError: (error: string) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

const getPaymentMethodIcon = (type: string) => {
  switch (type) {
    case 'mobile_money':
      return <Smartphone className="h-5 w-5" />;
    case 'stripe':
      return <CreditCard className="h-5 w-5" />;
    case 'paypal':
      return <DollarSign className="h-5 w-5" />;
    default:
      return <Heart className="h-5 w-5" />;
  }
};

export function PaymentMethodSelector({
  data,
  onSuccess,
  onError,
  onCancel,
  isLoading = false
}: PaymentMethodSelectorProps) {
  const [selectedMethod, setSelectedMethod] = useState<string | null>(null);

  const availableMethods = PAYMENT_METHODS.filter(method => method.isAvailable);

  // If a method is selected, show its flow
  if (selectedMethod) {
    switch (selectedMethod) {
      case 'stripe':
        return (
          <StripePaymentFlow
            data={data}
            onSuccess={onSuccess}
            onError={onError}
            onCancel={() => setSelectedMethod(null)}
            isLoading={isLoading}
          />
        );
      default:
        return null;
    }
  }

  return (
    <div className="max-w-lg mx-auto space-y-5">
      {/* Donation summary card */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center h-10 w-10 rounded-full bg-red-50">
              <Heart className="h-5 w-5 text-red-500" />
            </div>
            <div>
              <CardTitle className="text-lg">Confirmer votre donation</CardTitle>
              <CardDescription>
                Pour {data.deceasedName}
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="rounded-lg bg-muted/50 p-4 space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Montant</span>
              <span className="text-xl font-bold">{data.amount.toLocaleString('fr-FR')} FCFA</span>
            </div>
            <Separator />
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Type de donation</span>
              <Badge variant="secondary">
                {data.isAnonymous ? 'Anonyme' : 'Public'}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Payment methods */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Moyen de paiement</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {availableMethods.map((method) => (
            <button
              key={method.id}
              onClick={() => setSelectedMethod(method.id)}
              className="w-full flex items-center gap-3 p-3 rounded-lg border border-border hover:border-primary hover:bg-muted/30 transition-all group"
            >
              <div className="flex items-center justify-center h-10 w-10 rounded-lg bg-muted group-hover:bg-primary/10 transition-colors">
                {getPaymentMethodIcon(method.type)}
              </div>
              <div className="flex-1 text-left">
                <p className="font-medium text-sm">{method.name}</p>
                <p className="text-xs text-muted-foreground">{method.description}</p>
              </div>
              <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
            </button>
          ))}

          {/* Show unavailable methods as disabled */}
          {PAYMENT_METHODS.filter(m => !m.isAvailable).map((method) => (
            <div
              key={method.id}
              className="w-full flex items-center gap-3 p-3 rounded-lg border border-dashed border-border opacity-50 cursor-not-allowed"
            >
              <div className="flex items-center justify-center h-10 w-10 rounded-lg bg-muted">
                {getPaymentMethodIcon(method.type)}
              </div>
              <div className="flex-1 text-left">
                <p className="font-medium text-sm">{method.name}</p>
                <p className="text-xs text-muted-foreground">{method.description}</p>
              </div>
              <Badge variant="outline" className="text-xs shrink-0">
                Bientôt
              </Badge>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Security footer */}
      <div className="flex items-center justify-center gap-4 text-xs text-muted-foreground px-2">
        <span className="flex items-center gap-1">
          <Lock className="h-3 w-3" />
          Chiffrement SSL
        </span>
        <span className="flex items-center gap-1">
          <Shield className="h-3 w-3" />
          Paiement sécurisé
        </span>
      </div>

      {/* Cancel */}
      <Button
        type="button"
        variant="ghost"
        onClick={onCancel}
        disabled={isLoading}
        className="w-full"
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Modifier le montant
      </Button>
    </div>
  );
}
