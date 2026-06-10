"use client";

import { useEffect, useState, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Loader2, AlertCircle, TrendingUp, Percent } from "lucide-react";
import { useSession } from "@/lib/auth-client";

interface Invoice {
  id: string;
  amount: number;
  status: "PENDING" | "PAID";
  createdAt: string;
}

interface RevenueData {
  totalRevenue: number;
  totalCommissions: number;
  netEarnings: number;
  invoices: Invoice[];
}

export default function ProviderRevenuePage() {
  const { data: session, isPending: sessionPending } = useSession();
  const [revenueData, setRevenueData] = useState<RevenueData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchRevenueData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch invoices - we'll calculate stats from these
      const response = await fetch("/api/provider/invoices");
      if (!response.ok) {
        throw new Error("Impossible de charger les revenus");
      }
      const data = await response.json();

      const invoices = data.invoices || [];

      // Calculate stats
      const paidInvoices = invoices.filter((inv: Invoice) => inv.status === "PAID");
      const totalRevenue = paidInvoices.reduce((sum: number, inv: Invoice) => sum + inv.amount, 0);

      // For now, we don't have commission data in invoices, so we'll show 0
      // In future, invoice should have commission breakdown
      const totalCommissions = 0;
      const netEarnings = totalRevenue - totalCommissions;

      setRevenueData({
        totalRevenue,
        totalCommissions,
        netEarnings,
        invoices,
      });
    } catch (err) {
      console.error("Erreur:", err);
      setError("Impossible de charger les données de revenus");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (session?.user) {
      fetchRevenueData();
    }
  }, [session, fetchRevenueData]);

  if (sessionPending || loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin mx-auto" />
          <p className="text-muted-foreground">Chargement de vos revenus...</p>
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

  if (!revenueData) {
    return null;
  }

  const currency = "XAF";

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl font-bold tracking-tight text-gris-lavande">
          Mes revenus
        </h1>
        <p className="text-muted-foreground">
          Vue d&apos;ensemble de vos gains et commissions
        </p>
      </div>

      {/* KPIs */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Revenus totaux</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {revenueData.totalRevenue.toLocaleString("fr-CM", {
                style: "currency",
                currency,
              })}
            </div>
            <p className="text-xs text-muted-foreground">Montants payés</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Commissions déduites</CardTitle>
            <Percent className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              {revenueData.totalCommissions.toLocaleString("fr-CM", {
                style: "currency",
                currency,
              })}
            </div>
            <p className="text-xs text-muted-foreground">À déduire de vos revenus</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Revenus nets</CardTitle>
            <TrendingUp className="h-4 w-4 text-indigo-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-indigo-600">
              {revenueData.netEarnings.toLocaleString("fr-CM", {
                style: "currency",
                currency,
              })}
            </div>
            <p className="text-xs text-muted-foreground">Après commissions</p>
          </CardContent>
        </Card>
      </div>

      {/* Invoices */}
      <Card>
        <CardHeader>
          <CardTitle>Factures</CardTitle>
          <CardDescription>
            Liste de vos factures et leurs statuts de paiement
          </CardDescription>
        </CardHeader>
        <CardContent>
          {revenueData.invoices.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <p>Aucune facture trouvée</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Facture</TableHead>
                  <TableHead>Montant</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead>Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {revenueData.invoices.map((invoice) => (
                  <TableRow key={invoice.id}>
                    <TableCell className="font-medium">
                      {invoice.id.slice(0, 8)}
                    </TableCell>
                    <TableCell>
                      {invoice.amount.toLocaleString("fr-CM", {
                        style: "currency",
                        currency,
                      })}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={invoice.status === "PAID" ? "default" : "secondary"}
                      >
                        {invoice.status === "PAID" ? "Payée" : "En attente"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {new Date(invoice.createdAt).toLocaleDateString("fr-CM")}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Info Banner */}
      <Card className="border-blue-200 bg-blue-50">
        <CardHeader>
          <CardTitle className="text-sm text-blue-900">Information</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-blue-800">
          <p>
            Les revenus affichés représentent les montants des factures marquées comme payées.
            Les versements sont traités mensuellement selon le calendrier défini par l&apos;administrateur.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
