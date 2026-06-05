"use client";

import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  MessageCircle,
  Search,
  MoreHorizontal,
  CheckCircle,
  XCircle,
  Clock,
  Flag,
  ArrowLeft,
  Loader2,
  AlertCircle,
  Download,
} from "lucide-react";
import Link from "next/link";
import { useSession } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import { 
  condolenceApiService, 
  type AdminCondolenceResponse 
} from "@/features/feature-condolence/presentation/services/condolenceApiService";

const statusLabels = {
  PENDING: "En attente",
  APPROVED: "Approuvée",
  REJECTED: "Rejetée",
  REPORTED: "Signalée",
};

const getStatusBadgeVariant = (status: string) => {
  switch (status) {
    case "APPROVED":
      return "default";
    case "PENDING":
      return "secondary";
    case "REJECTED":
      return "destructive";
    case "REPORTED":
      return "destructive";
    default:
      return "outline";
  }
};

const getStatusIcon = (status: string) => {
  switch (status) {
    case "APPROVED":
      return CheckCircle;
    case "PENDING":
      return Clock;
    case "REJECTED":
      return XCircle;
    case "REPORTED":
      return Flag;
    default:
      return MessageCircle;
  }
};

export default function CondolencesPage() {
  const { data: session, isPending } = useSession();
  const router = useRouter();
  const [condolences, setCondolences] = useState<AdminCondolenceResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("PENDING");
  const [selectedCondolence, setSelectedCondolence] = useState<AdminCondolenceResponse | null>(null);
  const [rejectionReason, setRejectionReason] = useState("");
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [processingIds, setProcessingIds] = useState<Set<string>>(new Set());

  const fetchCondolences = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const condolencesData = await condolenceApiService.getAdminCondolences({
        status: filterStatus !== "ALL" ? filterStatus : undefined,
        search: searchTerm || undefined,
        limit: 100,
        offset: 0
      });

      setCondolences(condolencesData);
    } catch (error) {
      console.error("Erreur lors de la récupération des condoléances:", error);
      setError("Impossible de charger les condoléances");
      setCondolences([]);
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
      fetchCondolences();
    }
  }, [session, isPending, router, fetchCondolences]);

  const filteredCondolences = condolences.filter((condolence) => {
    const matchesSearch =
      (condolence.content || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (condolence.author || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (condolence.announcementTitle || '').toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = filterStatus === "ALL" || condolence.status === filterStatus;

    return matchesSearch && matchesStatus;
  });

  const handleExportCSV = async () => {
    try {
      const params = new URLSearchParams();
      if (filterStatus === "APPROVED") {
        params.append('approved', 'true');
      } else if (filterStatus === "PENDING") {
        params.append('approved', 'false');
      }

      const response = await fetch(`/api/admin/export/condolences?${params.toString()}`);

      if (!response.ok) {
        throw new Error('Erreur lors de l\'export');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `condoleances_${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Erreur lors de l\'export:', error);
      alert('Erreur lors de l\'export des données');
    }
  };

  const handleApprove = async (condolenceId: string) => {
    try {
      setProcessingIds(prev => new Set(prev).add(condolenceId));
      
      await condolenceApiService.approveCondolence(condolenceId);
      
      // Rafraîchir la liste
      await fetchCondolences();
    } catch (error) {
      console.error("Erreur lors de l'approbation:", error);
      alert("Erreur lors de l'approbation de la condoléance");
    } finally {
      setProcessingIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(condolenceId);
        return newSet;
      });
    }
  };

  const handleReject = async (condolenceId: string) => {
    try {
      setProcessingIds(prev => new Set(prev).add(condolenceId));
      
      await condolenceApiService.rejectCondolence(condolenceId);
      
      // Rafraîchir la liste
      await fetchCondolences();
      setRejectionReason("");
      setSelectedCondolence(null);
      setShowRejectDialog(false);
    } catch (error) {
      console.error("Erreur lors du rejet:", error);
      alert("Erreur lors du rejet de la condoléance");
    } finally {
      setProcessingIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(condolenceId);
        return newSet;
      });
    }
  };

  const openRejectDialog = (condolence: AdminCondolenceResponse) => {
    setSelectedCondolence(condolence);
    setShowRejectDialog(true);
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
        
        <h1 className="font-display text-3xl font-bold tracking-tight text-gris-lavande">Gestion des condoléances</h1>
        <p className="font-body text-muted-foreground">
          Modération et approbation des condoléances soumises
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total</CardTitle>
            <MessageCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{condolences.length}</div>
            <p className="text-xs text-muted-foreground">
              condoléances soumises
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
              {condolences.filter(c => c.status === "PENDING").length}
            </div>
            <p className="text-xs text-muted-foreground">
              à modérer
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Approuvées</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {condolences.filter(c => c.status === "APPROVED").length}
            </div>
            <p className="text-xs text-muted-foreground">
              validées
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Signalées</CardTitle>
            <Flag className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {condolences.filter(c => c.status === "REPORTED").length}
            </div>
            <p className="text-xs text-muted-foreground">
              nécessitent attention
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
                  placeholder="Rechercher par contenu, auteur ou annonce..."
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
                variant={filterStatus === "PENDING" ? "default" : "outline"} 
                size="sm"
                onClick={() => setFilterStatus("PENDING")}
              >
                <Clock className="mr-1 h-3 w-3" />
                En attente
              </Button>
              <Button 
                variant={filterStatus === "APPROVED" ? "default" : "outline"} 
                size="sm"
                onClick={() => setFilterStatus("APPROVED")}
              >
                <CheckCircle className="mr-1 h-3 w-3" />
                Approuvées
              </Button>
              <Button 
                variant={filterStatus === "REPORTED" ? "default" : "outline"} 
                size="sm"
                onClick={() => setFilterStatus("REPORTED")}
              >
                <Flag className="mr-1 h-3 w-3" />
                Signalées
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Condolences Table */}
      <Card>
        <CardHeader>
          <CardTitle>Liste des condoléances</CardTitle>
          <CardDescription>
            {loading ? "Chargement..." : `${filteredCondolences.length} condoléance(s) trouvée(s)`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">
              <Loader2 className="h-6 w-6 animate-spin mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">Chargement des condoléances...</p>
            </div>
          ) : error ? (
            <div className="text-center py-8 space-y-4">
              <p className="text-red-600">{error}</p>
              <Button onClick={fetchCondolences}>Réessayer</Button>
            </div>
          ) : filteredCondolences.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <AlertCircle className="mx-auto h-8 w-8 mb-2" />
              <p>Aucune condoléance trouvée pour les critères sélectionnés.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Auteur</TableHead>
                    <TableHead>Contenu</TableHead>
                    <TableHead>Annonce</TableHead>
                    <TableHead>Statut</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredCondolences.map((condolence) => {
                    const StatusIcon = getStatusIcon(condolence.status);
                    const isProcessing = processingIds.has(condolence.id);
                    
                    return (
                      <TableRow key={condolence.id}>
                        <TableCell>
                          <div className="flex items-center space-x-3">
                            <Avatar className="h-8 w-8">
                              <AvatarFallback>
                                {condolence.author.split(' ').map(n => n[0]).join('').toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-medium">{condolence.author}</p>
                              {condolence.authorEmail && (
                                <p className="text-sm text-muted-foreground">
                                  {condolence.authorEmail}
                                </p>
                              )}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="max-w-xs">
                            <p className="text-sm truncate" title={condolence.content}>
                              {condolence.content}
                            </p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="max-w-xs">
                            <p className="font-medium text-sm truncate" title={condolence.announcementTitle}>
                              {condolence.announcementTitle}
                            </p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <StatusIcon className="h-3 w-3" />
                            <Badge variant={getStatusBadgeVariant(condolence.status)}>
                              {statusLabels[condolence.status as keyof typeof statusLabels]}
                            </Badge>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm text-muted-foreground">
                            {new Date(condolence.createdAt).toLocaleDateString('fr-FR')}
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" className="h-8 w-8 p-0" disabled={isProcessing}>
                                {isProcessing ? (
                                  <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                  <MoreHorizontal className="h-4 w-4" />
                                )}
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuLabel>Actions</DropdownMenuLabel>
                              <DropdownMenuSeparator />
                              
                              {condolence.status === "PENDING" && (
                                <>
                                  <DropdownMenuItem 
                                    onClick={() => handleApprove(condolence.id)}
                                    disabled={isProcessing}
                                    className="text-green-600"
                                  >
                                    <CheckCircle className="mr-2 h-4 w-4" />
                                    Approuver
                                  </DropdownMenuItem>
                                  <DropdownMenuItem 
                                    onClick={() => openRejectDialog(condolence)}
                                    disabled={isProcessing}
                                    className="text-red-600"
                                  >
                                    <XCircle className="mr-2 h-4 w-4" />
                                    Rejeter
                                  </DropdownMenuItem>
                                </>
                              )}
                              
                              {condolence.status === "APPROVED" && (
                                <DropdownMenuItem 
                                  onClick={() => openRejectDialog(condolence)}
                                  disabled={isProcessing}
                                  className="text-orange-600"
                                >
                                  <XCircle className="mr-2 h-4 w-4" />
                                  Retirer l&apos;approbation
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

      {/* Reject Dialog */}
      <Dialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Rejeter la condoléance</DialogTitle>
            <DialogDescription>
              Veuillez indiquer la raison du rejet de cette condoléance.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <Textarea
              placeholder="Raison du rejet..."
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              rows={3}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowRejectDialog(false)}>
              Annuler
            </Button>
            <Button 
              variant="destructive" 
              onClick={() => selectedCondolence && handleReject(selectedCondolence.id)}
              disabled={!rejectionReason.trim()}
            >
              Rejeter
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
} 