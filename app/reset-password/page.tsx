'use client';

import { useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import Link from 'next/link';
import { ArrowLeft, Loader2, CheckCircle, AlertCircle } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { authClient } from '@/lib/auth-client';

// Schema for requesting password reset
const requestResetSchema = z.object({
  email: z.string().email({ message: 'Veuillez entrer une adresse email valide' }),
});

// Schema for resetting password with token
const resetPasswordSchema = z.object({
  password: z
    .string()
    .min(8, { message: 'Le mot de passe doit contenir au moins 8 caractères' }),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Les mots de passe ne correspondent pas',
  path: ['confirmPassword'],
});

type RequestResetFormValues = z.infer<typeof requestResetSchema>;
type ResetPasswordFormValues = z.infer<typeof resetPasswordSchema>;

export default function ResetPasswordPage() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token');

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Form for requesting reset email
  const requestForm = useForm<RequestResetFormValues>({
    resolver: zodResolver(requestResetSchema),
    defaultValues: {
      email: '',
    },
  });

  // Form for resetting password with token
  const resetForm = useForm<ResetPasswordFormValues>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      password: '',
      confirmPassword: '',
    },
  });

  // Handle request reset email using better-auth client
  const onRequestReset = async (values: RequestResetFormValues) => {
    setError(null);
    setSuccess(null);
    setIsLoading(true);

    try {
      // Use better-auth client to request password reset
      const { error } = await authClient.requestPasswordReset({
        email: values.email,
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) {
        throw new Error(error.message || 'Une erreur est survenue');
      }

      setSuccess(
        'Un email de réinitialisation a été envoyé à votre adresse email. Veuillez vérifier votre boîte de réception.'
      );
      requestForm.reset();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Une erreur est survenue');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle reset password with token using better-auth client
  const onResetPassword = async (values: ResetPasswordFormValues) => {
    setError(null);
    setSuccess(null);
    setIsLoading(true);

    try {
      if (!token) {
        throw new Error('Token manquant');
      }

      // Use better-auth client to reset password
      const { error } = await authClient.resetPassword({
        newPassword: values.password,
        token,
      });

      if (error) {
        throw new Error(error.message || 'Une erreur est survenue');
      }

      setSuccess(
        'Votre mot de passe a été réinitialisé avec succès ! Vous pouvez maintenant vous connecter avec votre nouveau mot de passe.'
      );
      resetForm.reset();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Une erreur est survenue');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center bg-linear-to-br from-peche-claire/30 via-sable-clair/40 to-kaki-doux/20 p-4">
      <div className="w-full max-w-md space-y-6">
        {/* Back to login link */}
        <div>
          <Button variant="ghost" asChild>
            <Link href="/login">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Retour à la connexion
            </Link>
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-center">
              {token ? 'Nouveau mot de passe' : 'Réinitialiser le mot de passe'}
            </CardTitle>
            <CardDescription className="text-center">
              {token
                ? 'Entrez votre nouveau mot de passe'
                : 'Entrez votre email pour recevoir un lien de réinitialisation'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {/* Success message */}
            {success && (
              <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-md">
                <div className="flex items-center gap-2 text-green-800">
                  <CheckCircle className="h-5 w-5" />
                  <span className="font-medium">Succès</span>
                </div>
                <p className="mt-2 text-sm text-green-700">{success}</p>
                {token && (
                  <div className="mt-4">
                    <Button asChild className="w-full">
                      <Link href="/login">Se connecter</Link>
                    </Button>
                  </div>
                )}
              </div>
            )}

            {/* Error message */}
            {error && (
              <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md">
                <div className="flex items-center gap-2 text-red-800">
                  <AlertCircle className="h-5 w-5" />
                  <span className="font-medium">Erreur</span>
                </div>
                <p className="mt-2 text-sm text-red-700">{error}</p>
              </div>
            )}

            {!success && (
              <>
                {token ? (
                  // Reset password form (with token from email)
                  <Form {...resetForm}>
                    <form onSubmit={resetForm.handleSubmit(onResetPassword)} className="space-y-4">
                      <FormField
                        control={resetForm.control}
                        name="password"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel htmlFor="password">Nouveau mot de passe</FormLabel>
                            <FormControl>
                              <Input
                                {...field}
                                type="password"
                                id="password"
                                autoComplete="new-password"
                                disabled={isLoading}
                                placeholder="Au moins 8 caractères"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={resetForm.control}
                        name="confirmPassword"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel htmlFor="confirmPassword">
                              Confirmer le mot de passe
                            </FormLabel>
                            <FormControl>
                              <Input
                                {...field}
                                type="password"
                                id="confirmPassword"
                                autoComplete="new-password"
                                disabled={isLoading}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <Button type="submit" disabled={isLoading} className="w-full">
                        {isLoading ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Réinitialisation...
                          </>
                        ) : (
                          'Réinitialiser le mot de passe'
                        )}
                      </Button>
                    </form>
                  </Form>
                ) : (
                  // Request reset email form
                  <Form {...requestForm}>
                    <form onSubmit={requestForm.handleSubmit(onRequestReset)} className="space-y-4">
                      <FormField
                        control={requestForm.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel htmlFor="email">Email</FormLabel>
                            <FormControl>
                              <Input
                                {...field}
                                type="email"
                                id="email"
                                autoComplete="email"
                                disabled={isLoading}
                                placeholder="votre@email.com"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <Button type="submit" disabled={isLoading} className="w-full">
                        {isLoading ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Envoi en cours...
                          </>
                        ) : (
                          'Envoyer le lien de réinitialisation'
                        )}
                      </Button>
                    </form>
                  </Form>
                )}
              </>
            )}

            {/* Help text */}
            {!token && !success && (
              <div className="mt-6 text-center text-sm text-muted-foreground">
                <p>
                  Vous vous souvenez de votre mot de passe ?{' '}
                  <Link href="/login" className="text-indigo-600 hover:text-indigo-500">
                    Se connecter
                  </Link>
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
