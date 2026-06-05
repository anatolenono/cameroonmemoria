import { LoginForm } from '@/features/feature-auth/presentation/components/LoginForm';

/**
 * Page de connexion
 * Affiche le formulaire de connexion et un message de succès si l'utilisateur vient de s'inscrire
 */
export default function LoginPage() {
  return (
    <div className="flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="font-display mt-6 text-center text-3xl font-extrabold text-gris-lavande">Connexion</h2>
          <p className="font-body mt-2 text-center text-sm text-muted-foreground">
            Connectez-vous à votre compte Cameroon Memoria
          </p>
        </div>
        <LoginForm />
      </div>
    </div>
  );
}
