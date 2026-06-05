"use client";

import { useEffect, useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Store,
  CheckCircle,
  XCircle,
  PauseCircle,
  Loader2,
  Search,
  Eye,
  CreditCard,
} from "lucide-react";

interface ProviderActivation {
  id: string;
  baseAmount: number;
  discountPct: number;
  finalAmount: number;
  status: "PENDING" | "PAID";
  paidAt?: string | null;
  notes?: string | null;
}

interface Provider {
  id: string;
  companyName: string;
  companyCity?: string | null;
  repName: string;
  repPhone: string;
  status: "PENDING" | "ACTIVE" | "SUSPENDED";
  commissionRate: number;
  createdAt: string;
  category?: { id: string; name: string };
  user?: { email: string; name?: string | null };
  activation?: ProviderActivation | null;
  adminNotes?: string | null;
}

const STATUS_LABEL: Record<Provider["status"], string> = {
  PENDING: "En attente",
  ACTIVE: "Actif",
  SUSPENDED: "Suspendu",
};

const STATUS_VARIANT: Record<Provider["status"], "default" | "secondary" | "destructive" | "outline"> = {
  PENDING: "secondary",
  ACTIVE: "default",
  SUSPENDED: "destructive",
};

export default function AdminProvidersPage() {
  const [providers, setProviders] = useState<Provider[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>("ALL");
  const [search, setSearch] = useState("");

  // Detail / action dialog
  const [selected, setSelected] = useState<Provider | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  // Activation fee dialog
  const [feeOpen, setFeeOpen] = useState(false);
  const [feeForm, setFeeForm] = useState({ baseAmount: 0, discountPct: 0, notes: "" });
  const [feeProvider, setFeeProvider] = useState<Provider | null>(null);

  // Commission / notes edit
  const [commissionRate, setCommissionRate] = useState<number>(10);
  const [adminNotes, setAdminNotes] = useState("");

  const fetchProviders = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const params = new URLSearchParams();
      if (filterStatus !== "ALL") params.set("status", filterStatus);
      if (search.trim()) params.set("q", search.trim());
      const res = await fetch(`/api/admin/marketplace/providers?${params}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setProviders(data.providers || []);
      setTotal(data.total || 0);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur");
    } finally {
      setLoading(false);
    }
  }, [filterStatus, search]);

  useEffect(() => { fetchProviders(); }, [fetchProviders]);

  function openDetail(p: Provider) {
    setSelected(p);
    setCommissionRate(p.commissionRate);
    setAdminNotes(p.adminNotes || "");
    setActionError(null);
    setDetailOpen(true);
  }

  async function sendAction(id: string, payload: Record<string, unknown>) {
    setActionLoading(true);
    setActionError(null);
    try {
      const res = await fetch(`/api/admin/marketplace/providers/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setDetailOpen(false);
      fetchProviders();
    } catch (err) {
      setActionError(err instanceof Error ? err.message : "Erreur");
    } finally {
      setActionLoading(false);
    }
  }

  function openFee(p: Provider) {
    setFeeProvider(p);
    setFeeForm({
      baseAmount: p.activation?.baseAmount ?? 0,
      discountPct: p.activation?.discountPct ?? 0,
      notes: p.activation?.notes ?? "",
    });
    setFeeOpen(true);
  }

  async function saveFee() {
    if (!feeProvider) return;
    setActionLoading(true);
    setActionError(null);
    try {
      const res = await fetch(`/api/admin/marketplace/providers/${feeProvider.id}/activation`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(feeForm),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setFeeOpen(false);
      fetchProviders();
    } catch (err) {
      setActionError(err instanceof Error ? err.message : "Erreur");
    } finally {
      setActionLoading(false);
    }
  }

  async function markFeePaid(p: Provider) {
    setActionLoading(true);
    try {
      const res = await fetch(`/api/admin/marketplace/providers/${p.id}/activation`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "PAID", paidAt: new Date().toISOString() }),
      });
      if (!res.ok) throw new Error((await res.json()).error);
      fetchProviders();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur");
    } finally {
      setActionLoading(false);
    }
  }

  const finalAmount = (base: number, discount: number) => base * (1 - discount / 100);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl font-bold tracking-tight text-gris-lavande">
          Prestataires
        </h1>
        <p className="text-muted-foreground">{total} prestataire(s) au total</p>
      </div>

      {error && (
        <div className="rounded-md bg-red-50 border border-red-200 p-4 text-red-700 text-sm">{error}</div>
      )}

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            className="pl-9"
            placeholder="Rechercher…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-44">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">Tous les statuts</SelectItem>
            <SelectItem value="PENDING">En attente</SelectItem>
            <SelectItem value="ACTIVE">Actifs</SelectItem>
            <SelectItem value="SUSPENDED">Suspendus</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      ) : providers.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            <Store className="h-10 w-10 mx-auto mb-3 opacity-40" />
            <p>Aucun prestataire trouvé</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {providers.map((p) => (
            <Card key={p.id}>
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <CardTitle className="text-base">{p.companyName}</CardTitle>
                    <p className="text-xs text-muted-foreground">
                      {p.category?.name} · {p.companyCity || "–"} · Inscrit le{" "}
                      {new Date(p.createdAt).toLocaleDateString("fr-FR")}
                    </p>
                  </div>
                  <Badge variant={STATUS_VARIANT[p.status]}>{STATUS_LABEL[p.status]}</Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm">
                  <span className="text-muted-foreground">Représentant</span>
                  <span>{p.repName} — {p.repPhone}</span>
                  <span className="text-muted-foreground">Commission CM</span>
                  <span>{p.commissionRate}%</span>
                  {p.activation && (
                    <>
                      <span className="text-muted-foreground">Frais d&apos;activation</span>
                      <span className="flex items-center gap-2">
                        {p.activation.finalAmount.toLocaleString("fr-FR")} XAF
                        <Badge variant={p.activation.status === "PAID" ? "default" : "secondary"} className="text-xs">
                          {p.activation.status === "PAID" ? "Payé" : "En attente"}
                        </Badge>
                        {p.activation.status === "PENDING" && (
                          <button
                            className="text-xs text-blue-600 underline"
                            onClick={() => markFeePaid(p)}
                          >
                            Marquer payé
                          </button>
                        )}
                      </span>
                    </>
                  )}
                </div>
                <div className="flex gap-2 flex-wrap">
                  <Button size="sm" variant="outline" onClick={() => openDetail(p)}>
                    <Eye className="h-3 w-3 mr-1" /> Gérer
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => openFee(p)}>
                    <CreditCard className="h-3 w-3 mr-1" />
                    {p.activation ? "Modifier frais" : "Définir frais"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Detail / action dialog */}
      <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{selected?.companyName}</DialogTitle>
          </DialogHeader>
          {selected && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm">
                <span className="text-muted-foreground">Email compte</span>
                <span>{selected.user?.email}</span>
                <span className="text-muted-foreground">Catégorie</span>
                <span>{selected.category?.name}</span>
                <span className="text-muted-foreground">Téléphone rep.</span>
                <span>{selected.repPhone}</span>
                <span className="text-muted-foreground">Statut actuel</span>
                <Badge variant={STATUS_VARIANT[selected.status]}>{STATUS_LABEL[selected.status]}</Badge>
              </div>

              <div className="space-y-1">
                <Label>Taux de commission (%)</Label>
                <Input
                  type="number"
                  value={commissionRate}
                  onChange={(e) => setCommissionRate(parseFloat(e.target.value) || 0)}
                />
              </div>
              <div className="space-y-1">
                <Label>Notes internes</Label>
                <Textarea
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  rows={3}
                  placeholder="Notes visibles uniquement par l'admin"
                />
              </div>

              {actionError && (
                <p className="text-red-600 text-sm">{actionError}</p>
              )}

              <div className="flex flex-wrap gap-2">
                {selected.status !== "ACTIVE" && (
                  <Button
                    size="sm"
                    className="bg-green-600 hover:bg-green-700"
                    onClick={() => sendAction(selected.id, { action: "activate", commissionRate, notes: adminNotes })}
                    disabled={actionLoading}
                  >
                    <CheckCircle className="h-3 w-3 mr-1" /> Valider
                  </Button>
                )}
                {selected.status !== "SUSPENDED" && (
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => sendAction(selected.id, { action: "suspend" })}
                    disabled={actionLoading}
                  >
                    <PauseCircle className="h-3 w-3 mr-1" /> Suspendre
                  </Button>
                )}
                {selected.status === "PENDING" && (
                  <Button
                    size="sm"
                    variant="outline"
                    className="text-red-600"
                    onClick={() => sendAction(selected.id, { action: "reject", notes: adminNotes })}
                    disabled={actionLoading}
                  >
                    <XCircle className="h-3 w-3 mr-1" /> Rejeter
                  </Button>
                )}
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => sendAction(selected.id, { commissionRate, adminNotes })}
                  disabled={actionLoading}
                >
                  {actionLoading && <Loader2 className="mr-1 h-3 w-3 animate-spin" />}
                  Enregistrer
                </Button>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setDetailOpen(false)}>Fermer</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Activation fee dialog */}
      <Dialog open={feeOpen} onOpenChange={setFeeOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Frais d&apos;activation — {feeProvider?.companyName}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-1">
              <Label>Montant de base (XAF) *</Label>
              <Input
                type="number"
                value={feeForm.baseAmount}
                onChange={(e) => setFeeForm({ ...feeForm, baseAmount: parseFloat(e.target.value) || 0 })}
              />
            </div>
            <div className="space-y-1">
              <Label>Remise (%)</Label>
              <Input
                type="number"
                min={0}
                max={100}
                value={feeForm.discountPct}
                onChange={(e) => setFeeForm({ ...feeForm, discountPct: parseFloat(e.target.value) || 0 })}
              />
            </div>
            <div className="rounded-md bg-muted px-4 py-2 text-sm">
              Montant final :{" "}
              <strong>
                {finalAmount(feeForm.baseAmount, feeForm.discountPct).toLocaleString("fr-FR")} XAF
              </strong>
            </div>
            <div className="space-y-1">
              <Label>Notes</Label>
              <Textarea
                value={feeForm.notes}
                onChange={(e) => setFeeForm({ ...feeForm, notes: e.target.value })}
                rows={2}
              />
            </div>
            {actionError && <p className="text-red-600 text-sm">{actionError}</p>}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setFeeOpen(false)}>Annuler</Button>
            <Button onClick={saveFee} disabled={actionLoading || feeForm.baseAmount <= 0}>
              {actionLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Enregistrer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
