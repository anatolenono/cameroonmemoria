"use client";

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Heart, User, ArrowRight, ArrowLeft } from 'lucide-react';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';

import { PaymentFlowData } from '../../domain/types';
import { 
  SUGGESTED_AMOUNTS, 
  MIN_DONATION_AMOUNT,
  MAX_DONATION_AMOUNT
} from '../constants/paymentMethods';

// Schéma de validation pour le montant
const donationAmountSchema = z.object({
  amount: z
    .number()
    .min(MIN_DONATION_AMOUNT, `Le montant minimum est de ${MIN_DONATION_AMOUNT.toLocaleString('fr-FR')} FCFA`)
    .max(MAX_DONATION_AMOUNT, `Le montant maximum est de ${MAX_DONATION_AMOUNT.toLocaleString('fr-FR')} FCFA`),
  isAnonymous: z.boolean()
});

type DonationAmountFormData = z.infer<typeof donationAmountSchema>;

interface DonationAmountFormProps {
  deceasedName: string;
  announcementId: string;
  onNext: (data: PaymentFlowData) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

export function DonationAmountForm({
  deceasedName,
  announcementId,
  onNext,
  onCancel,
  isLoading = false
}: DonationAmountFormProps) {
  const [selectedAmount, setSelectedAmount] = useState<number | null>(null);
  const [customAmount, setCustomAmount] = useState<string>('');

  const form = useForm<DonationAmountFormData>({
    resolver: zodResolver(donationAmountSchema),
    defaultValues: {
      amount: 0,
      isAnonymous: false
    }
  });

  const watchedAmount = form.watch('amount');

  const handleAmountSelect = (amount: number) => {
    setSelectedAmount(amount);
    setCustomAmount('');
    form.setValue('amount', amount);
    form.clearErrors('amount');
  };

  const handleCustomAmountChange = (value: string) => {
    setCustomAmount(value);
    setSelectedAmount(null);
    const numericValue = parseInt(value) || 0;
    form.setValue('amount', numericValue);
    if (numericValue > 0) {
      form.clearErrors('amount');
    }
  };

  const handleSubmit = (formData: DonationAmountFormData) => {
    const paymentFlowData: PaymentFlowData = {
      amount: formData.amount,
      isAnonymous: formData.isAnonymous,
      announcementId,
      deceasedName
    };

    onNext(paymentFlowData);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* En-tête */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Heart className="h-6 w-6 text-red-500" />
            Faire un don
          </CardTitle>
          <CardDescription>
            Soutenez la famille de <strong>{deceasedName}</strong> dans cette épreuve difficile
          </CardDescription>
        </CardHeader>
      </Card>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
          {/* Sélection du montant */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Montant de la donation</CardTitle>
              <CardDescription>
                Choisissez un montant ou entrez un montant personnalisé
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Montants suggérés */}
              <div className="grid grid-cols-3 gap-3">
                {SUGGESTED_AMOUNTS.map((amount) => (
                  <Button
                    key={amount}
                    type="button"
                    variant={selectedAmount === amount ? "default" : "outline"}
                    className="h-12"
                    onClick={() => handleAmountSelect(amount)}
                  >
                    {amount.toLocaleString('fr-FR')} FCFA
                  </Button>
                ))}
              </div>

              {/* Montant personnalisé */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Montant personnalisé</label>
                <div className="relative">
                  <Input
                    type="number"
                    placeholder="Entrez un montant"
                    value={customAmount}
                    onChange={(e) => handleCustomAmountChange(e.target.value)}
                    className="pr-16"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                    FCFA
                  </span>
                </div>
              </div>

              <FormField
                control={form.control}
                name="amount"
                render={() => (
                  <FormItem>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* Options de donation */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Options de donation</CardTitle>
            </CardHeader>
            <CardContent>
              <FormField
                control={form.control}
                name="isAnonymous"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel className="flex items-center gap-2">
                        <User className="h-4 w-4" />
                        Donation anonyme
                      </FormLabel>
                      <p className="text-sm text-muted-foreground">
                        Votre nom ne sera pas affiché publiquement
                      </p>
                    </div>
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* Récapitulatif */}
          {watchedAmount > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Récapitulatif</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between font-medium text-lg">
                    <span>Montant de la donation</span>
                    <span>{watchedAmount.toLocaleString('fr-FR')} FCFA</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Actions */}
          <div className="flex gap-3">
            <Button 
              type="button" 
              variant="outline" 
              onClick={onCancel}
              disabled={isLoading}
              className="flex-1"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Annuler
            </Button>
            <Button 
              type="submit" 
              disabled={isLoading || !watchedAmount || watchedAmount === 0}
              className="flex-1"
            >
              <ArrowRight className="mr-2 h-4 w-4" />
              Continuer vers le paiement
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
} 