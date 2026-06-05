"use client";

import { useState, useEffect } from "react";
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
  CheckCircle,
  Clock,
  XCircle,
  Heart,
  TrendingUp,
  ExternalLink,
} from "lucide-react";
import Link from "next/link";
import { useSession } from "@/lib/auth-client";
import { useRouter } from "next/navigation";

interface DonationItem {
  id: string;
  amount: number;
  message: string | null;
  isAnonymous: boolean;
  status: string;
  createdAt: string;
  announcementId: string;
  announcementTitle: string;
  deceasedName: string;
}

interface DonationsData {
  donations: DonationItem[];
  totalAmount: number;
  totalCount: number;
  completedCount: number;
  pendingCount: number;
}

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

const formatAmount = (amount: number) => {
  return amount.toLocaleString("fr-FR") + " FCFA";
};

export default function MyDonationsPage() {
  const { data: session, isPending } = useSession();
  const router = useRouter();
  const [data, setData] = useState<DonationsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isPending && !session) {
      router.push("/login");
      return;
    }

    if (session?.user) {
      fetchDonations();
    }
  }, [session, isPending, router]);

  const fetchDonations = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch("/api/donations/my");
      if (!response.ok) throw new Error("Erreur lors de la r\u00e9cup\u00e9ration");
      const result = await response.json();
      setData(result);
    } catch (err) {
      console.error("Erreur:", err);
      setError("Impossible de charger vos donations");
    } finally {
      setLoading(false);
    }
  };

  if (isPending || loading) {
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
          <Link href="/profile">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Retour au profil
          </Link>
        </Button>

        <h1 className="font-display text-3xl font-bold tracking-tight text-gris-lavande">
          Mes donations effectu\u00e9es
        </h1>
        <p className="font-body text-muted-foreground">
          Historique des donations que vous avez faites sur les annonces
        </p>
      </div>

      {error ? (
        <Card>
          <CardContent className="text-center py-8 space-y-4">
            <p className="text-red-600">{error}</p>
            <Button onClick={fetchDonations}>R\u00e9essayer</Button>
          </CardContent>
        </Card>
      ) : data ? (
        <>
          {/* Stats Cards */}
          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total donn\u00e9</CardTitle>
                <TrendingUp className="h-4 w-4 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">
                  {formatAmount(data.totalAmount)}
                </div>
                <p className="text-xs text-muted-foreground">donations compl\u00e9t\u00e9es</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Donations</CardTitle>
                <Heart className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{data.totalCount}</div>
                <p className="text-xs text-muted-foreground">
                  {data.completedCount} compl\u00e9t\u00e9e{data.completedCount > 1 ? "s" : ""}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">En attente</CardTitle>
                <Clock className="h-4 w-4 text-orange-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-orange-600">
                  {data.pendingCount}
                </div>
                <p className="text-xs text-muted-foreground">en cours de traitement</p>
              </CardContent>
            </Card>
          </div>

          {/* Donations Table */}
          <Card>
            <CardHeader>
              <CardTitle>Historique des donations</CardTitle>
              <CardDescription>
                {data.donations.length} donation(s) effectu\u00e9e(s)
              </CardDescription>
            </CardHeader>
            <CardContent>
              {data.donations.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <Heart className="mx-auto h-10 w-10 mb-3 opacity-40" />
                  <p className="text-lg font-medium">Aucune donation effectu\u00e9e</p>
                  <p className="text-sm mt-1">
                    Vos donations appara\u00eetront ici lorsque vous ferez un don sur une annonce.
                  </p>
                  <Button asChild className="mt-4">
                    <Link href="/announcements">Parcourir les annonces</Link>
                  </Button>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Annonce</TableHead>
                        <TableHead>D\u00e9funt(e)</TableHead>
                        <TableHead>Montant</TableHead>
                        <TableHead>Statut</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead className="text-right">Lien</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {data.donations.map((donation) => {
                        const StatusIcon = getStatusIcon(donation.status);

                        return (
                          <TableRow key={donation.id}>
                            <TableCell>
                              <div className="max-w-[200px]">
                                <p
                                  className="font-medium text-sm truncate"
                                  title={donation.announcementTitle}
                                >
                                  {donation.announcementTitle}
                                </p>
                              </div>
                            </TableCell>
                            <TableCell>
                              <p className="text-sm">{donation.deceasedName}</p>
                            </TableCell>
                            <TableCell>
                              <span className="font-semibold text-sm">
                                {formatAmount(donation.amount)}
                              </span>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-1">
                                <StatusIcon className="h-3 w-3" />
                                <Badge
                                  variant={getStatusBadgeVariant(donation.status)}
                                >
                                  {statusLabels[donation.status] || donation.status}
                                </Badge>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="text-sm text-muted-foreground">
                                {new Date(donation.createdAt).toLocaleDateString(
                                  "fr-FR",
                                  {
                                    day: "numeric",
                                    month: "long",
                                    year: "numeric",
                                  }
                                )}
                              </div>
                            </TableCell>
                            <TableCell className="text-right">
                              <Button variant="ghost" size="sm" asChild>
                                <Link
                                  href={`/announcements/${donation.announcementId}`}
                                >
                                  <ExternalLink className="h-4 w-4" />
                                </Link>
                              </Button>
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
        </>
      ) : null}
    </div>
  );
}
