'use client';

import Link from 'next/link';
import { useSession } from '@/lib/auth-client';
import { useRouter } from 'next/navigation';
import { logoutUser } from '../../application/actions/auth';
import { Button } from '@/components/ui/button';

/**
 * Composant pour afficher les boutons d'authentification
 * Affiche les liens de connexion/inscription si non connecté
 * Affiche le nom d'utilisateur et le bouton de déconnexion si connecté
 */
export function AuthButtons() {
  const { data: session, isPending } = useSession();
  const router = useRouter();

  /**
   * Gère la déconnexion de l'utilisateur
   */
  const handleLogout = async () => {
    try {
      const result = await logoutUser();
      if ('error' in result) {
        console.error('Erreur de déconnexion:', result.error);
      } else {
        router.push('/');
        router.refresh();
        location.reload();
      }
    } catch (error) {
      console.error('Erreur de déconnexion:', error);
    }
  };

  // Si en cours de chargement, afficher un indicateur
  if (isPending) {
    return <div className="text-sm text-gray-500">Chargement...</div>;
  }

  // Si l'utilisateur est connecté, afficher son nom et un bouton de déconnexion
  if (session && session.user) {
    return (
      <div className="flex items-center gap-4">
        <div className="text-sm">
          <span className="text-gray-500">Bonjour,</span>{' '}
          <Link href="/profile" className="font-medium hover:underline">
            {session.user.name || session.user.email}
          </Link>
        </div>
        <Button
          onClick={handleLogout}
          data-testid="logout-button"
          variant="outline"
          className="text-red-600 border-red-600 hover:bg-red-50 hover:text-red-700"
        >
          Déconnexion
        </Button>
      </div>
    );
  }

  // Si l'utilisateur n'est pas connecté, afficher les liens de connexion et d'inscription
  return (
    <div className="flex gap-2">
      <Button asChild variant="outline">
        <Link href="/login">
          Connexion
        </Link>
      </Button>
      <Button asChild>
        <Link href="/register">
          Inscription
        </Link>
      </Button>
    </div>
  );
}
