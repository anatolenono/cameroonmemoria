'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowLeft, TrendingUp, DollarSign, Zap, Target } from 'lucide-react';
import Link from 'next/link';
import { useSession } from '@/lib/auth-client';
import { useRouter } from 'next/navigation';
import { EconomicActivity } from '@/features/feature-reports/domain/types/financial';

export default function EconomicActivityPage() {
  const { data: session, isPending } = useSession();
  const router = useRouter();
  const [activity, setActivity] = useState<EconomicActivity | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isPending && !session) {
      router.push('/login');
    }
  }, [session, isPending, router]);

  useEffect(() => {
    if (!session) return;

    async function fetchActivity() {
      try {
        setLoading(true);
        const response = await fetch('/api/admin/reports/economic');
        if (!response.ok) throw new Error('Erreur lors du chargement');
        const result = await response.json();
        setActivity(result.data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Erreur');
      } finally {
        setLoading(false);
      }
    }

    fetchActivity();
  }, [session]);

  if (isPending || !session) return null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <Button variant="ghost" asChild className="mb-4">
          <Link href="/admin/reports">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Retour
          </Link>
        </Button>

        <div>
          <h1 className="font-display text-3xl font-bold tracking-tight">Activité Économique</h1>
          <p className="text-muted-foreground">
            Vue d&apos;ensemble de la performance économique de la plateforme
          </p>
        </div>
      </div>

      {/* Revenue Overview */}
      {loading ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i}>
              <CardHeader className="space-y-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-8 w-32" />
              </CardHeader>
            </Card>
          ))}
        </div>
      ) : error ? (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-6">
            <p className="text-red-600">{error}</p>
          </CardContent>
        </Card>
      ) : activity ? (
        <>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Revenus totaux</CardTitle>
                <DollarSign className="h-4 w-4 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {activity.revenue.total.toLocaleString()} F CFA
                </div>
                <p className="text-xs text-muted-foreground">
                  Tous les revenus confondus
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Plans tarifaires</CardTitle>
                <TrendingUp className="h-4 w-4 text-blue-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {activity.revenue.fromPlans.toLocaleString()} F CFA
                </div>
                <p className="text-xs text-muted-foreground">
                  {((activity.revenue.fromPlans / activity.revenue.total) * 100).toFixed(1)}% du total
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Prestations</CardTitle>
                <Zap className="h-4 w-4 text-orange-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {activity.revenue.fromPrestations.toLocaleString()} F CFA
                </div>
                <p className="text-xs text-muted-foreground">
                  Commission sur {activity.prestations.transactionCount} transactions
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Cagnottes</CardTitle>
                <Target className="h-4 w-4 text-purple-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {activity.revenue.fromFundraisers.toLocaleString()} F CFA
                </div>
                <p className="text-xs text-muted-foreground">
                  Commission sur cagnottes (5%)
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Announcements by Plan */}
          <Card>
            <CardHeader>
              <CardTitle>Répartition des annonces par plan</CardTitle>
              <CardDescription>
                {activity.announcements.total} annonces publiées
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">Gratuit</span>
                    <span className="text-sm text-muted-foreground">
                      {activity.announcements.byPlan.free} annonces
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-gray-500 h-2 rounded-full"
                      style={{
                        width: `${
                          (activity.announcements.byPlan.free / activity.announcements.total) * 100
                        }%`,
                      }}
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">Essentiel (5,000 F CFA)</span>
                    <span className="text-sm text-muted-foreground">
                      {activity.announcements.byPlan.essential} annonces
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-500 h-2 rounded-full"
                      style={{
                        width: `${
                          (activity.announcements.byPlan.essential / activity.announcements.total) *
                          100
                        }%`,
                      }}
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">Complet (10,000 F CFA)</span>
                    <span className="text-sm text-muted-foreground">
                      {activity.announcements.byPlan.complete} annonces
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-green-500 h-2 rounded-full"
                      style={{
                        width: `${
                          (activity.announcements.byPlan.complete / activity.announcements.total) *
                          100
                        }%`,
                      }}
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">Premium (15,000 F CFA)</span>
                    <span className="text-sm text-muted-foreground">
                      {activity.announcements.byPlan.premium} annonces
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-purple-500 h-2 rounded-full"
                      style={{
                        width: `${
                          (activity.announcements.byPlan.premium / activity.announcements.total) *
                          100
                        }%`,
                      }}
                    />
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Taux de conversion (FREE → PAID)</span>
                  <Badge variant="outline">
                    {activity.announcements.conversionRate.toFixed(1)}%
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Top Providers */}
          {activity.prestations.topProviders.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Top 5 Prestataires</CardTitle>
                <CardDescription>
                  Par volume de prestations
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {activity.prestations.topProviders.map((provider, idx) => (
                    <div key={idx} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <p className="font-medium">{provider.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {provider.category} • {provider.transactionCount} transactions
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold">{provider.totalVolume.toLocaleString()} F CFA</p>
                        <p className="text-xs text-green-600">
                          +{provider.cmCommission.toLocaleString()} F CFA (commission)
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Fundraisers */}
          {activity.fundraisers.activeCount > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Cagnottes</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-3">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Cagnottes actives</p>
                    <p className="text-2xl font-bold">{activity.fundraisers.activeCount}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Montant collecté</p>
                    <p className="text-2xl font-bold">
                      {activity.fundraisers.totalCollected.toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Commission CM (5%)</p>
                    <p className="text-2xl font-bold text-green-600">
                      +{activity.fundraisers.cmCommission.toLocaleString()} F CFA
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </>
      ) : null}
    </div>
  );
}
