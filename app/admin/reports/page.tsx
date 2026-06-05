"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  Users,
  MessageCircle,
  Download,
  FileText,
  ArrowLeft,
  AlertCircle,
} from "lucide-react";
import Link from "next/link";
import { useSession } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import { Area as RechartsArea, Bar as RechartsBar, CartesianGrid as RechartsCartesianGrid, XAxis as RechartsXAxis, YAxis as RechartsYAxis, ComposedChart as RechartsComposedChart } from "recharts";

// Interfaces
interface OverviewData {
  totalUsers: number;
  totalAnnouncements: number;
  totalCondolences: number;
  activeUsers: number;
  userGrowth: number;
  announcementGrowth: number;
  condolenceGrowth: number;
  todaySubmissions: number;
  thisWeekUsers: number;
}

interface MonthlyDataPoint {
  month: string;
  users: number;
  announcements: number;
  condolences: number;
}

interface Category {
  category: string;
  count: number;
  percentage: number;
}

interface Activity {
  period: string;
  active: number;
  total: number;
}

// Chart config
const chartConfig = {
  users: {
    label: "Utilisateurs",
    color: "hsl(var(--chart-1))",
  },
  announcements: {
    label: "Annonces",
    color: "hsl(var(--chart-2))",
  },
  condolences: {
    label: "Condoléances",
    color: "hsl(var(--chart-3))",
  },
} satisfies ChartConfig;

// Custom hooks for deferred data loading
function useOverviewStats(period: string) {
  const [data, setData] = useState<OverviewData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function fetchData() {
      try {
        setLoading(true);
        setError(null);
        const response = await fetch(`/api/admin/stats/overview?period=${period}`);

        if (!response.ok) throw new Error('Erreur lors du chargement');

        const result = await response.json();
        if (!cancelled) setData(result);
      } catch {
        if (!cancelled) setError('Erreur de chargement');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    fetchData();
    return () => { cancelled = true; };
  }, [period]);

  return { data, loading, error };
}

function useMonthlyData() {
  const [data, setData] = useState<MonthlyDataPoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function fetchData() {
      try {
        setLoading(true);
        setError(null);
        const response = await fetch('/api/admin/stats/monthly');

        if (!response.ok) throw new Error('Erreur lors du chargement');

        const result = await response.json();
        if (!cancelled) setData(result.monthlyData || []);
      } catch {
        if (!cancelled) setError('Erreur de chargement');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    fetchData();
    return () => { cancelled = true; };
  }, []);

  return { data, loading, error };
}

function useCategoriesData() {
  const [data, setData] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function fetchData() {
      try {
        setLoading(true);
        setError(null);
        const response = await fetch('/api/admin/stats/categories');

        if (!response.ok) throw new Error('Erreur lors du chargement');

        const result = await response.json();
        if (!cancelled) setData(result.topCategories || []);
      } catch {
        if (!cancelled) setError('Erreur de chargement');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    fetchData();
    return () => { cancelled = true; };
  }, []);

  return { data, loading, error };
}

function useActivityData() {
  const [data, setData] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function fetchData() {
      try {
        setLoading(true);
        setError(null);
        const response = await fetch('/api/admin/stats/activity');

        if (!response.ok) throw new Error('Erreur lors du chargement');

        const result = await response.json();
        if (!cancelled) setData(result.userActivity || []);
      } catch {
        if (!cancelled) setError('Erreur de chargement');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    fetchData();
    return () => { cancelled = true; };
  }, []);

  return { data, loading, error };
}

export default function ReportsPage() {
  const { data: session, isPending } = useSession();
  const router = useRouter();
  const [selectedPeriod, setSelectedPeriod] = useState("30d");

  // Deferred data loading
  const overview = useOverviewStats(selectedPeriod);
  const monthly = useMonthlyData();
  const categories = useCategoriesData();
  const activity = useActivityData();

  useEffect(() => {
    if (!isPending && !session) {
      router.push("/login");
    }
  }, [session, isPending, router]);

  const handleExportReport = async (exportType: 'announcements' | 'condolences' | 'users') => {
    try {
      const url = exportType === 'users'
        ? '/api/admin/export/users'
        : exportType === 'announcements'
        ? '/api/admin/export/announcements'
        : '/api/admin/export/condolences';

      const response = await fetch(url);
      if (!response.ok) throw new Error('Erreur lors de l\'export');

      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = downloadUrl;
      a.download = `${exportType}_${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(downloadUrl);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Erreur lors de l\'export:', error);
      alert('Erreur lors de l\'export des données');
    }
  };

  if (isPending || !session) {
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

        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-display text-3xl font-bold tracking-tight text-gris-lavande">Rapports et statistiques</h1>
            <p className="font-body text-muted-foreground">
              Analyse des données et tendances de la plateforme
            </p>
          </div>

          <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Période" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">7 derniers jours</SelectItem>
              <SelectItem value="30d">30 derniers jours</SelectItem>
              <SelectItem value="90d">90 derniers jours</SelectItem>
              <SelectItem value="1y">1 an</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Overview Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Utilisateurs totaux</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {overview.loading ? (
              <>
                <Skeleton className="h-8 w-24 mb-2" />
                <Skeleton className="h-4 w-32" />
              </>
            ) : overview.error ? (
              <div className="text-sm text-red-600">{overview.error}</div>
            ) : overview.data ? (
              <>
                <div className="text-2xl font-bold">{overview.data.totalUsers.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground flex items-center">
                  {overview.data.userGrowth >= 0 ? (
                    <>
                      <TrendingUp className="h-3 w-3 mr-1 text-green-600" />
                      +{overview.data.userGrowth}% sur la période
                    </>
                  ) : (
                    <>
                      <TrendingDown className="h-3 w-3 mr-1 text-red-600" />
                      {overview.data.userGrowth}% sur la période
                    </>
                  )}
                </p>
              </>
            ) : null}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Annonces publiées</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {overview.loading ? (
              <>
                <Skeleton className="h-8 w-24 mb-2" />
                <Skeleton className="h-4 w-32" />
              </>
            ) : overview.error ? (
              <div className="text-sm text-red-600">{overview.error}</div>
            ) : overview.data ? (
              <>
                <div className="text-2xl font-bold">{overview.data.totalAnnouncements}</div>
                <p className="text-xs text-muted-foreground flex items-center">
                  {overview.data.announcementGrowth >= 0 ? (
                    <>
                      <TrendingUp className="h-3 w-3 mr-1 text-green-600" />
                      +{overview.data.announcementGrowth}% sur la période
                    </>
                  ) : (
                    <>
                      <TrendingDown className="h-3 w-3 mr-1 text-red-600" />
                      {overview.data.announcementGrowth}% sur la période
                    </>
                  )}
                </p>
              </>
            ) : null}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Condoléances</CardTitle>
            <MessageCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {overview.loading ? (
              <>
                <Skeleton className="h-8 w-24 mb-2" />
                <Skeleton className="h-4 w-32" />
              </>
            ) : overview.error ? (
              <div className="text-sm text-red-600">{overview.error}</div>
            ) : overview.data ? (
              <>
                <div className="text-2xl font-bold">{overview.data.totalCondolences}</div>
                <p className="text-xs text-muted-foreground flex items-center">
                  {overview.data.condolenceGrowth >= 0 ? (
                    <>
                      <TrendingUp className="h-3 w-3 mr-1 text-green-600" />
                      +{overview.data.condolenceGrowth}% sur la période
                    </>
                  ) : (
                    <>
                      <TrendingDown className="h-3 w-3 mr-1 text-red-600" />
                      {overview.data.condolenceGrowth}% sur la période
                    </>
                  )}
                </p>
              </>
            ) : null}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Utilisateurs actifs</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {overview.loading ? (
              <>
                <Skeleton className="h-8 w-24 mb-2" />
                <Skeleton className="h-4 w-32" />
              </>
            ) : overview.error ? (
              <div className="text-sm text-red-600">{overview.error}</div>
            ) : overview.data ? (
              <>
                <div className="text-2xl font-bold">{overview.data.activeUsers}</div>
                <p className="text-xs text-muted-foreground">
                  {overview.data.totalUsers > 0 ? Math.round((overview.data.activeUsers / overview.data.totalUsers) * 100) : 0}% du total
                </p>
              </>
            ) : null}
          </CardContent>
        </Card>
      </div>

      {/* Charts Section */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <BarChart3 className="mr-2 h-5 w-5" />
              Évolution mensuelle
            </CardTitle>
            <CardDescription>
              Tendances des inscriptions et activités (6 derniers mois)
            </CardDescription>
          </CardHeader>
          <CardContent>
            {monthly.loading ? (
              <div className="space-y-4">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <Skeleton key={i} className="h-12 w-full" />
                ))}
              </div>
            ) : monthly.error ? (
              <div className="text-center py-8 text-red-600">
                <AlertCircle className="mx-auto h-8 w-8 mb-2" />
                <p>{monthly.error}</p>
              </div>
            ) : monthly.data.length > 0 ? (
              <ChartContainer config={chartConfig} className="h-[300px] w-full">
                <RechartsComposedChart data={monthly.data}>
                  <RechartsCartesianGrid strokeDasharray="3 3" vertical={false} />
                  <RechartsXAxis
                    dataKey="month"
                    tickLine={false}
                    axisLine={false}
                    tickMargin={8}
                  />
                  <RechartsYAxis
                    tickLine={false}
                    axisLine={false}
                    tickMargin={8}
                  />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <RechartsArea
                    type="monotone"
                    dataKey="users"
                    fill="var(--color-users)"
                    stroke="var(--color-users)"
                    fillOpacity={0.2}
                  />
                  <RechartsBar
                    dataKey="announcements"
                    fill="var(--color-announcements)"
                    radius={[4, 4, 0, 0]}
                  />
                  <RechartsBar
                    dataKey="condolences"
                    fill="var(--color-condolences)"
                    radius={[4, 4, 0, 0]}
                  />
                </RechartsComposedChart>
              </ChartContainer>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <AlertCircle className="mx-auto h-8 w-8 mb-2" />
                <p>Aucune donnée disponible</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <BarChart3 className="mr-2 h-5 w-5" />
              Répartition des annonces
            </CardTitle>
            <CardDescription>
              Types d&apos;annonces publiées
            </CardDescription>
          </CardHeader>
          <CardContent>
            {categories.loading ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="space-y-2">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-2 w-full" />
                    <Skeleton className="h-3 w-20" />
                  </div>
                ))}
              </div>
            ) : categories.error ? (
              <div className="text-center py-8 text-red-600">
                <AlertCircle className="mx-auto h-8 w-8 mb-2" />
                <p>{categories.error}</p>
              </div>
            ) : categories.data.length > 0 ? (
              <div className="space-y-4">
                {categories.data.map((category, index) => (
                  <div key={index} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">{category.category}</span>
                      <span className="text-sm text-muted-foreground">{category.count} annonces</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-primary h-2 rounded-full transition-all"
                        style={{ width: `${category.percentage}%` }}
                      ></div>
                    </div>
                    <div className="text-xs text-muted-foreground">{category.percentage}% du total</div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <AlertCircle className="mx-auto h-8 w-8 mb-2" />
                <p>Aucune annonce publiée</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Activity Analysis */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Activité des utilisateurs</CardTitle>
            <CardDescription>
              Engagement par période
            </CardDescription>
          </CardHeader>
          <CardContent>
            {activity.loading ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-20 w-full" />
                ))}
              </div>
            ) : activity.error ? (
              <div className="text-center py-8 text-red-600">
                <AlertCircle className="mx-auto h-8 w-8 mb-2" />
                <p>{activity.error}</p>
              </div>
            ) : activity.data.length > 0 ? (
              <div className="space-y-4">
                {activity.data.map((activityItem, index) => (
                  <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <div className="font-medium">{activityItem.period}</div>
                      <div className="text-sm text-muted-foreground">
                        {activityItem.active} utilisateurs actifs
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold">
                        {activityItem.total > 0 ? Math.round((activityItem.active / activityItem.total) * 100) : 0}%
                      </div>
                      <div className="text-xs text-muted-foreground">
                        sur {activityItem.total} total
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <AlertCircle className="mx-auto h-8 w-8 mb-2" />
                <p>Aucune donnée disponible</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Actions rapides</CardTitle>
            <CardDescription>
              Outils d&apos;analyse et d&apos;export
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button
              variant="outline"
              className="w-full justify-start"
              onClick={() => handleExportReport('users')}
            >
              <Download className="h-4 w-4 mr-2" />
              Exporter données utilisateurs (CSV)
            </Button>

            <Button
              variant="outline"
              className="w-full justify-start"
              onClick={() => handleExportReport('announcements')}
            >
              <Download className="h-4 w-4 mr-2" />
              Exporter annonces (CSV)
            </Button>

            <Button
              variant="outline"
              className="w-full justify-start"
              onClick={() => handleExportReport('condolences')}
            >
              <Download className="h-4 w-4 mr-2" />
              Exporter condoléances (CSV)
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity Summary */}
      {overview.data && (
        <Card>
          <CardHeader>
            <CardTitle>Résumé d&apos;activité récente</CardTitle>
            <CardDescription>
              Événements importants
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg border border-blue-200">
                <div className="flex items-center gap-3">
                  <Users className="h-5 w-5 text-blue-600" />
                  <div>
                    <p className="font-medium text-blue-800">Nouveaux utilisateurs</p>
                    <p className="text-sm text-blue-600">{overview.data.thisWeekUsers} cette semaine</p>
                  </div>
                </div>
                <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                  7 jours
                </Badge>
              </div>

              <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg border border-green-200">
                <div className="flex items-center gap-3">
                  <FileText className="h-5 w-5 text-green-600" />
                  <div>
                    <p className="font-medium text-green-800">Annonces soumises</p>
                    <p className="text-sm text-green-600">{overview.data.todaySubmissions} aujourd&apos;hui</p>
                  </div>
                </div>
                <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                  Aujourd&apos;hui
                </Badge>
              </div>

              <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg border border-purple-200">
                <div className="flex items-center gap-3">
                  <MessageCircle className="h-5 w-5 text-purple-600" />
                  <div>
                    <p className="font-medium text-purple-800">Condoléances</p>
                    <p className="text-sm text-purple-600">{overview.data.totalCondolences} au total</p>
                  </div>
                </div>
                <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">
                  Total
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
