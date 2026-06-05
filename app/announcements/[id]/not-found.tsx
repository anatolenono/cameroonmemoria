import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Search, AlertTriangle } from "lucide-react";
import Link from "next/link";

export default function AnnouncementNotFound() {
  return (
    <div className="max-w-2xl mx-auto space-y-8">
      {/* Header */}
      <div className="space-y-4">
        <Button variant="ghost" asChild>
          <Link href="/announcements">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Retour aux annonces
          </Link>
        </Button>
      </div>

      {/* Not Found Content */}
      <Card className="border-amber-200 bg-amber-50">
        <CardContent className="pt-6">
          <div className="text-center space-y-6">
            <div className="flex justify-center">
              <AlertTriangle className="h-16 w-16 text-amber-600" />
            </div>
            
            <div className="space-y-2">
              <h1 className="text-2xl font-bold text-amber-900">
                Annonce non trouvée
              </h1>
              <p className="text-amber-800">
                L&apos;annonce que vous recherchez n&apos;existe pas ou a été supprimée.
              </p>
            </div>

            <div className="space-y-4">
              <p className="text-sm text-amber-700">
                Cela peut arriver si :
              </p>
              <ul className="text-sm text-amber-700 space-y-1 text-left max-w-md mx-auto">
                <li>• L&apos;annonce a été supprimée par son auteur</li>
                <li>• L&apos;annonce n&apos;a pas encore été approuvée</li>
                <li>• Le lien que vous avez suivi est incorrect</li>
                <li>• L&apos;annonce a expiré</li>
              </ul>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild>
                <Link href="/announcements">
                  <Search className="mr-2 h-4 w-4" />
                  Voir toutes les annonces
                </Link>
              </Button>
              <Button variant="outline" asChild>
                <Link href="/announcements/create">
                  Créer une annonce
                </Link>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Help Section */}
      <Card className="bg-muted/50">
        <CardContent className="pt-6">
          <div className="text-center space-y-4">
            <h2 className="text-lg font-semibold">Besoin d&apos;aide ?</h2>
            <p className="text-sm text-muted-foreground">
              Si vous pensez qu&apos;il s&apos;agit d&apos;une erreur, n&apos;hésitez pas à nous contacter.
            </p>
            <Button variant="outline" size="sm">
              Contacter le support
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 