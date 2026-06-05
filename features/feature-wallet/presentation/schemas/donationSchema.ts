import { z } from 'zod';
import { MIN_DONATION_AMOUNT, MAX_DONATION_AMOUNT } from '../constants/paymentMethods';

export const donationSchema = z.object({
  amount: z
    .number({
      required_error: "Le montant est requis",
      invalid_type_error: "Le montant doit être un nombre"
    })
    .min(MIN_DONATION_AMOUNT, `Le montant minimum est de ${MIN_DONATION_AMOUNT.toLocaleString('fr-FR')} FCFA`)
    .max(MAX_DONATION_AMOUNT, `Le montant maximum est de ${MAX_DONATION_AMOUNT.toLocaleString('fr-FR')} FCFA`),
  
  message: z
    .string()
    .max(500, "Le message ne peut pas dépasser 500 caractères")
    .optional(),
  
  isAnonymous: z.boolean(),
  
  paymentMethod: z
    .string({
      required_error: "Veuillez sélectionner une méthode de paiement"
    })
    .min(1, "Veuillez sélectionner une méthode de paiement"),
  
  // Champs conditionnels pour Mobile Money
  phoneNumber: z.string().optional(),
  mobileProvider: z.string().optional(),
  
  // Champs conditionnels pour autres méthodes
  email: z.string().optional()
}).superRefine((data, ctx) => {
  // Validation conditionnelle pour Mobile Money
  if (data.paymentMethod === 'mobile_money') {
    if (!data.phoneNumber || data.phoneNumber.trim() === '') {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Le numéro de téléphone est requis pour Mobile Money",
        path: ['phoneNumber']
      });
    } else {
      // Validation du format du numéro (format camerounais principalement)
      const phoneRegex = /^(\+237|237)?[6-9]\d{8}$/;
      if (!phoneRegex.test(data.phoneNumber.replace(/\s/g, ''))) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Format de numéro invalide (ex: +237 6XX XXX XXX)",
          path: ['phoneNumber']
        });
      }
    }
    
    if (!data.mobileProvider || data.mobileProvider.trim() === '') {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Veuillez sélectionner votre opérateur Mobile Money",
        path: ['mobileProvider']
      });
    }
  }
  
  // Validation conditionnelle pour Stripe et PayPal
  if (data.paymentMethod === 'stripe' || data.paymentMethod === 'paypal') {
    if (!data.email || data.email.trim() === '') {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "L'email est requis pour cette méthode de paiement",
        path: ['email']
      });
    } else {
      // Validation de l'email
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(data.email)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Format d'email invalide",
          path: ['email']
        });
      }
    }
  }
});

export type DonationFormData = z.infer<typeof donationSchema>; 