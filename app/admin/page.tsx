"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Users, 
  FileText, 
  MessageCircle, 
  Clock, 
  CheckCircle, 
  XCircle,
  Eye,
  AlertTriangle,
  TrendingUp,
  Loader2,
  Heart
} from "lucide-react";
import Link from "next/link";
import { useSession } from "@/lib/auth-client";
import { announcementApiService, type AdminStats } from "@/features/feature-announcement/presentation/services/announcementApiService";

export default function AdminDashboardPage() {
  const { data: session, isPending } = useSession();
  const [stats, setStats] = useState<AdminStats>({
    pendingAnnouncements: 0,
    totalAnnouncements: 0,
    publishedAnnouncements: 0,
    rejectedAnnouncements: 0,
    pendingCondolences: 0,
    totalCondolences: 0,
    totalUsers: 0,
    todaySubmissions: 0,
    weeklyGrowth: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (session?.user) {
      fetchStats();
    }
  }, [session]);

  const fetchStats = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const statsData = await announcementApiService.getAdminStats();
      setStats(statsData);
    } catch (error) {
      console.error("Erreur lors de la récupération des statistiques:", error);
      setError("Impossible de charger les statistiques");
    } finally {
      setLoading(false);
    }
  };

  if (isPending || loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin mx-auto" />
          <p className="text-muted-foreground">Chargement du tableau de bord...</p>
        </div>
      </div>
    );
  }

  if (!session) {
    return null;
  }

  if (error) {
    return (
      <div className="text-center space-y-4">
        <p className="text-red-600">{error}</p>
        <Button onClick={fetchStats}>Réessayer</Button>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="font-display text-3xl font-bold tracking-tight text-gris-lavande">
          Tableau de bord
        </h1>
        <p className="font-body text-muted-foreground">
          Vue d&apos;ensemble de l&apos;activité de modération
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">En attente</CardTitle>
            <Clock className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{stats.pendingAnnouncements}</div>
            <p className="text-xs text-muted-foreground">
              annonces à modérer
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Publiées</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.publishedAnnouncements}</div>
            <p className="text-xs text-muted-foreground">
              annonces approuvées
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Rejetées</CardTitle>
            <XCircle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats.rejectedAnnouncements}</div>
            <p className="text-xs text-muted-foreground">
              annonces refusées
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total annonces</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalAnnouncements}</div>
            <p className="text-xs text-muted-foreground">
              +{stats.todaySubmissions} aujourd&apos;hui
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Secondary Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Condoléances</CardTitle>
            <MessageCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalCondolences}</div>
            <p className="text-xs text-muted-foreground">
              {stats.pendingCondolences} en attente de modération
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Utilisateurs</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalUsers}</div>
            <p className="text-xs text-muted-foreground flex items-center">
              <TrendingUp className="h-3 w-3 mr-1 text-green-600" />
              +{stats.weeklyGrowth}% cette semaine
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Aujourd&apos;hui</CardTitle>
            <Clock className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{stats.todaySubmissions}</div>
            <p className="text-xs text-muted-foreground">
              nouvelles soumissions
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Clock className="mr-2 h-5 w-5" />
              Actions prioritaires
            </CardTitle>
            <CardDescription>
              Tâches nécessitant votre attention immédiate
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {stats.pendingAnnouncements > 0 && (
              <div className="flex items-center justify-between p-3 bg-orange-50 rounded-lg border border-orange-200">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-orange-100 rounded-full">
                    <AlertTriangle className="h-4 w-4 text-orange-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-orange-900">
                      {stats.pendingAnnouncements} annonce{stats.pendingAnnouncements > 1 ? 's' : ''} en attente
                    </p>
                    <p className="text-xs text-orange-700">
                      Modération requise
                    </p>
                  </div>
                </div>
                <Button asChild size="sm" variant="outline">
                  <Link href="/admin/announcements">
                    <Eye className="mr-1 h-3 w-3" />
                    Voir
                  </Link>
                </Button>
              </div>
            )}

            {stats.pendingCondolences > 0 && (
              <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg border border-blue-200">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-blue-100 rounded-full">
                    <MessageCircle className="h-4 w-4 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-blue-900">
                      {stats.pendingCondolences} condoléance{stats.pendingCondolences > 1 ? 's' : ''} en attente
                    </p>
                    <p className="text-xs text-blue-700">
                      Modération requise
                    </p>
                  </div>
                </div>
                <Button asChild size="sm" variant="outline">
                  <Link href="/admin/condolences">
                    <Eye className="mr-1 h-3 w-3" />
                    Voir
                  </Link>
                </Button>
              </div>
            )}

            {stats.pendingAnnouncements === 0 && stats.pendingCondolences === 0 && (
              <div className="text-center py-6 text-muted-foreground">
                <CheckCircle className="h-8 w-8 mx-auto mb-2 text-green-600" />
                <p>Aucune action prioritaire</p>
                <p className="text-xs">Toutes les modérations sont à jour</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <FileText className="mr-2 h-5 w-5" />
              Navigation rapide
            </CardTitle>
            <CardDescription>
              Accès direct aux sections principales
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button asChild variant="outline" className="w-full justify-start">
              <Link href="/admin/announcements">
                <FileText className="mr-2 h-4 w-4" />
                Gérer les annonces
                {stats.pendingAnnouncements > 0 && (
                  <Badge variant="secondary" className="ml-auto bg-orange-100 text-orange-800">
                    {stats.pendingAnnouncements}
                  </Badge>
                )}
              </Link>
            </Button>

            <Button asChild variant="outline" className="w-full justify-start">
              <Link href="/admin/condolences">
                <MessageCircle className="mr-2 h-4 w-4" />
                Gérer les condoléances
                {stats.pendingCondolences > 0 && (
                  <Badge variant="secondary" className="ml-auto bg-blue-100 text-blue-800">
                    {stats.pendingCondolences}
                  </Badge>
                )}
              </Link>
            </Button>

            <Button asChild variant="outline" className="w-full justify-start">
              <Link href="/admin/donations">
                <Heart className="mr-2 h-4 w-4" />
                Gérer les donations
              </Link>
            </Button>

            <Button asChild variant="outline" className="w-full justify-start">
              <Link href="/admin/users">
                <Users className="mr-2 h-4 w-4" />
                Gérer les utilisateurs
                <span className="ml-auto text-xs text-muted-foreground">
                  {stats.totalUsers}
                </span>
              </Link>
            </Button>

            <Button asChild variant="outline" className="w-full justify-start">
              <Link href="/admin/reports">
                <TrendingUp className="mr-2 h-4 w-4" />
                Voir les rapports
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 