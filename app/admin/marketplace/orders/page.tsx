"use client";

import { useEffect, useState, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2, CheckCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface OrderItem {
  id: string;
  status: string;
  totalAmount: number;
  currency: string;
  deceasedName?: string | null;
  createdAt: string;
  client?: { id: string; name?: string | null; email: string } | null;
  assignedProvider?: { id: string; companyName: string } | null;
  items: Array<{ id: string; productName: string }>;
}

interface Provider {
  id: string;
  companyName: string;
  status: string;
}

const statusLabels: Record<string, { label: string; color: string }> = {
  PENDING_PAYMENT: { label: "En attente de paiement", color: "bg-yellow-100 text-yellow-800" },
  PAID: { label: "Payée", color: "bg-green-100 text-green-800" },
  ASSIGNED: { label: "Assignée", color: "bg-blue-100 text-blue-800" },
  IN_PROGRESS: { label: "En cours", color: "bg-purple-100 text-purple-800" },
  DELIVERED: { label: "Livrée", color: "bg-green-100 text-green-800" },
  CANCELLED: { label: "Annulée", color: "bg-red-100 text-red-800" },
  REFUNDED: { label: "Remboursée", color: "bg-gray-100 text-gray-800" },
};

export default function OrdersAdminPage() {
  const [orders, setOrders] = useState<OrderItem[]>([]);
  const [providers, setProviders] = useState<Provider[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState("");
  const [selectedOrder, setSelectedOrder] = useState<OrderItem | null>(null);
  const [assignDialogOpen, setAssignDialogOpen] = useState(false);
  const [selectedProvider, setSelectedProvider] = useState("");
  const [assignmentNote, setAssignmentNote] = useState("");
  const { toast } = useToast();

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams();
      if (statusFilter) params.append("status", statusFilter);

      const [ordersRes, providersRes] = await Promise.all([
        fetch(`/api/admin/marketplace/orders?${params.toString()}`),
        fetch("/api/admin/marketplace/providers"),
      ]);

      if (!ordersRes.ok) throw new Error("Erreur lors du chargement des commandes");
      if (!providersRes.ok) throw new Error("Erreur lors du chargement des prestataires");

      const ordersData = await ordersRes.json();
      const providersData = await providersRes.json();

      setOrders(ordersData.orders || []);
      setProviders(
        (providersData.providers || []).filter(
          (p: Provider) => p.status === "ACTIVE"
        )
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur");
    } finally {
      setLoading(false);
    }
  }, [statusFilter]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleAssignOrder = async () => {
    if (!selectedOrder || !selectedProvider) return;

    setSaving(true);
    try {
      const res = await fetch(`/api/admin/marketplace/orders/${selectedOrder.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "assign",
          providerId: selectedProvider,
          note: assignmentNote,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      toast({
        title: "Commande assignée",
        description: `Assignée à un prestataire avec succès`,
      });

      setAssignDialogOpen(false);
      setSelectedOrder(null);
      setSelectedProvider("");
      setAssignmentNote("");
      fetchData();
    } catch (err) {
      toast({
        title: "Erreur",
        description: err instanceof Error ? err.message : "Erreur lors de l'assignation",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl font-bold tracking-tight text-gris-lavande">
          Gestion des commandes
        </h1>
        <p className="text-muted-foreground">
          Suivi et assignation des commandes aux prestataires
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Filtres</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Label>Statut</Label>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Tous les statuts" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Tous les statuts</SelectItem>
                <SelectItem value="PENDING_PAYMENT">En attente de paiement</SelectItem>
                <SelectItem value="PAID">Payée</SelectItem>
                <SelectItem value="ASSIGNED">Assignée</SelectItem>
                <SelectItem value="IN_PROGRESS">En cours</SelectItem>
                <SelectItem value="DELIVERED">Livrée</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-700">
          {error}
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      ) : orders.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            <p>Aucune commande trouvée</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => {
            const statusInfo = statusLabels[order.status] || statusLabels.PENDING_PAYMENT;
            return (
              <Card key={order.id}>
                <CardContent className="py-4">
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="font-semibold">Commande {order.id.slice(0, 8)}</h3>
                          <Badge className={statusInfo.color}>{statusInfo.label}</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {order.client?.name} ({order.client?.email})
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-xl font-bold text-primary">
                          {order.totalAmount.toLocaleString("fr-CM", {
                            style: "currency",
                            currency: order.currency,
                          })}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(order.createdAt).toLocaleDateString("fr-CM")}
                        </p>
                      </div>
                    </div>

                    {order.deceasedName && (
                      <p className="text-sm text-muted-foreground">
                        Défunt : {order.deceasedName}
                      </p>
                    )}

                    {order.assignedProvider && (
                      <p className="text-sm flex items-center gap-2 text-green-600">
                        <CheckCircle className="h-4 w-4" />
                        Assignée à : {order.assignedProvider.companyName}
                      </p>
                    )}

                    {order.status === "PAID" && !order.assignedProvider && (
                      <Button
                        size="sm"
                        onClick={() => {
                          setSelectedOrder(order);
                          setAssignDialogOpen(true);
                        }}
                      >
                        Assigner à un prestataire
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Dialog d'assignation */}
      <Dialog open={assignDialogOpen} onOpenChange={setAssignDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Assigner la commande</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Prestataire *</Label>
              <Select value={selectedProvider} onValueChange={setSelectedProvider}>
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner un prestataire" />
                </SelectTrigger>
                <SelectContent>
                  {providers.map((provider) => (
                    <SelectItem key={provider.id} value={provider.id}>
                      {provider.companyName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Note (optionnel)</Label>
              <Textarea
                value={assignmentNote}
                onChange={(e) => setAssignmentNote(e.target.value)}
                placeholder="Instructions spéciales ou notes internes..."
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAssignDialogOpen(false)}>
              Annuler
            </Button>
            <Button onClick={handleAssignOrder} disabled={saving || !selectedProvider}>
              {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Assigner
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
