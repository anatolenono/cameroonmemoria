"use client";

import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Heart,
  Search,
  CheckCircle,
  XCircle,
  Clock,
  ArrowLeft,
  Loader2,
  AlertCircle,
  Download,
  DollarSign,
} from "lucide-react";
import Link from "next/link";
import { useSession } from "@/lib/auth-client";
import { useRouter } from "next/navigation";

interface AdminDonation {
  id: string;
  amount: number;
  isAnonymous: boolean;
  donorName: string;
  donorEmail: string;
  announcementTitle: string;
  deceasedName: string;
  announcementId: string;
  status: string;
  createdAt: string;
}

interface DonationStats {
  totalAmount: number;
  completedCount: number;
  pendingCount: number;
  failedCount: number;
}

const statusLabels: Record<string, string> = {
  COMPLETED: "Complété",
  PENDING: "En attente",
  FAILED: "Échoué",
  CANCELED: "Annulé",
};

const getStatusBadgeVariant = (status: string) => {
  switch (status) {
    case "COMPLETED":
      return "default";
    case "PENDING":
      return "secondary";
    case "FAILED":
    case "CANCELED":
      return "destructive";
    default:
      return "outline";
  }
};

const getStatusIcon = (status: string) => {
  switch (status) {
    case "COMPLETED":
      return CheckCircle;
    case "PENDING":
      return Clock;
    case "FAILED":
    case "CANCELED":
      return XCircle;
    default:
      return Heart;
  }
};

const formatAmount = (amount: number) => {
  return amount.toLocaleString("fr-FR") + " FCFA";
};

export default function AdminDonationsPage() {
  const { data: session, isPending } = useSession();
  const router = useRouter();
  const [donations, setDonations] = useState<AdminDonation[]>([]);
  const [stats, setStats] = useState<DonationStats>({
    totalAmount: 0,
    completedCount: 0,
    pendingCount: 0,
    failedCount: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("ALL");

  const fetchDonations = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams();
      if (filterStatus !== "ALL") params.append("status", filterStatus);
      if (searchTerm) params.append("search", searchTerm);

      const response = await fetch(`/api/admin/donations?${params.toString()}`);

      if (!response.ok) {
        throw new Error("Erreur lors de la récupération des donations");
      }

      const data = await response.json();
      setDonations(data.donations);
      setStats(data.stats);
    } catch (error) {
      console.error("Erreur:", error);
      setError("Impossible de charger les donations");
      setDonations([]);
    } finally {
      setLoading(false);
    }
  }, [filterStatus, searchTerm]);

  useEffect(() => {
    if (!isPending && !session) {
      router.push("/login");
      return;
    }

    if (session?.user) {
      fetchDonations();
    }
  }, [session, isPending, router, fetchDonations]);

  const filteredDonations = donations.filter((donation) => {
    const matchesSearch =
      donation.donorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      donation.donorEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
      donation.announcementTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
      donation.deceasedName.toLowerCase().includes(searchTerm.toLowerCase());

    return matchesSearch;
  });

  const handleExportCSV = async () => {
    try {
      const response = await fetch("/api/admin/export/donations");

      if (!response.ok) {
        throw new Error("Erreur lors de l'export");
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `donations_${new Date().toISOString().split("T")[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error("Erreur lors de l'export:", error);
      alert("Erreur lors de l'export des données");
    }
  };

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

  if (!session) {
    return null;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <Button variant="ghost" asChild className="mb-4">
          <Link href="/admin">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Retour au tableau de bord
          </Link>
        </Button>

        <h1 className="font-display text-3xl font-bold tracking-tight text-gris-lavande">
          Gestion des donations
        </h1>
        <p className="font-body text-muted-foreground">
          Suivi et gestion de toutes les donations effectuées sur la plateforme
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Montant total</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatAmount(stats.totalAmount)}</div>
            <p className="text-xs text-muted-foreground">donations complétées</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Complétées</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.completedCount}</div>
            <p className="text-xs text-muted-foreground">paiements réussis</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">En attente</CardTitle>
            <Clock className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{stats.pendingCount}</div>
            <p className="text-xs text-muted-foreground">en cours de traitement</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Échouées</CardTitle>
            <XCircle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats.failedCount}</div>
            <p className="text-xs text-muted-foreground">paiements échoués</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Filtres et recherche</CardTitle>
            <Button onClick={handleExportCSV} variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Exporter CSV
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Rechercher par donateur, annonce ou défunt..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8"
                />
              </div>
            </div>

            <div className="flex gap-2">
              <Button
                variant={filterStatus === "ALL" ? "default" : "outline"}
                size="sm"
                onClick={() => setFilterStatus("ALL")}
              >
                Toutes
              </Button>
              <Button
                variant={filterStatus === "COMPLETED" ? "default" : "outline"}
                size="sm"
                onClick={() => setFilterStatus("COMPLETED")}
              >
                <CheckCircle className="mr-1 h-3 w-3" />
                Complétées
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
                Échouées
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Donations Table */}
      <Card>
        <CardHeader>
          <CardTitle>Liste des donations</CardTitle>
          <CardDescription>
            {loading ? "Chargement..." : `${filteredDonations.length} donation(s) trouvée(s)`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">
              <Loader2 className="h-6 w-6 animate-spin mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">Chargement des donations...</p>
            </div>
          ) : error ? (
            <div className="text-center py-8 space-y-4">
              <p className="text-red-600">{error}</p>
              <Button onClick={fetchDonations}>Réessayer</Button>
            </div>
          ) : filteredDonations.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <AlertCircle className="mx-auto h-8 w-8 mb-2" />
              <p>Aucune donation trouvée pour les critères sélectionnés.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Donateur</TableHead>
                    <TableHead>Montant</TableHead>
                    <TableHead>Annonce</TableHead>
                    <TableHead>Statut</TableHead>
                    <TableHead>Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredDonations.map((donation) => {
                    const StatusIcon = getStatusIcon(donation.status);

                    return (
                      <TableRow key={donation.id}>
                        <TableCell>
                          <div className="flex items-center space-x-3">
                            <Avatar className="h-8 w-8">
                              <AvatarFallback>
                                {donation.isAnonymous
                                  ? "?"
                                  : donation.donorName
                                      .split(" ")
                                      .map((n) => n[0])
                                      .join("")
                                      .toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-medium">
                                {donation.isAnonymous ? "Anonyme" : donation.donorName}
                              </p>
                              {!donation.isAnonymous && donation.donorEmail && (
                                <p className="text-sm text-muted-foreground">
                                  {donation.donorEmail}
                                </p>
                              )}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <span className="font-semibold">{formatAmount(donation.amount)}</span>
                        </TableCell>
                        <TableCell>
                          <div className="max-w-xs">
                            <p
                              className="font-medium text-sm truncate"
                              title={donation.announcementTitle}
                            >
                              {donation.announcementTitle}
                            </p>
                            <p className="text-xs text-muted-foreground truncate">
                              {donation.deceasedName}
                            </p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <StatusIcon className="h-3 w-3" />
                            <Badge variant={getStatusBadgeVariant(donation.status)}>
                              {statusLabels[donation.status] ?? donation.status}
                            </Badge>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm text-muted-foreground">
                            {new Date(donation.createdAt).toLocaleDateString("fr-FR")}
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
