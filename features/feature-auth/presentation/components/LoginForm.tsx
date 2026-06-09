'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import Link from 'next/link';
import { Eye, EyeOff } from 'lucide-react';
import { loginUser } from '../../application/actions/auth';
import { AuthResult } from '../../domain/types/auth';

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

const loginFormSchema = z.object({
  identifier: z.string().min(1, { message: 'Email ou numéro de téléphone requis' }),
  password: z.string().min(1, { message: 'Le mot de passe est requis' }),
});

type LoginFormValues = z.infer<typeof loginFormSchema>;

/**
 * Composant de formulaire de connexion
 * Gère la soumission du formulaire et l'affichage des erreurs
 */
export function LoginForm() {
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginFormSchema),
    defaultValues: {
      identifier: '',
      password: '',
    },
  });

  /**
   * Gère la soumission du formulaire
   */
  const onSubmit = async (values: LoginFormValues) => {
    setError(null);
    setIsLoading(true);

    try {
      const result: AuthResult = await loginUser(values.identifier, values.password);

      if ('error' in result) {
        setError(result.error);
      } else {
        router.refresh();
        await new Promise(resolve => setTimeout(resolve, 500));
        router.push('/');
      }
    } catch (error) {
      console.error(error);
      setError('Une erreur est survenue lors de la connexion');
    } finally {
      setIsLoading(false);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="identifier"
          render={({ field }) => (
            <FormItem>
              <FormLabel htmlFor="identifier">Email ou numéro de téléphone</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  type="text"
                  id="identifier"
                  placeholder="email@exemple.com ou +237612345678"
                  autoComplete="username"
                  disabled={isLoading}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <div className="flex items-center justify-between">
                <FormLabel htmlFor="password">Mot de passe</FormLabel>
                <Link href="/reset-password" className="text-sm text-indigo-600 hover:text-indigo-500">
                  Mot de passe oublié ?
                </Link>
              </div>
              <FormControl>
                <div className="relative">
                  <Input
                    {...field}
                    type={showPassword ? "text" : "password"}
          id="password"
                    data-testid="password-input"
                    autoComplete="current-password"
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

      {error && <div className="text-sm text-red-600">{error}</div>}

        <Button
        type="submit"
          data-testid="login-button"
        disabled={isLoading}
          className="w-full"
      >
        {isLoading ? 'Connexion en cours...' : 'Se connecter'}
        </Button>
        
        <div className="mt-4 text-center text-sm">
          Vous n&apos;avez pas de compte ?{' '}
          <Link href="/register" className="text-indigo-600 hover:text-indigo-500">
            Inscrivez-vous ici
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
