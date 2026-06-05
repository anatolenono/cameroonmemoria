"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Wallet,
  Heart,
  Loader2,
  CheckCircle,
  Clock,
  XCircle,
  ArrowLeft,
  DollarSign,
  ChevronDown,
  ChevronRight,
  Users,
} from "lucide-react";
import Link from "next/link";
import { useSession } from "@/lib/auth-client";
import { useRouter } from "next/navigation";

interface DonationItem {
  id: string;
  amount: number;
  isAnonymous: boolean;
  donorName: string;
  donorEmail: string | null;
  status: string;
  createdAt: string;
}

interface AnnouncementGroup {
  announcementId: string;
  announcementTitle: string;
  deceasedName: string;
  announcementStatus: string;
  completedAmount: number;
  pendingAmount: number;
  completedCount: number;
  pendingCount: number;
  donationCount: number;
  donations: DonationItem[];
}

interface WalletData {
  wallet: {
    balance: number;
    currency: string;
  };
  totalReceived: number;
  totalDonations: number;
  announcementGroups: AnnouncementGroup[];
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

const getInitials = (name: string) => {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
};

export default function WalletPage() {
  const { data: session, isPending } = useSession();
  const router = useRouter();
  const [data, setData] = useState<WalletData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (!isPending && !session) {
      router.push("/login");
      return;
    }

    if (session?.user) {
      fetchWallet();
    }
  }, [session, isPending, router]);

  const fetchWallet = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch("/api/wallet");
      if (!response.ok) throw new Error("Erreur lors de la récupération");
      const walletData = await response.json();
      setData(walletData);
    } catch (err) {
      console.error("Erreur:", err);
      setError("Impossible de charger les données du portefeuille");
    } finally {
      setLoading(false);
    }
  };

  const toggleGroup = (announcementId: string) => {
    setExpandedGroups((prev) => {
      const next = new Set(prev);
      if (next.has(announcementId)) {
        next.delete(announcementId);
      } else {
        next.add(announcementId);
      }
      return next;
    });
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
    <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8 space-y-6">
      {/* Header */}
      <div>
        <Button variant="ghost" asChild className="mb-4">
          <Link href="/profile">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Retour au profil
          </Link>
        </Button>

        <h1 className="font-display text-3xl font-bold tracking-tight text-gris-lavande">
          Mon portefeuille
        </h1>
        <p className="font-body text-muted-foreground">
          Suivi des donations reçues sur vos annonces
        </p>

        <div className="flex flex-wrap gap-3 mt-4">
          <Button variant="outline" asChild>
            <Link href="/profile/wallet/history">
              <Wallet className="mr-2 h-4 w-4" />
              Voir l&apos;historique des transactions
            </Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/profile/donations">
              <Heart className="mr-2 h-4 w-4" />
              Mes donations effectuées
            </Link>
          </Button>
        </div>
      </div>

      {error ? (
        <Card>
          <CardContent className="text-center py-8 space-y-4">
            <p className="text-red-600">{error}</p>
            <Button onClick={fetchWallet}>Réessayer</Button>
          </CardContent>
        </Card>
      ) : data ? (
        <>
          {/* Balance Cards */}
          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Solde disponible</CardTitle>
                <Wallet className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">
                  {formatAmount(data.wallet.balance)}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total reçu</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatAmount(data.totalReceived)}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Donations</CardTitle>
                <Heart className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{data.totalDonations}</div>
                <p className="text-xs text-muted-foreground">
                  sur {data.announcementGroups.length} annonce
                  {data.announcementGroups.length > 1 ? "s" : ""}
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Donations grouped by announcement */}
          <div>
            <h2 className="font-display text-xl font-semibold mb-4 flex items-center gap-2">
              <Heart className="h-5 w-5" />
              Donations par annonce
            </h2>

            {data.announcementGroups.length === 0 ? (
              <Card>
                <CardContent className="text-center py-12 text-muted-foreground">
                  <Heart className="mx-auto h-10 w-10 mb-3 opacity-40" />
                  <p className="text-lg font-medium">Aucune donation reçue</p>
                  <p className="text-sm mt-1">
                    Les donations apparaîtront ici lorsque quelqu&apos;un fera un don sur une de vos
                    annonces.
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {data.announcementGroups.map((group) => {
                  const isExpanded = expandedGroups.has(group.announcementId);

                  return (
                    <Card key={group.announcementId} className="overflow-hidden">
                      {/* Announcement header */}
                      <button
                        onClick={() => toggleGroup(group.announcementId)}
                        className="w-full text-left"
                      >
                        <CardHeader className="hover:bg-muted/30 transition-colors cursor-pointer">
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex items-start gap-3 min-w-0">
                              {isExpanded ? (
                                <ChevronDown className="h-5 w-5 shrink-0 text-muted-foreground mt-0.5" />
                              ) : (
                                <ChevronRight className="h-5 w-5 shrink-0 text-muted-foreground mt-0.5" />
                              )}
                              <div className="min-w-0">
                                <CardTitle className="text-base truncate">
                                  {group.announcementTitle}
                                </CardTitle>
                                <CardDescription className="mt-1">
                                  {group.deceasedName}
                                </CardDescription>
                              </div>
                            </div>

                            <div className="shrink-0 text-right space-y-1">
                              <p className="text-lg font-bold text-green-600">
                                {formatAmount(group.completedAmount)}
                              </p>
                              <div className="flex items-center gap-2 justify-end text-xs text-muted-foreground">
                                <span className="flex items-center gap-1">
                                  <Users className="h-3 w-3" />
                                  {group.donationCount}
                                </span>
                                {group.pendingCount > 0 && (
                                  <Badge variant="secondary" className="text-xs px-1.5 py-0">
                                    {group.pendingCount} en attente
                                  </Badge>
                                )}
                              </div>
                            </div>
                          </div>
                        </CardHeader>
                      </button>

                      {/* Expanded: individual donations */}
                      {isExpanded && (
                        <CardContent className="border-t pt-4 space-y-3">
                          {group.donations.map((donation) => {
                            const StatusIcon = getStatusIcon(donation.status);

                            return (
                              <div
                                key={donation.id}
                                className="flex items-center justify-between py-3 px-3 rounded-lg bg-muted/30"
                              >
                                <div className="flex items-center gap-3 min-w-0">
                                  <Avatar className="h-9 w-9">
                                    <AvatarFallback className="text-xs">
                                      {donation.isAnonymous ? "?" : getInitials(donation.donorName)}
                                    </AvatarFallback>
                                  </Avatar>
                                  <div className="min-w-0">
                                    <p className="font-medium text-sm">{donation.donorName}</p>
                                    <p className="text-xs text-muted-foreground">
                                      {new Date(donation.createdAt).toLocaleDateString("fr-FR", {
                                        day: "numeric",
                                        month: "long",
                                        year: "numeric",
                                      })}
                                    </p>
                                  </div>
                                </div>

                                <div className="flex items-center gap-3 shrink-0">
                                  <div className="flex items-center gap-1">
                                    <StatusIcon className="h-3 w-3" />
                                    <Badge variant={getStatusBadgeVariant(donation.status)}>
                                      {statusLabels[donation.status] ?? donation.status}
                                    </Badge>
                                  </div>
                                  <p className="font-semibold text-sm min-w-[100px] text-right">
                                    {formatAmount(donation.amount)}
                                  </p>
                                </div>
                              </div>
                            );
                          })}

                          {/* Group summary footer */}
                          <div className="flex items-center justify-between pt-2 border-t text-sm">
                            <span className="text-muted-foreground">
                              {group.completedCount} donation{group.completedCount > 1 ? "s" : ""}{" "}
                              complétée{group.completedCount > 1 ? "s" : ""}
                            </span>
                            <span className="font-bold text-green-600">
                              Total: {formatAmount(group.completedAmount)}
                            </span>
                          </div>
                        </CardContent>
                      )}
                    </Card>
                  );
                })}
              </div>
            )}
          </div>
        </>
      ) : null}
    </div>
  );
}
