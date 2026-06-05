'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import Link from 'next/link';
import { Eye, EyeOff } from 'lucide-react';
import { registerUser } from '../../application/actions/auth';
import { countries } from './countries';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import React from 'react';
import { CountryCombobox } from './CountryCombobox';

// Schéma de validation du formulaire avec Zod
const registerFormSchema = z.object({
  name: z.string().min(2, { message: 'Le nom doit contenir au moins 2 caractères' }),
  email: z.string().email({ message: 'Veuillez entrer une adresse email valide' }).or(z.literal('')),
  country: z.string().min(1, 'Le pays est requis'),
  phone: z.string().max(20, 'Numéro trop long'),
  password: z
    .string()
    .min(8, { message: 'Le mot de passe doit contenir au moins 8 caractères' })
    .regex(/[A-Z]/, { message: 'Le mot de passe doit contenir au moins une lettre majuscule' })
    .regex(/[0-9]/, { message: 'Le mot de passe doit contenir au moins un chiffre' }),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Les mots de passe ne correspondent pas',
  path: ['confirmPassword'],
}).refine((data) => data.email || data.phone, {
  message: 'Email ou numéro de téléphone requis',
  path: ['email'],
}).refine((data) => !data.phone || data.phone.length >= 6, {
  message: 'Le numéro doit contenir au moins 6 chiffres',
  path: ['phone'],
});

export type RegisterFormValues = z.infer<typeof registerFormSchema>;

/**
 * Composant de formulaire d'inscription
 * Gère la soumission du formulaire et l'affichage des erreurs
 */
export function RegisterForm() {
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const router = useRouter();

  const form = useForm<RegisterFormValues>({
    resolver: zodResolver(registerFormSchema),
    defaultValues: {
      name: '',
      email: '',
      country: 'CM',
      phone: '',
      password: '',
      confirmPassword: '',
    },
  });

  /**
   * Gère la soumission du formulaire
   */
  const onSubmit = async (values: RegisterFormValues) => {
    setError(null);
    setIsLoading(true);

    try {
      const country = countries.find(c => c.code === values.country);
      const phoneNumber = values.phone
        ? (country ? `${country.countryCode}${values.phone}` : values.phone)
        : undefined;
      const result = await registerUser(
        values.password,
        values.name,
        values.email || undefined,
        phoneNumber
      );

      if ('error' in result) {
        setError(result.error);
      } else {
        router.push('/login');
      }
    } catch (error) {
      console.error("Erreur lors de l'inscription:", error);
      setError("Une erreur est survenue lors de l'inscription");
    } finally {
      setIsLoading(false);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const toggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel htmlFor="name">Nom</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  type="text"
                  id="name"
                  data-testid="name-input"
                  autoComplete="name"
                  disabled={isLoading}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel htmlFor="email">Email <span className="text-muted-foreground font-normal">(optionnel si téléphone renseigné)</span></FormLabel>
              <FormControl>
                <Input
                  {...field}
                  type="email"
                  id="email"
                  data-testid="email-input"
                  autoComplete="email"
                  disabled={isLoading}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="country"
          render={() => <></>}
        />
        <FormField
          control={form.control}
          name="phone"
          render={({ field }) => {
            const country = countries.find(c => c.code === form.watch('country'));
            return (
              <FormItem>
                <FormLabel htmlFor="phone">Numéro de téléphone</FormLabel>
                <FormControl>
                  <div className="flex gap-2">
                    <div className="w-32">
                      <CountryCombobox
                        field={{
                          ...form.register('country'),
                          value: form.watch('country'),
                          onChange: (val: string) => form.setValue('country', val),
                          name: 'country',
                          ref: () => {},
                          onBlur: () => {},
                          disabled: isLoading,
                        }}
                        disabled={isLoading}
                      />
                    </div>
                    <Input
                      {...field}
                      type="tel"
                      id="phone"
                      data-testid="phone-input"
                      autoComplete="tel"
                      disabled={isLoading}
                      placeholder={country ? `Ex: ${country.countryCode} 612345678` : 'Numéro sans indicatif'}
                    />
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            );
          }}
        />

        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel htmlFor="password">Mot de passe</FormLabel>
              <FormControl>
                <div className="relative">
                  <Input
                    {...field}
                    type={showPassword ? "text" : "password"}
                    id="password"
                    data-testid="password-input"
                    autoComplete="new-password"
                    disabled={isLoading}
                  />
                  <button
                    type="button"
                    onClick={togglePasswordVisibility}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                    aria-label={showPassword ? "Cacher le mot de passe" : "Afficher le mot de passe"}
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="confirmPassword"
          render={({ field }) => (
            <FormItem>
              <FormLabel htmlFor="confirmPassword">Confirmer le mot de passe</FormLabel>
              <FormControl>
                <div className="relative">
                  <Input
                    {...field}
                    type={showConfirmPassword ? "text" : "password"}
                    id="confirmPassword"
                    data-testid="confirm-password-input"
                    autoComplete="new-password"
                    disabled={isLoading}
                  />
                  <button
                    type="button"
                    onClick={toggleConfirmPasswordVisibility}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                    aria-label={showConfirmPassword ? "Cacher le mot de passe" : "Afficher le mot de passe"}
                  >
                    {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {error && <div className="text-sm text-red-600">{error}</div>}

        <Button
          type="submit"
          data-testid="register-button"
          disabled={isLoading}
          className="w-full"
        >
          {isLoading ? 'Inscription en cours...' : "S'inscrire"}
        </Button>
        
        <div className="mt-4 text-center text-sm">
          Vous avez déjà un compte ?{' '}
          <Link href="/login" className="text-indigo-600 hover:text-indigo-500">
            Connectez-vous ici
          </Link>
          {' '} ou {' '}
          <Link href="/" className="text-indigo-600 hover:text-indigo-500">
            retournez à l&apos;accueil
          </Link>
        </div>
      </form>
    </Form>
  );
}
