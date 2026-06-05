"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Package, AlertCircle, Loader2 } from "lucide-react";
import { useSession } from "@/lib/auth-client";

interface ProviderStats {
  provider: {
    id: string;
    companyName: string;
    companyCity: string;
    status: string;
    activation: {
      status: string;
      finalAmount: number;
      paidAt?: Date;
    } | null;
  };
  stats: {
    activeProducts: number;
    totalProducts: number;
  };
}

export default function ProviderDashboardPage() {
  const { data: session, isPending: sessionPending } = useSession();
  const [providerData, setProviderData] = useState<ProviderStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (session?.user) {
      fetchProviderData();
    }
  }, [session]);

  const fetchProviderData = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch("/api/provider/me");
      if (!response.ok) {
        throw new Error("Impossible de charger les données");
      }
      const data = await response.json();
      setProviderData(data);
    } catch (error) {
      console.error("Erreur:", error);
      setError("Impossible de charger les données du prestataire");
    } finally {
      setLoading(false);
    }
  };

  if (sessionPending || loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin mx-auto" />
          <p className="text-muted-foreground">Chargement du tableau de bord...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-700">
        <div className="flex items-start gap-3">
          <AlertCircle className="h-5 w-5 mt-0.5 flex-shrink-0" />
          <div>
            <h3 className="font-semibold">Erreur</h3>
            <p className="text-sm">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  if (!providerData) {
    return null;
  }

  const activationStatus = providerData.provider.activation?.status || "PENDING";
  const activationPaid = activationStatus === "PAID";

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="font-display text-3xl font-bold tracking-tight text-gris-lavande">
          Tableau de bord
        </h1>
        <p className="font-body text-muted-foreground">
          Vue d&apos;ensemble de votre activité
        </p>
      </div>

      {/* Profil et Activation */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Mon profil</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground">Entreprise</p>
              <p className="font-semibold text-lg">{providerData.provider.companyName}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Ville</p>
              <p className="font-semibold">{providerData.provider.companyCity}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Statut</p>
              <Badge className="mt-1" variant="outline">
                {providerData.provider.status === "ACTIVE" ? "Actif" : "En attente"}
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Statut d&apos;activation</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground">Frais d&apos;activation</p>
              {providerData.provider.activation ? (
                <>
                  <p className="font-semibold text-lg">
                    {providerData.provider.activation.finalAmount.toLocaleString("fr-CM", {
                      style: "currency",
                      currency: "XAF",
                    })}
                  </p>
                  <Badge className="mt-2" variant={activationPaid ? "default" : "secondary"}>
                    {activationPaid ? "Payé" : "En attente"}
                  </Badge>
                </>
              ) : (
                <p className="text-muted-foreground">À définir</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Stats Produits */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Produits actifs</CardTitle>
            <Package className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{providerData.stats.activeProducts}</div>
            <p className="text-xs text-muted-foreground">
              sur {providerData.stats.totalProducts} total
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tous les produits</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{providerData.stats.totalProducts}</div>
            <p className="text-xs text-muted-foreground">
              {providerData.stats.totalProducts === 0
                ? "Commencez par créer un produit"
                : "Gérez votre catalogue"}
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
