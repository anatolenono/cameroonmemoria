'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Input } from '@/components/ui/input';
import { ArrowLeft, Download, Wallet, CreditCard, Gift } from 'lucide-react';
import Link from 'next/link';
import { useSession } from '@/lib/auth-client';
import { useRouter } from 'next/navigation';
import { FinancialReport } from '@/features/feature-reports/domain/types/financial';

export default function FinancialReportsPage() {
  const { data: session, isPending } = useSession();
  const router = useRouter();
  const [report, setReport] = useState<FinancialReport | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [startDate, setStartDate] = useState(
    new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0]
  );
  const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]);

  useEffect(() => {
    if (!isPending && !session) {
      router.push('/login');
    }
  }, [session, isPending, router]);

  const handleGenerateReport = async () => {
    if (!session) return;

    try {
      setLoading(true);
      setError(null);
      const response = await fetch('/api/admin/reports/financial', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          startDate: new Date(startDate),
          endDate: new Date(endDate),
        }),
      });

      if (!response.ok) throw new Error('Erreur lors du chargement');
      const result = await response.json();
      setReport(result.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur');
    } finally {
      setLoading(false);
    }
  };

  const handleExportPDF = () => {
    if (!report) return;
    alert('Export PDF - À implémenter');
  };

  const handleExportCSV = () => {
    if (!report) return;
    const csv = [
      ['Date', 'Source', 'Type', 'Montant', 'Référence', 'Statut'],
      ...report.transactions.map((t) => [
        new Date(t.date).toLocaleDateString('fr-FR'),
        t.source,
        t.type,
        t.amount,
        t.reference,
        t.status,
      ]),
    ]
      .map((row) => row.join(','))
      .join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `rapport-financier-${startDate}-${endDate}.csv`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  };

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
          <h1 className="font-display text-3xl font-bold tracking-tight">Rapports Financiers</h1>
          <p className="text-muted-foreground">
            Trésorerie et état détaillé des transactions
          </p>
        </div>
      </div>

      {/* Period Selector */}
      <Card>
        <CardHeader>
          <CardTitle>Sélectionner une période</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-3">
            <div>
              <label className="text-sm font-medium">Date de début</label>
              <Input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="mt-2"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Date de fin</label>
              <Input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="mt-2"
              />
            </div>
            <div className="flex items-end">
              <Button onClick={handleGenerateReport} disabled={loading} className="w-full">
                {loading ? 'Génération...' : 'Générer rapport'}
              </Button>
            </div>
          </div>

          <div className="flex gap-2 flex-wrap">
            <Button variant="outline" size="sm" onClick={() => {
              const today = new Date();
              setStartDate(new Date(today.getFullYear(), today.getMonth(), 1).toISOString().split('T')[0]);
              setEndDate(today.toISOString().split('T')[0]);
            }}>
              Ce mois
            </Button>
            <Button variant="outline" size="sm" onClick={() => {
              const today = new Date();
              const lastMonth = new Date(today.getFullYear(), today.getMonth() - 1);
              setStartDate(new Date(lastMonth.getFullYear(), lastMonth.getMonth(), 1).toISOString().split('T')[0]);
              setEndDate(new Date(lastMonth.getFullYear(), lastMonth.getMonth() + 1, 0).toISOString().split('T')[0]);
            }}>
              Mois dernier
            </Button>
            <Button variant="outline" size="sm" onClick={() => {
              const today = new Date();
              setStartDate(new Date(today.getFullYear(), 0, 1).toISOString().split('T')[0]);
              setEndDate(today.toISOString().split('T')[0]);
            }}>
              Cette année
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Summary Cards */}
      {loading ? (
        <div className="grid gap-4 md:grid-cols-4">
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
      ) : report ? (
        <>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total généré</CardTitle>
                <Wallet className="h-4 w-4 text-blue-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {report.summary.totalGenerated.toLocaleString()} F CFA
                </div>
                <p className="text-xs text-muted-foreground">
                  {report.transactions.length} transactions
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Stripe</CardTitle>
                <CreditCard className="h-4 w-4 text-orange-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {report.summary.bySource.stripe.toLocaleString()} F CFA
                </div>
                <p className="text-xs text-muted-foreground">
                  {((report.summary.bySource.stripe / report.summary.totalGenerated) * 100).toFixed(1)}% du total
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Orange Money</CardTitle>
                <Gift className="h-4 w-4 text-orange-400" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {report.summary.bySource.orangeMoney.toLocaleString()} F CFA
                </div>
                <p className="text-xs text-muted-foreground">
                  {((report.summary.bySource.orangeMoney / report.summary.totalGenerated) * 100).toFixed(1)}% du total
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">MoMo</CardTitle>
                <Gift className="h-4 w-4 text-purple-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {report.summary.bySource.momo.toLocaleString()} F CFA
                </div>
                <p className="text-xs text-muted-foreground">
                  {((report.summary.bySource.momo / report.summary.totalGenerated) * 100).toFixed(1)}% du total
                </p>
              </CardContent>
            </Card>
          </div>

          {/* By Type Summary */}
          <Card>
            <CardHeader>
              <CardTitle>Répartition par type de revenu</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-3">
                <div className="p-4 border rounded-lg">
                  <p className="text-sm text-muted-foreground mb-1">Plans tarifaires</p>
                  <p className="text-2xl font-bold">{report.byType.planUpgrades.toLocaleString()} F CFA</p>
                  <p className="text-xs text-muted-foreground mt-2">
                    {((report.byType.planUpgrades / report.summary.totalGenerated) * 100).toFixed(1)}% du total
                  </p>
                </div>
                <div className="p-4 border rounded-lg">
                  <p className="text-sm text-muted-foreground mb-1">Prestations</p>
                  <p className="text-2xl font-bold">{report.byType.prestations.toLocaleString()} F CFA</p>
                  <p className="text-xs text-muted-foreground mt-2">
                    {((report.byType.prestations / report.summary.totalGenerated) * 100).toFixed(1)}% du total
                  </p>
                </div>
                <div className="p-4 border rounded-lg">
                  <p className="text-sm text-muted-foreground mb-1">Cagnottes</p>
                  <p className="text-2xl font-bold">{report.byType.fundraisers.toLocaleString()} F CFA</p>
                  <p className="text-xs text-muted-foreground mt-2">
                    {((report.byType.fundraisers / report.summary.totalGenerated) * 100).toFixed(1)}% du total
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Transactions Table */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Détail des transactions</CardTitle>
                <CardDescription>{report.transactions.length} transactions</CardDescription>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={handleExportPDF}>
                  <Download className="h-4 w-4 mr-2" />
                  PDF
                </Button>
                <Button variant="outline" size="sm" onClick={handleExportCSV}>
                  <Download className="h-4 w-4 mr-2" />
                  CSV
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4 font-medium">Date</th>
                      <th className="text-left py-3 px-4 font-medium">Source</th>
                      <th className="text-left py-3 px-4 font-medium">Type</th>
                      <th className="text-left py-3 px-4 font-medium">Référence</th>
                      <th className="text-right py-3 px-4 font-medium">Montant</th>
                      <th className="text-left py-3 px-4 font-medium">Statut</th>
                    </tr>
                  </thead>
                  <tbody>
                    {report.transactions.map((tx) => (
                      <tr key={tx.id} className="border-b hover:bg-gray-50">
                        <td className="py-3 px-4">{new Date(tx.date).toLocaleDateString('fr-FR')}</td>
                        <td className="py-3 px-4">
                          <Badge variant="outline">{tx.source}</Badge>
                        </td>
                        <td className="py-3 px-4">
                          <Badge variant="secondary">
                            {tx.type === 'PLAN_UPGRADE' ? 'Plan' : tx.type === 'PRESTATION' ? 'Prestation' : 'Cagnotte'}
                          </Badge>
                        </td>
                        <td className="py-3 px-4 text-xs">{tx.reference}</td>
                        <td className="py-3 px-4 text-right font-medium">
                          {tx.amount.toLocaleString()} F CFA
                        </td>
                        <td className="py-3 px-4">
                          <Badge
                            variant={tx.status === 'COMPLETED' ? 'default' : 'secondary'}
                          >
                            {tx.status === 'COMPLETED' ? '✓ Reçu' : tx.status === 'PENDING' ? '⏳ En attente' : tx.status === 'FAILED' ? '✗ Échoué' : 'Remboursé'}
                          </Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </>
      ) : null}
    </div>
  );
}
