"use client";

import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  ArrowLeft,
  Loader2,
  AlertCircle,
  CheckCircle,
  Clock,
  XCircle,
  ArrowDownRight,
  ArrowUpRight,
  RotateCcw,
  DollarSign,
  TrendingUp,
  Wallet,
} from "lucide-react";
import Link from "next/link";
import { useSession } from "@/lib/auth-client";
import { useRouter } from "next/navigation";

interface TransactionItem {
  id: string;
  amount: number;
  type: string;
  status: string;
  description: string | null;
  currency: string;
  createdAt: string;
}

const typeLabels: Record<string, string> = {
  DONATION: "Donation",
  WITHDRAWAL: "Retrait",
  REFUND: "Remboursement",
};

const statusLabels: Record<string, string> = {
  COMPLETED: "Compl\u00e9t\u00e9",
  PENDING: "En attente",
  FAILED: "\u00c9chou\u00e9",
  CANCELED: "Annul\u00e9",
};

const getStatusBadgeVariant = (status: string) => {
  switch (status) {
    case "COMPLETED":
      return "default" as const;
    case "PENDING":
      return "secondary" as const;
    default:
      return "destructive" as const;
  }
};

const getStatusIcon = (status: string) => {
  switch (status) {
    case "COMPLETED":
      return CheckCircle;
    case "PENDING":
      return Clock;
    default:
      return XCircle;
  }
};

const getTypeIcon = (type: string) => {
  switch (type) {
    case "DONATION":
      return ArrowDownRight;
    case "WITHDRAWAL":
      return ArrowUpRight;
    case "REFUND":
      return RotateCcw;
    default:
      return DollarSign;
  }
};

const getTypeBadgeVariant = (type: string) => {
  switch (type) {
    case "DONATION":
      return "default" as const;
    case "WITHDRAWAL":
      return "secondary" as const;
    case "REFUND":
      return "outline" as const;
    default:
      return "outline" as const;
  }
};

const formatAmount = (amount: number) => {
  return amount.toLocaleString("fr-FR") + " FCFA";
};

export default function TransactionHistoryPage() {
  const { data: session, isPending } = useSession();
  const router = useRouter();
  const [transactions, setTransactions] = useState<TransactionItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filterType, setFilterType] = useState("ALL");
  const [filterStatus, setFilterStatus] = useState("ALL");

  const fetchTransactions = useCallback(async () => {
    if (!session?.user) return;
    try {
      setLoading(true);
      setError(null);
      const params = new URLSearchParams();
      params.append("userId", session.user.id);
      if (filterType !== "ALL") params.append("type", filterType);
      if (filterStatus !== "ALL") params.append("status", filterStatus);

      const response = await fetch(`/api/transactions?${params.toString()}`);
      if (!response.ok) throw new Error("Erreur lors de la r\u00e9cup\u00e9ration");
      const result = await response.json();
      setTransactions(result.data || []);
    } catch (err) {
      console.error("Erreur:", err);
      setError("Impossible de charger les transactions");
    } finally {
      setLoading(false);
    }
  }, [session?.user, filterType, filterStatus]);

  useEffect(() => {
    if (!isPending && !session) {
      router.push("/login");
      return;
    }

    if (session?.user) {
      fetchTransactions();
    }
  }, [session, isPending, router, fetchTransactions]);

  const filteredTransactions = transactions;

  // Stats
  const completedTotal = transactions
    .filter((t) => t.status === "COMPLETED")
    .reduce((sum, t) => sum + t.amount, 0);
  const pendingTotal = transactions
    .filter((t) => t.status === "PENDING")
    .reduce((sum, t) => sum + t.amount, 0);
  const donationCount = transactions.filter((t) => t.type === "DONATION").length;

  if (isPending) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin mx-auto" />
          <p className="text-muted-foreground">Chargement...</p>
        </div>
      </div>
    );
  }

  if (!session) return null;

  return (
    <div className="max-w-5xl mx-auto py-8 px-4 sm:px-6 lg:px-8 space-y-6">
      {/* Header */}
      <div>
        <Button variant="ghost" asChild className="mb-4">
          <Link href="/profile/wallet">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Retour au portefeuille
          </Link>
        </Button>

        <h1 className="font-display text-3xl font-bold tracking-tight text-gris-lavande">
          Historique des transactions
        </h1>
        <p className="font-body text-muted-foreground">
          Toutes les transactions de votre portefeuille
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total compl\u00e9t\u00e9</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {formatAmount(completedTotal)}
            </div>
            <p className="text-xs text-muted-foreground">transactions valid\u00e9es</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">En attente</CardTitle>
            <Clock className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              {formatAmount(pendingTotal)}
            </div>
            <p className="text-xs text-muted-foreground">en cours de traitement</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Donations</CardTitle>
            <Wallet className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{donationCount}</div>
            <p className="text-xs text-muted-foreground">
              sur {transactions.length} transaction{transactions.length > 1 ? "s" : ""}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filtres</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Type filters */}
            <div className="space-y-2">
              <p className="text-sm font-medium text-muted-foreground">Type</p>
              <div className="flex flex-wrap gap-2">
                <Button
                  variant={filterType === "ALL" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setFilterType("ALL")}
                >
                  Tous
                </Button>
                <Button
                  variant={filterType === "DONATION" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setFilterType("DONATION")}
                >
                  <ArrowDownRight className="mr-1 h-3 w-3" />
                  Donations
                </Button>
                <Button
                  variant={filterType === "WITHDRAWAL" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setFilterType("WITHDRAWAL")}
                >
                  <ArrowUpRight className="mr-1 h-3 w-3" />
                  Retraits
                </Button>
                <Button
                  variant={filterType === "REFUND" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setFilterType("REFUND")}
                >
                  <RotateCcw className="mr-1 h-3 w-3" />
                  Remboursements
                </Button>
              </div>
            </div>

            {/* Status filters */}
            <div className="space-y-2">
              <p className="text-sm font-medium text-muted-foreground">Statut</p>
              <div className="flex flex-wrap gap-2">
                <Button
                  variant={filterStatus === "ALL" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setFilterStatus("ALL")}
                >
                  Tous
                </Button>
                <Button
                  variant={filterStatus === "COMPLETED" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setFilterStatus("COMPLETED")}
                >
                  <CheckCircle className="mr-1 h-3 w-3" />
                  Compl\u00e9t\u00e9s
                </Button>
                <Button
                  variant={filterStatus === "PENDING" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setFilterStatus("PENDING")}
                >
                  <Clock className="mr-1 h-3 w-3" />
                  En attente
                </Button>
                <Button
                  variant={filterStatus === "FAILED" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setFilterStatus("FAILED")}
                >
                  <XCircle className="mr-1 h-3 w-3" />
                  \u00c9chou\u00e9s
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Transactions Table */}
      <Card>
        <CardHeader>
          <CardTitle>Transactions</CardTitle>
          <CardDescription>
            {loading
              ? "Chargement..."
              : `${filteredTransactions.length} transaction(s) trouv\u00e9e(s)`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">
              <Loader2 className="h-6 w-6 animate-spin mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">
                Chargement des transactions...
              </p>
            </div>
          ) : error ? (
            <div className="text-center py-8 space-y-4">
              <p className="text-red-600">{error}</p>
              <Button onClick={fetchTransactions}>R\u00e9essayer</Button>
            </div>
          ) : filteredTransactions.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <AlertCircle className="mx-auto h-8 w-8 mb-2" />
              <p>Aucune transaction trouv\u00e9e pour les crit\u00e8res s\u00e9lectionn\u00e9s.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Description</TableHead>
                    <TableHead>Montant</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Statut</TableHead>
                    <TableHead>Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredTransactions.map((transaction) => {
                    const StatusIcon = getStatusIcon(transaction.status);
                    const TypeIcon = getTypeIcon(transaction.type);

                    return (
                      <TableRow key={transaction.id}>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <TypeIcon className="h-4 w-4 text-muted-foreground shrink-0" />
                            <span className="text-sm truncate max-w-[200px]">
                              {transaction.description || typeLabels[transaction.type] || transaction.type}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <span className="font-semibold text-sm">
                            {formatAmount(transaction.amount)}
                          </span>
                        </TableCell>
                        <TableCell>
                          <Badge variant={getTypeBadgeVariant(transaction.type)}>
                            {typeLabels[transaction.type] || transaction.type}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <StatusIcon className="h-3 w-3" />
                            <Badge variant={getStatusBadgeVariant(transaction.status)}>
                              {statusLabels[transaction.status] || transaction.status}
                            </Badge>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm text-muted-foreground">
                            {new Date(transaction.createdAt).toLocaleDateString(
                              "fr-FR",
                              {
                                day: "numeric",
                                month: "long",
                                year: "numeric",
                              }
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
