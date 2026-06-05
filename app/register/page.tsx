import { RegisterForm } from '@/features/feature-auth/presentation/components/RegisterForm';

/**
 * Page d'inscription
 * Affiche le formulaire d'inscription
 */
export default function RegisterPage() {
  return (
    <div className="flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-6">
        <div>
          <h2 className="font-display mt-6 text-center text-3xl font-extrabold text-gris-lavande">Inscription</h2>
          <p className="font-body mt-2 text-center text-sm text-muted-foreground">
            Rejoignez Cameroon Memoria et créez votre compte
          </p>
        </div>
        <RegisterForm />
      </div>
    </div>
  );
}
