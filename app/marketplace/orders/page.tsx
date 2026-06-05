"use client";

import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import Link from "next/link";
import { useSession } from "@/lib/auth-client";
import { useRouter } from "next/navigation";

interface Order {
  id: string;
  status: string;
  orderType: string;
  totalAmount: number;
  currency: string;
  deceasedName?: string | null;
  createdAt: string;
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

export default function OrdersListPage() {
  const session = useSession();
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!session) {
      router.push("/login");
      return;
    }

    const fetchOrders = async () => {
      try {
        setLoading(true);
        const res = await fetch("/api/marketplace/orders");
        const data = await res.json();

        if (!res.ok) throw new Error(data.error);
        setOrders(data.orders || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Erreur");
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [session, router]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-gris-lavande/5 to-transparent">
      <div className="max-w-6xl mx-auto px-4 py-8 sm:py-12">
        <div className="mb-8">
          <h1 className="font-display text-3xl font-bold tracking-tight text-gris-lavande mb-2">
            Mes commandes
          </h1>
          <p className="text-muted-foreground">
            Suivi de vos commandes et services
          </p>
        </div>

        {error && (
          <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-700 mb-6">
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
              <p className="mb-4">Vous n&apos;avez pas encore de commandes</p>
              <Link href="/marketplace">
                <Button>Parcourir les services</Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => {
              const statusInfo = statusLabels[order.status] || statusLabels.PENDING_PAYMENT;
              return (
                <Link key={order.id} href={`/marketplace/orders/${order.id}`}>
                  <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                    <CardContent className="py-4">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="font-semibold text-lg">
                              Commande {order.id.slice(0, 8)}
                            </h3>
                            <Badge className={statusInfo.color}>{statusInfo.label}</Badge>
                          </div>
                          <p className="text-sm text-muted-foreground mb-2">
                            {new Date(order.createdAt).toLocaleDateString("fr-CM")} •{" "}
                            {order.orderType === "RECENT_DEATH" ? "Décès récent" : "Anniversaire"}
                          </p>
                          {order.deceasedName && (
                            <p className="text-sm text-muted-foreground">
                              {order.deceasedName}
                            </p>
                          )}
                        </div>
                        <div className="text-right">
                          <p className="text-2xl font-bold text-primary">
                            {order.totalAmount.toLocaleString("fr-CM", {
                              style: "currency",
                              currency: order.currency,
                            })}
                          </p>
                          <Button variant="outline" size="sm" className="mt-2">
                            Voir détails
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
