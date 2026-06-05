"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Wallet, Heart, Loader2, ArrowRight } from "lucide-react";
import Link from "next/link";

interface WalletSummary {
  wallet: {
    balance: number;
    currency: string;
  };
  totalReceived: number;
  totalDonations: number;
  announcementGroups: { announcementId: string }[];
}

const formatAmount = (amount: number) => {
  return amount.toLocaleString("fr-FR") + " FCFA";
};

export function WalletSection() {
  const [data, setData] = useState<WalletSummary | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchWallet = async () => {
      try {
        const response = await fetch("/api/wallet");
        if (response.ok) {
          const walletData = await response.json();
          setData(walletData);
        }
      } catch (error) {
        console.error("Erreur lors de la récupération du wallet:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchWallet();
  }, []);

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin" />
        </CardContent>
      </Card>
    );
  }

  if (!data) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Wallet className="h-5 w-5" />
          Portefeuille
        </CardTitle>
        <CardDescription>Solde des donations reçues sur vos annonces</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-500">Solde disponible</p>
            <p className="text-2xl font-bold text-green-600">
              {formatAmount(data.wallet.balance)}
            </p>
          </div>
          <div className="text-right">
            <div className="flex items-center gap-1 text-sm text-muted-foreground">
              <Heart className="h-3 w-3" />
              {data.totalDonations} donation{data.totalDonations !== 1 ? "s" : ""}
            </div>
            <p className="text-sm text-muted-foreground">
              Total: {formatAmount(data.totalReceived)}
            </p>
          </div>
        </div>

        <Button asChild variant="outline" className="w-full">
          <Link href="/profile/wallet">
            Voir toutes les donations
            <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </Button>
      </CardContent>
    </Card>
  );
}
