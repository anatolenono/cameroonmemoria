"use client";

import { useEffect, useState, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Loader2, ShoppingCart, AlertCircle } from "lucide-react";
import { useSession } from "@/lib/auth-client";

interface OrderItem {
  id: string;
  productId: string;
  quantity: number;
  unitPrice: number;
}

interface MarketplaceOrder {
  id: string;
  clientId: string;
  status: string;
  orderType: string;
  totalAmount: number;
  currency: string;
  paymentReference?: string;
  paidAt?: string;
  createdAt: string;
  items?: OrderItem[];
}

type OrderStatus = "PENDING_PAYMENT" | "CONFIRMED" | "SHIPPED" | "DELIVERED" | "CANCELED";

const statusConfig = {
  PENDING_PAYMENT: { label: "En attente de paiement", color: "bg-yellow-50 text-yellow-700 border-yellow-200" },
  CONFIRMED: { label: "Confirmée", color: "bg-blue-50 text-blue-700 border-blue-200" },
  SHIPPED: { label: "Expédiée", color: "bg-purple-50 text-purple-700 border-purple-200" },
  DELIVERED: { label: "Livrée", color: "bg-green-50 text-green-700 border-green-200" },
  CANCELED: { label: "Annulée", color: "bg-red-50 text-red-700 border-red-200" },
};

export default function ProviderOrdersPage() {
  const { data: session, isPending: sessionPending } = useSession();
  const [orders, setOrders] = useState<MarketplaceOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedStatus, setSelectedStatus] = useState<string>("ALL");

  const fetchOrders = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch("/api/provider/orders");
      if (!response.ok) {
        throw new Error("Impossible de charger les commandes");
      }
      const data = await response.json();
      setOrders(data.orders || []);
    } catch (err) {
      console.error("Erreur:", err);
      setError("Impossible de charger les commandes");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (session?.user) {
      fetchOrders();
    }
  }, [session, fetchOrders]);

  const filteredOrders = selectedStatus === "ALL"
    ? orders
    : orders.filter(o => o.status === selectedStatus);

  const statusList = ["PENDING_PAYMENT", "CONFIRMED", "SHIPPED", "DELIVERED", "CANCELED"];

  if (sessionPending || loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin mx-auto" />
          <p className="text-muted-foreground">Chargement des commandes...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-700">
        <div className="flex items-start gap-3">
          <AlertCircle className="h-5 w-5 mt-0.5 flex-shrink-0" />
          <div>
            <h3 className="font-semibold">Erreur</h3>
            <p className="text-sm">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl font-bold tracking-tight text-gris-lavande">
          Mes commandes
        </h1>
        <p className="text-muted-foreground">
          Consultez et gérez les commandes qui vous sont assignées
        </p>
      </div>

      {/* Filtres */}
      <div className="flex gap-4 items-center">
        <Select value={selectedStatus} onValueChange={setSelectedStatus}>
          <SelectTrigger className="w-full sm:w-64">
            <SelectValue placeholder="Filtrer par statut" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">Tous les statuts</SelectItem>
            {statusList.map((status) => (
              <SelectItem key={status} value={status}>
                {(statusConfig[status as OrderStatus]?.label) || status}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {filteredOrders.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            <ShoppingCart className="h-10 w-10 mx-auto mb-3 opacity-40" />
            <p>
              {selectedStatus === "ALL"
                ? "Aucune commande trouvée"
                : "Aucune commande avec ce statut"}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredOrders.map((order) => {
            const status = order.status as OrderStatus;
            const config = statusConfig[status];
            return (
              <Card key={order.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-base">Commande {order.id.slice(0, 8)}</CardTitle>
                      <p className="text-sm text-muted-foreground mt-1">
                        {new Date(order.createdAt).toLocaleDateString("fr-CM")}
                      </p>
                    </div>
                    <Badge className={`${config.color}`}>
                      {config.label}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Order details */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">Type de commande</p>
                      <p className="font-semibold">{order.orderType}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Montant total</p>
                      <p className="font-semibold">
                        {order.totalAmount.toLocaleString("fr-CM", {
                          style: "currency",
                          currency: order.currency,
                        })}
                      </p>
                    </div>
                    {order.paidAt && (
                      <div>
                        <p className="text-muted-foreground">Payée le</p>
                        <p className="font-semibold">
                          {new Date(order.paidAt).toLocaleDateString("fr-CM")}
                        </p>
                      </div>
                    )}
                    {order.paymentReference && (
                      <div>
                        <p className="text-muted-foreground">Référence paiement</p>
                        <p className="font-semibold text-xs">{order.paymentReference}</p>
                      </div>
                    )}
                  </div>

                  {/* Items */}
                  {order.items && order.items.length > 0 && (
                    <div className="pt-4 border-t">
                      <p className="text-sm font-semibold mb-3">Articles ({order.items.length})</p>
                      <Table>
                        <TableHeader>
                          <TableRow className="border-0">
                            <TableHead className="text-xs">Produit</TableHead>
                            <TableHead className="text-xs text-right">Quantité</TableHead>
                            <TableHead className="text-xs text-right">Prix unitaire</TableHead>
                            <TableHead className="text-xs text-right">Sous-total</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {order.items.map((item) => (
                            <TableRow key={item.id} className="border-0">
                              <TableCell className="text-xs py-2">
                                Produit {item.productId.slice(0, 6)}
                              </TableCell>
                              <TableCell className="text-xs text-right py-2">{item.quantity}</TableCell>
                              <TableCell className="text-xs text-right py-2">
                                {item.unitPrice.toLocaleString("fr-CM", {
                                  style: "currency",
                                  currency: order.currency,
                                })}
                              </TableCell>
                              <TableCell className="text-xs text-right py-2 font-semibold">
                                {(item.quantity * item.unitPrice).toLocaleString("fr-CM", {
                                  style: "currency",
                                  currency: order.currency,
                                })}
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  )}

                  {/* Action */}
                  <div className="pt-4 border-t">
                    <Button variant="outline" className="w-full sm:w-auto">
                      Voir les détails
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
