"use client";

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Heart, CreditCard, Smartphone, DollarSign, MessageSquare, Loader2 } from 'lucide-react';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';

import { donationSchema, DonationFormData } from '../schemas/donationSchema';
import { 
  PAYMENT_METHODS, 
  MOBILE_MONEY_PROVIDERS, 
  SUGGESTED_AMOUNTS,
} from '../constants/paymentMethods';

interface DonationFormProps {
  deceasedName: string;
  onSubmit: (data: DonationFormData) => void;
  onCancel?: () => void;
  isLoading?: boolean;
}

export function DonationForm({
  deceasedName,
  onSubmit,
  onCancel,
  isLoading = false
}: DonationFormProps) {
  const [selectedAmount, setSelectedAmount] = useState<number | null>(null);
  const [customAmount, setCustomAmount] = useState<string>('');

  const form = useForm<DonationFormData>({
    resolver: zodResolver(donationSchema),
    defaultValues: {
      amount: 0,
      message: '',
      isAnonymous: false,
      paymentMethod: '',
      phoneNumber: '',
      mobileProvider: '',
      email: ''
    }
  });

  const watchedPaymentMethod = form.watch('paymentMethod');
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
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
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

          {/* Méthode de paiement */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Méthode de paiement</CardTitle>
              <CardDescription>
                Sélectionnez votre méthode de paiement préférée
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="paymentMethod"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <div className="grid gap-3">
                        {PAYMENT_METHODS.filter(method => method.isAvailable).map((method) => (
                          <div
                            key={method.id}
                            className={`border rounded-lg p-4 cursor-pointer transition-colors ${
                              field.value === method.id
                                ? 'border-primary bg-primary/5'
                                : 'border-border hover:border-primary/50'
                            }`}
                            onClick={() => field.onChange(method.id)}
                          >
                            <div className="flex items-center gap-3">
                              {getPaymentMethodIcon(method.type)}
                              <div>
                                <div className="font-medium">{method.name}</div>
                                <div className="text-sm text-muted-foreground">
                                  {method.description}
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Champs spécifiques Mobile Money */}
              {watchedPaymentMethod === 'mobile_money' && (
                <div className="space-y-4 p-4 bg-muted/50 rounded-lg">
                  <FormField
                    control={form.control}
                    name="mobileProvider"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Opérateur Mobile Money</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Sélectionnez votre opérateur" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {MOBILE_MONEY_PROVIDERS.map((provider) => (
                              <SelectItem key={provider.id} value={provider.id}>
                                <div className="flex items-center gap-2">
                                  <span>{provider.icon}</span>
                                  <span>{provider.name}</span>
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="phoneNumber"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Numéro de téléphone</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="+237 6XX XXX XXX"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              )}

              {/* Champs pour Stripe/PayPal */}
              {(watchedPaymentMethod === 'stripe' || watchedPaymentMethod === 'paypal') && (
                <div className="space-y-4 p-4 bg-muted/50 rounded-lg">
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Adresse email</FormLabel>
                        <FormControl>
                          <Input
                            type="email"
                            placeholder="votre@email.com"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              )}
            </CardContent>
          </Card>

          {/* Message de soutien */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <MessageSquare className="h-5 w-5" />
                Message de soutien (optionnel)
              </CardTitle>
              <CardDescription>
                Laissez un message de condoléances pour la famille
              </CardDescription>
            </CardHeader>
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
            {onCancel && (
              <Button type="button" variant="outline" onClick={onCancel} className="flex-1">
                Annuler
              </Button>
            )}
            <Button 
              type="submit" 
              disabled={isLoading || !watchedAmount || !watchedPaymentMethod}
              className="flex-1"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Traitement...
                </>
              ) : (
                <>
                  <Heart className="mr-2 h-4 w-4" />
                  Faire le don
                </>
              )}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
} 