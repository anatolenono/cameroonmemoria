"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Loader2, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useSession } from "@/lib/auth-client";
import { useRouter } from "next/navigation";

interface OrderDetail {
  id: string;
  status: string;
  orderType: string;
  totalAmount: number;
  currency: string;
  deceasedName?: string | null;
  clientInstructions?: string | null;
  paymentMethod?: string | null;
  paidAt?: string | null;
  assignedProvider?: { id: string; companyName: string } | null;
  assignedAt?: string | null;
  createdAt: string;
  updatedAt: string;
  items: Array<{
    id: string;
    productName: string;
    productPrice: number;
    quantity: number;
    subtotal: number;
  }>;
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

export default function OrderDetailPage() {
  const params = useParams();
  const orderId = params.id as string;
  const session = useSession();
  const router = useRouter();
  const [order, setOrder] = useState<OrderDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!session) {
      router.push("/login");
      return;
    }

    const fetchOrder = async () => {
      try {
        setLoading(true);
        const res = await fetch(`/api/marketplace/orders/${orderId}`);
        const data = await res.json();

        if (!res.ok) throw new Error(data.error);
        setOrder(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Erreur");
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [orderId, session, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-gris-lavande/5">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gris-lavande/5 to-transparent">
        <div className="max-w-4xl mx-auto px-4 py-12">
          <Link href="/marketplace" className="flex items-center gap-2 text-primary hover:underline mb-6">
            <ArrowLeft className="h-4 w-4" />
            Retour aux achats
          </Link>
          <div className="rounded-lg border border-red-200 bg-red-50 p-6 text-red-700 text-center">
            <p>{error || "Commande non trouvée"}</p>
          </div>
        </div>
      </div>
    );
  }

  const statusInfo = statusLabels[order.status] || statusLabels.PENDING_PAYMENT;

  return (
    <div className="min-h-screen bg-gradient-to-b from-gris-lavande/5 to-transparent">
      <div className="max-w-4xl mx-auto px-4 py-8 sm:py-12">
        <Link href="/marketplace" className="flex items-center gap-2 text-primary hover:underline mb-8">
          <ArrowLeft className="h-4 w-4" />
          Retour aux achats
        </Link>

        <div className="mb-8">
          <h1 className="font-display text-3xl font-bold tracking-tight text-gris-lavande mb-2">
            Commande {order.id.slice(0, 8)}
          </h1>
          <Badge className={statusInfo.color}>{statusInfo.label}</Badge>
        </div>

        <div className="space-y-6">
          {/* Infos generales */}
          <Card>
            <CardHeader>
              <CardTitle>Informations générales</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <p className="text-sm text-muted-foreground">Type de cérémonie</p>
                  <p className="font-semibold">
                    {order.orderType === "RECENT_DEATH" ? "Décès récent" : "Anniversaire de décès"}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Créée le</p>
                  <p className="font-semibold">
                    {new Date(order.createdAt).toLocaleDateString("fr-CM")}
                  </p>
                </div>
                {order.deceasedName && (
                  <div>
                    <p className="text-sm text-muted-foreground">Nom du défunt</p>
                    <p className="font-semibold">{order.deceasedName}</p>
                  </div>
                )}
                {order.clientInstructions && (
                  <div className="md:col-span-2">
                    <p className="text-sm text-muted-foreground">Instructions</p>
                    <p className="font-semibold text-sm">{order.clientInstructions}</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Articles */}
          <Card>
            <CardHeader>
              <CardTitle>Articles</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {order.items.map((item) => (
                <div key={item.id} className="flex justify-between border-b pb-3 last:border-0">
                  <div>
                    <p className="font-semibold">{item.productName}</p>
                    <p className="text-sm text-muted-foreground">
                      {item.productPrice.toLocaleString("fr-CM", {
                        style: "currency",
                        currency: order.currency,
                      })}{" "}
                      × {item.quantity}
                    </p>
                  </div>
                  <p className="font-semibold">
                    {item.subtotal.toLocaleString("fr-CM", {
                      style: "currency",
                      currency: order.currency,
                    })}
                  </p>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Statut de paiement */}
          <Card>
            <CardHeader>
              <CardTitle>Paiement</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center pb-4 border-b">
                <span className="font-semibold">Total</span>
                <span className="text-xl font-bold text-primary">
                  {order.totalAmount.toLocaleString("fr-CM", {
                    style: "currency",
                    currency: order.currency,
                  })}
                </span>
              </div>
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">Statut</p>
                <p className="font-semibold">{statusInfo.label}</p>
              </div>
              {order.status === "PENDING_PAYMENT" && (
                <Button className="w-full" disabled>
                  Paiement en ligne (à venir)
                </Button>
              )}
            </CardContent>
          </Card>

          {/* Prestataire assigné */}
          {order.assignedProvider && (
            <Card>
              <CardHeader>
                <CardTitle>Prestataire assigné</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="font-semibold">{order.assignedProvider.companyName}</p>
                <p className="text-sm text-muted-foreground">
                  Assignée le {new Date(order.assignedAt || "").toLocaleDateString("fr-CM")}
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
