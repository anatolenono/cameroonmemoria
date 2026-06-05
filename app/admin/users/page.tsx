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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Users,
  Search,
  MoreHorizontal,
  UserCheck,
  UserX,
  Shield,
  Mail,
  ArrowLeft,
  Loader2,
  Download,
} from "lucide-react";
import Link from "next/link";
import { useSession } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import { 
  announcementApiService, 
  type AdminUser 
} from "@/features/feature-announcement/presentation/services/announcementApiService";

const roleLabels = {
  USER: "Utilisateur",
  MODERATOR: "Modérateur",
  ADMIN: "Administrateur",
};

const statusLabels = {
  ACTIVE: "Actif",
  SUSPENDED: "Suspendu",
  BANNED: "Banni",
};

const getRoleBadgeVariant = (role: string) => {
  switch (role) {
    case "ADMIN":
      return "destructive";
    case "MODERATOR":
      return "default";
    default:
      return "secondary";
  }
};

const getStatusBadgeVariant = (status: string) => {
  switch (status) {
    case "ACTIVE":
      return "default";
    case "SUSPENDED":
      return "secondary";
    case "BANNED":
      return "destructive";
    default:
      return "outline";
  }
};

export default function UsersPage() {
  const { data: session, isPending } = useSession();
  const router = useRouter();
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterRole, setFilterRole] = useState("ALL");
  const [filterStatus, setFilterStatus] = useState("ALL");
  const [processingIds, setProcessingIds] = useState<Set<string>>(new Set());

  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const usersData = await announcementApiService.getAdminUsers({
        search: searchTerm || undefined,
        role: filterRole !== "ALL" ? filterRole : undefined,
        status: filterStatus !== "ALL" ? filterStatus : undefined,
        limit: 100,
        offset: 0
      });

      setUsers(usersData);
    } catch (error) {
      console.error("Erreur lors de la récupération des utilisateurs:", error);
      setError("Impossible de charger les utilisateurs");
      setUsers([]);
    } finally {
      setLoading(false);
    }
  }, [searchTerm, filterRole, filterStatus]);

  useEffect(() => {
    if (!isPending && !session) {
      router.push("/login");
      return;
    }

    if (session?.user) {
      fetchUsers();
    }
  }, [session, isPending, router, fetchUsers]);

  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesRole = filterRole === "ALL" || user.role === filterRole;
    const matchesStatus = filterStatus === "ALL" || user.status === filterStatus;

    return matchesSearch && matchesRole && matchesStatus;
  });

  const handleExportCSV = async () => {
    try {
      const response = await fetch('/api/admin/export/users');

      if (!response.ok) {
        throw new Error('Erreur lors de l\'export');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `utilisateurs_${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Erreur lors de l\'export:', error);
      alert('Erreur lors de l\'export des données');
    }
  };

  const handleUserAction = async (userId: string, action: string) => {
    try {
      setProcessingIds(prev => new Set(prev).add(userId));
      
      await announcementApiService.performUserAction(userId, action);
      
      // Rafraîchir la liste
      await fetchUsers();
    } catch (error) {
      console.error(`Erreur lors de l'action ${action}:`, error);
      alert(`Erreur lors de l'action ${action}`);
    } finally {
      setProcessingIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(userId);
        return newSet;
      });
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
        
        <h1 className="text-3xl font-bold tracking-tight">Gestion des utilisateurs</h1>
        <p className="text-muted-foreground">
          Gérer les comptes utilisateurs et leurs permissions
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total utilisateurs</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{users.length}</div>
            <p className="text-xs text-muted-foreground">
              utilisateurs enregistrés
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Utilisateurs actifs</CardTitle>
            <UserCheck className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {users.filter(u => u.status === "ACTIVE").length}
            </div>
            <p className="text-xs text-muted-foreground">
              {users.length > 0 ? Math.round((users.filter(u => u.status === "ACTIVE").length / users.length) * 100) : 0}% du total
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Modérateurs</CardTitle>
            <Shield className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {users.filter(u => u.role === "MODERATOR" || u.role === "ADMIN").length}
            </div>
            <p className="text-xs text-muted-foreground">
              Équipe de modération
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Suspendus</CardTitle>
            <UserX className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {users.filter(u => u.status === "SUSPENDED" || u.status === "BANNED").length}
            </div>
            <p className="text-xs text-muted-foreground">
              Nécessitent attention
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Rechercher par nom ou email..."
            className="pl-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <Button onClick={handleExportCSV} variant="outline" size="sm">
          <Download className="h-4 w-4 mr-2" />
          Exporter CSV
        </Button>

        <div className="flex gap-2">
          <Button 
            variant={filterRole === "ALL" ? "default" : "outline"} 
            size="sm"
            onClick={() => setFilterRole("ALL")}
          >
            Tous les rôles
          </Button>
          <Button 
            variant={filterRole === "USER" ? "default" : "outline"} 
            size="sm"
            onClick={() => setFilterRole("USER")}
          >
            Utilisateurs
          </Button>
          <Button 
            variant={filterRole === "MODERATOR" ? "default" : "outline"} 
            size="sm"
            onClick={() => setFilterRole("MODERATOR")}
          >
            Modérateurs
          </Button>
        </div>
        
        <div className="flex gap-2">
          <Button 
            variant={filterStatus === "ALL" ? "default" : "outline"} 
            size="sm"
            onClick={() => setFilterStatus("ALL")}
          >
            Tous statuts
          </Button>
          <Button 
            variant={filterStatus === "ACTIVE" ? "default" : "outline"} 
            size="sm"
            onClick={() => setFilterStatus("ACTIVE")}
          >
            <UserCheck className="mr-1 h-3 w-3" />
            Actifs
          </Button>
          <Button 
            variant={filterStatus === "SUSPENDED" ? "default" : "outline"} 
            size="sm"
            onClick={() => setFilterStatus("SUSPENDED")}
          >
            <UserX className="mr-1 h-3 w-3" />
            Suspendus
          </Button>
        </div>
      </div>

      {/* Users Table */}
      <Card>
        <CardHeader>
          <CardTitle>Liste des utilisateurs</CardTitle>
          <CardDescription>
            {filteredUsers.length} utilisateur{filteredUsers.length > 1 ? 's' : ''} trouvé{filteredUsers.length > 1 ? 's' : ''}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="text-center space-y-4">
                <Loader2 className="h-8 w-8 animate-spin mx-auto" />
                <p className="text-muted-foreground">Chargement des utilisateurs...</p>
              </div>
            </div>
          ) : error ? (
            <div className="text-center py-8 space-y-4">
              <p className="text-red-600">{error}</p>
              <Button onClick={fetchUsers}>Réessayer</Button>
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">Aucun utilisateur trouvé</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Utilisateur</TableHead>
                  <TableHead>Rôle</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead>Annonces</TableHead>
                  <TableHead>Dernière connexion</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.map((user) => {
                  const isProcessing = processingIds.has(user.id);
                  
                  return (
                    <TableRow key={user.id}>
                      <TableCell>
                        <div className="flex items-center space-x-3">
                          <Avatar className="h-8 w-8">
                            <AvatarImage src={user.avatar} alt={user.name} />
                            <AvatarFallback>
                              {user.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium">{user.name}</p>
                            <p className="text-sm text-muted-foreground flex items-center">
                              <Mail className="mr-1 h-3 w-3" />
                              {user.email}
                            </p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={getRoleBadgeVariant(user.role)}>
                          {roleLabels[user.role as keyof typeof roleLabels]}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={getStatusBadgeVariant(user.status)}>
                          {statusLabels[user.status as keyof typeof statusLabels]}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          {user.announcementsCount} annonce{user.announcementsCount > 1 ? 's' : ''}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          {user.lastLogin ? (
                            <>
                              <div>{new Date(user.lastLogin).toLocaleDateString('fr-FR')}</div>
                              <div className="text-xs text-muted-foreground">
                                {new Date(user.lastLogin).toLocaleTimeString('fr-FR')}
                              </div>
                            </>
                          ) : (
                            <span className="text-muted-foreground">Jamais</span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm" disabled={isProcessing}>
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
                            
                            {user.status === "ACTIVE" && (
                              <DropdownMenuItem 
                                onClick={() => handleUserAction(user.id, "suspend")}
                                disabled={isProcessing}
                              >
                                <UserX className="mr-2 h-4 w-4 text-orange-600" />
                                Suspendre
                              </DropdownMenuItem>
                            )}
                            
                            {user.status === "SUSPENDED" && (
                              <DropdownMenuItem 
                                onClick={() => handleUserAction(user.id, "activate")}
                                disabled={isProcessing}
                              >
                                <UserCheck className="mr-2 h-4 w-4 text-green-600" />
                                Réactiver
                              </DropdownMenuItem>
                            )}
                            
                            {user.status !== "BANNED" && (
                              <DropdownMenuItem 
                                onClick={() => handleUserAction(user.id, "ban")}
                                disabled={isProcessing}
                              >
                                <UserX className="mr-2 h-4 w-4 text-red-600" />
                                Bannir
                              </DropdownMenuItem>
                            )}
                            
                            {user.role === "USER" && (
                              <DropdownMenuItem 
                                onClick={() => handleUserAction(user.id, "promote_moderator")}
                                disabled={isProcessing}
                              >
                                <Shield className="mr-2 h-4 w-4 text-blue-600" />
                                Promouvoir modérateur
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
          )}
        </CardContent>
      </Card>
    </div>
  );
} 