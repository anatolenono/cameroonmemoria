"use client";

import { useEffect, useState, useCallback } from "react";
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  ArrowLeft,
  Search,
  Eye,
  CheckCircle,
  XCircle,
  Clock,
  Calendar,
  Heart,
  Loader2,
  AlertCircle,
  MoreHorizontal,
  Filter,
  Download
} from "lucide-react";
import Link from "next/link";
import { useSession } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import { CreateAnnouncementResponse } from "@/features/feature-announcement";

interface AnnouncementWithModerationInfo extends CreateAnnouncementResponse {
  submittedAt: string;
  submitterName?: string;
  submitterEmail?: string;
  moderationNotes?: string;
}

export default function AdminAnnouncementsPage() {
  const { data: session, isPending } = useSession();
  const router = useRouter();
  const [announcements, setAnnouncements] = useState<AnnouncementWithModerationInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<"ALL" | "PENDING" | "PUBLISHED" | "REJECTED">("PENDING");
  const [processingIds, setProcessingIds] = useState<Set<string>>(new Set());

  const fetchAnnouncements = useCallback(async () => {
    try {
      setLoading(true);
      
      // Construire l'URL avec les paramètres de requête
      const params = new URLSearchParams();
      if (statusFilter !== "ALL") {
        params.append('status', statusFilter);
      }
      if (searchTerm) {
        params.append('search', searchTerm);
      }
      params.append('limit', '50');
      params.append('offset', '0');

      const response = await fetch(`/api/admin/announcements?${params.toString()}`);
      
      if (!response.ok) {
        throw new Error('Erreur lors de la récupération des annonces');
      }

      const data = await response.json();
      setAnnouncements(data.announcements);
    } catch (error) {
      console.error("Erreur lors de la récupération des annonces:", error);
      // En cas d'erreur, garder la liste vide
      setAnnouncements([]);
    } finally {
      setLoading(false);
    }
  }, [statusFilter, searchTerm]);

  useEffect(() => {
    if (!isPending && !session) {
      router.push("/login");
      return;
    }

    if (session?.user) {
      fetchAnnouncements();
    }
  }, [session, isPending, router, fetchAnnouncements]);

  const handleApprove = async (announcementId: string) => {
    try {
      setProcessingIds(prev => new Set(prev).add(announcementId));
      
      // Appeler l'API de publication
      const response = await fetch(`/api/announcements/${announcementId}/publish`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Erreur lors de l\'approbation');
      }

      // Rafraîchir la liste
      await fetchAnnouncements();
    } catch (error) {
      console.error("Erreur lors de l'approbation:", error);
      alert("Erreur lors de l'approbation de l'annonce");
    } finally {
      setProcessingIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(announcementId);
        return newSet;
      });
    }
  };

  const handleReject = async (announcementId: string) => {
    try {
      setProcessingIds(prev => new Set(prev).add(announcementId));
      
      // Appeler l'API de rejet
      const response = await fetch(`/api/announcements/${announcementId}/reject`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Erreur lors du rejet');
      }

      // Rafraîchir la liste
      await fetchAnnouncements();
    } catch (error) {
      console.error("Erreur lors du rejet:", error);
      alert("Erreur lors du rejet de l'annonce");
    } finally {
      setProcessingIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(announcementId);
        return newSet;
      });
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "PENDING":
        return <Badge variant="secondary" className="bg-orange-100 text-orange-800">En attente</Badge>;
      case "PUBLISHED":
        return <Badge variant="default" className="bg-green-100 text-green-800">Publié</Badge>;
      case "REJECTED":
        return <Badge variant="destructive" className="bg-red-100 text-red-800">Rejeté</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "PENDING":
        return Clock;
      case "PUBLISHED":
        return CheckCircle;
      case "REJECTED":
        return XCircle;
      default:
        return AlertCircle;
    }
  };

  const filteredAnnouncements = announcements.filter(announcement =>
    announcement.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    announcement.deceasedName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (announcement.submitterName && announcement.submitterName.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleExportCSV = async () => {
    try {
      const params = new URLSearchParams();
      if (statusFilter !== "ALL") {
        params.append('status', statusFilter);
      }

      const response = await fetch(`/api/admin/export/announcements?${params.toString()}`);

      if (!response.ok) {
        throw new Error('Erreur lors de l\'export');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `annonces_${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Erreur lors de l\'export:', error);
      alert('Erreur lors de l\'export des données');
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
        
        <h1 className="font-display text-3xl font-bold tracking-tight text-gris-lavande">Gestion des annonces</h1>
        <p className="font-body text-muted-foreground">
          Modération et approbation des annonces soumises
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total</CardTitle>
            <AlertCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{announcements.length}</div>
            <p className="text-xs text-muted-foreground">
              annonces soumises
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
              {announcements.filter(a => a.status === "PENDING").length}
            </div>
            <p className="text-xs text-muted-foreground">
              à modérer
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Publiées</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {announcements.filter(a => a.status === "PUBLISHED").length}
            </div>
            <p className="text-xs text-muted-foreground">
              approuvées
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Rejetées</CardTitle>
            <XCircle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {announcements.filter(a => a.status === "REJECTED").length}
            </div>
            <p className="text-xs text-muted-foreground">
              refusées
            </p>
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
                  placeholder="Rechercher par titre, défunt ou soumetteur..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8"
                />
              </div>
            </div>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  <Filter className="h-4 w-4 mr-2" />
                  Statut: {statusFilter === "ALL" ? "Tous" :
                    statusFilter === "PENDING" ? "En attente" :
                    statusFilter === "PUBLISHED" ? "Publiées" : "Rejetées"}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={() => setStatusFilter("ALL")}>
                  Tous les statuts
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setStatusFilter("PENDING")}>
                  En attente
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setStatusFilter("PUBLISHED")}>
                  Publiées
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setStatusFilter("REJECTED")}>
                  Rejetées
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </CardContent>
      </Card>

      {/* Announcements Table */}
      <Card>
        <CardHeader>
          <CardTitle>Liste des annonces</CardTitle>
          <CardDescription>
            {loading ? "Chargement..." : `${filteredAnnouncements.length} annonce(s) trouvée(s)`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">
              <Loader2 className="h-6 w-6 animate-spin mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">Chargement des annonces...</p>
            </div>
          ) : filteredAnnouncements.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <AlertCircle className="mx-auto h-8 w-8 mb-2" />
              <p>Aucune annonce trouvée pour les critères sélectionnés.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="">Annonce</TableHead>
                    <TableHead className="">Défunt</TableHead>
                    <TableHead className="">Type</TableHead>
                    <TableHead className="">Statut</TableHead>
                    <TableHead className="">Soumetteur</TableHead>
                    <TableHead className="">Date</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredAnnouncements.map((announcement) => {
                    const StatusIcon = getStatusIcon(announcement.status);
                    return (
                      <TableRow key={announcement.id}>
                        <TableCell className="">
                          <div>
                            <div className="font-medium truncate">{announcement.title}</div>
                            <div className="text-sm text-muted-foreground truncate max-w-[250px]">
                              {announcement.description}
                            </div>
                            {announcement.ceremonyDate && (
                              <div className="text-xs text-muted-foreground flex items-center mt-1">
                                <Calendar className="h-3 w-3 mr-1" />
                                {new Date(announcement.ceremonyDate).toLocaleDateString('fr-FR')}
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="">
                          <div className="flex items-center">
                            <Heart className="h-3 w-3 mr-1 text-muted-foreground" />
                            <span className="font-medium truncate">{announcement.deceasedName}</span>
                          </div>
                        </TableCell>
                        <TableCell className="">
                          <Badge variant="outline" className={
                            announcement.type === 'DEATH_NOTICE'
                              ? 'bg-purple-100 text-purple-800'
                              : announcement.type === 'FUNERAL'
                              ? 'bg-slate-100 text-slate-800'
                              : announcement.type === 'THANKS'
                              ? 'bg-green-100 text-green-800'
                              : 'bg-blue-100 text-blue-800'
                          }>
                            {announcement.type === 'DEATH_NOTICE' ? 'Avis de décès' :
                             announcement.type === 'FUNERAL' ? 'Funérailles' :
                             announcement.type === 'THANKS' ? 'Remerciements' : 'Anniversaire'}
                          </Badge>
                        </TableCell>
                        <TableCell className="">
                          <div className="flex items-center gap-1">
                            <StatusIcon className="h-3 w-3" />
                            {getStatusBadge(announcement.status)}
                          </div>
                        </TableCell>
                        <TableCell className="">
                          <div>
                            <div className="font-medium truncate">
                              {announcement.isAnonymous ? "Anonyme" : announcement.submitterName}
                            </div>
                            {!announcement.isAnonymous && announcement.submitterEmail && (
                              <div className="text-sm text-muted-foreground truncate">
                                {announcement.submitterEmail}
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="">
                          <div className="text-sm text-muted-foreground">
                            {new Date(announcement.submittedAt).toLocaleDateString('fr-FR')}
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" className="h-8 w-8 p-0">
                                <span className="sr-only">Ouvrir le menu</span>
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuLabel>Actions</DropdownMenuLabel>
                              <DropdownMenuItem asChild>
                                <Link href={`/announcements/${announcement.id}`}>
                                  <Eye className="mr-2 h-4 w-4" />
                                  Voir les détails
                                </Link>
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              
                              {announcement.status === "PENDING" && (
                                <>
                                  <DropdownMenuItem 
                                    onClick={() => handleApprove(announcement.id)}
                                    disabled={processingIds.has(announcement.id)}
                                    className="text-green-600"
                                  >
                                    {processingIds.has(announcement.id) ? (
                                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    ) : (
                                      <CheckCircle className="mr-2 h-4 w-4" />
                                    )}
                                    Approuver
                                  </DropdownMenuItem>
                                  <DropdownMenuItem 
                                    onClick={() => handleReject(announcement.id)}
                                    disabled={processingIds.has(announcement.id)}
                                    className="text-red-600"
                                  >
                                    {processingIds.has(announcement.id) ? (
                                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    ) : (
                                      <XCircle className="mr-2 h-4 w-4" />
                                    )}
                                    Rejeter
                                  </DropdownMenuItem>
                                </>
                              )}
                              
                              {announcement.status === "PUBLISHED" && (
                                <DropdownMenuItem 
                                  onClick={() => handleReject(announcement.id)}
                                  disabled={processingIds.has(announcement.id)}
                                  className="text-orange-600"
                                >
                                  {processingIds.has(announcement.id) ? (
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                  ) : (
                                    <XCircle className="mr-2 h-4 w-4" />
                                  )}
                                  Retirer la publication
                                </DropdownMenuItem>
                              )}
                              
                              {announcement.status === "REJECTED" && (
                                <DropdownMenuItem 
                                  onClick={() => handleApprove(announcement.id)}
                                  disabled={processingIds.has(announcement.id)}
                                  className="text-green-600"
                                >
                                  {processingIds.has(announcement.id) ? (
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                  ) : (
                                    <CheckCircle className="mr-2 h-4 w-4" />
                                  )}
                                  Réapprouver
                                </DropdownMenuItem>
                              )}
                            </DropdownMenuContent>
                          </DropdownMenu>
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