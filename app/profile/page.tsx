import { auth } from '@/core/infrastructure/auth/auth';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { User, Mail, Lock } from 'lucide-react';
import { WalletSection } from './wallet-section';

/**
 * Page de profil utilisateur
 * Accessible uniquement aux utilisateurs connectés
 */
export default async function ProfilePage() {
  // Récupérer les informations de session côté serveur
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  // Rediriger vers la page de connexion si l'utilisateur n'est pas connecté
  if (!session) {
    redirect('/login');
  }

  const isProvider = (session.user as any).role === 'PROVIDER';

  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-2xl space-y-8">
        <div>
          <h2 className="font-display mt-6 text-center text-3xl font-extrabold text-gris-lavande">
            Profil Utilisateur
          </h2>
          <p className="font-body mt-2 text-center text-sm text-muted-foreground">Gérez vos informations personnelles et vos paramètres</p>
        </div>

        {/* Informations Personnelles */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Informations Personnelles
            </CardTitle>
            <CardDescription>
              Vos données de profil
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between py-3 border-b">
              <div className="flex items-center gap-3">
                <User className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium text-gray-500">Nom</p>
                  <p className="text-sm text-gray-900">{session.user.name || 'Non défini'}</p>
                </div>
              </div>
            </div>
            <div className="flex items-center justify-between py-3">
              <div className="flex items-center gap-3">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium text-gray-500">Email</p>
                  <p className="text-sm text-gray-900">{session.user.email}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Sécurité */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lock className="h-5 w-5" />
              Sécurité
            </CardTitle>
            <CardDescription>
              Gérez vos paramètres de sécurité
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between py-3">
              <div>
                <p className="text-sm font-medium">Mot de passe</p>
                <p className="text-sm text-muted-foreground">Modifiez votre mot de passe pour sécuriser votre compte</p>
              </div>
              <Button asChild variant="outline">
                <Link href="/reset-password">
                  Changer le mot de passe
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Wallet & Donations - Hidden for Providers */}
        {!isProvider && <WalletSection />}

        <div className="flex justify-center mt-6">
          <Button
            asChild
            variant="outline"
          >
            <Link href="/">Retour à l&apos;accueil</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
