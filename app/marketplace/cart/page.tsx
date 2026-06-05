"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
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
import { Trash2, ArrowLeft, Loader2 } from "lucide-react";
import Link from "next/link";
import { useCart } from "@/hooks/useCart";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import { useSession } from "@/lib/auth-client";

type OrderType = "RECENT_DEATH" | "COMMEMORATION";

export default function CartPage() {
  const { items, removeItem, updateQuantity, clearCart, getTotalAmount } = useCart();
  const router = useRouter();
  const { toast } = useToast();
  const session = useSession();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [orderType, setOrderType] = useState<OrderType>("RECENT_DEATH");
  const [deceasedName, setDeceasedName] = useState("");
  const [clientInstructions, setClientInstructions] = useState("");

  const totalAmount = getTotalAmount();

  const handleCheckout = async () => {
    if (!session) {
      router.push("/login");
      return;
    }

    if (items.length === 0) {
      toast({
        title: "Panier vide",
        description: "Ajoutez des produits avant de passer commande",
        variant: "destructive",
      });
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/marketplace/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderType,
          deceasedName: deceasedName || undefined,
          clientInstructions: clientInstructions || undefined,
          items: items.map((item) => ({
            productId: item.productId,
            quantity: item.quantity,
          })),
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      clearCart();
      setDialogOpen(false);
      toast({
        title: "Commande créée",
        description: "Votre commande a été créée avec succès",
      });

      // Redirige vers la page de commande
      router.push(`/marketplace/orders/${data.id}`);
    } catch (error) {
      toast({
        title: "Erreur",
        description: error instanceof Error ? error.message : "Erreur lors de la création",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gris-lavande/5 to-transparent">
      <div className="max-w-4xl mx-auto px-4 py-8 sm:py-12">
        <Link href="/marketplace" className="flex items-center gap-2 text-primary hover:underline mb-8">
          <ArrowLeft className="h-4 w-4" />
          Retour aux prestataires
        </Link>

        <div className="mb-8">
          <h1 className="font-display text-3xl font-bold tracking-tight text-gris-lavande mb-2">
            Panier
          </h1>
          <p className="text-muted-foreground">
            {items.length} article{items.length !== 1 ? "s" : ""}
          </p>
        </div>

        {items.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center text-muted-foreground">
              <p className="mb-4">Votre panier est vide</p>
              <Link href="/marketplace">
                <Button variant="outline">Continuer les achats</Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {/* Liste des articles */}
            <Card>
              <CardHeader>
                <CardTitle>Articles du panier</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {items.map((item) => (
                  <div
                    key={item.productId}
                    className="flex items-start justify-between border-b pb-4 last:border-0"
                  >
                    <div className="flex-1">
                      <h3 className="font-semibold">{item.productName}</h3>
                      <p className="text-sm text-muted-foreground">{item.providerName}</p>
                      <p className="text-sm font-medium mt-1">
                        {item.price.toLocaleString("fr-CM", {
                          style: "currency",
                          currency: item.currency,
                        })} × {item.quantity} =
                        {(item.price * item.quantity).toLocaleString("fr-CM", {
                          style: "currency",
                          currency: item.currency,
                        })}
                      </p>
                    </div>
                    <div className="flex items-center gap-3 ml-4">
                      <Input
                        type="number"
                        min="1"
                        value={item.quantity}
                        onChange={(e) =>
                          updateQuantity(item.productId, parseInt(e.target.value) || 1)
                        }
                        className="w-16 text-center"
                      />
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => removeItem(item.productId)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Résumé */}
            <Card>
              <CardHeader>
                <CardTitle>Résumé</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between text-lg font-bold">
                  <span>Total :</span>
                  <span>
                    {totalAmount.toLocaleString("fr-CM", {
                      style: "currency",
                      currency: "XAF",
                    })}
                  </span>
                </div>
                <Button
                  className="w-full"
                  onClick={() => setDialogOpen(true)}
                  disabled={items.length === 0}
                >
                  Passer commande
                </Button>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Dialog de commande */}
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent className="max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Passer commande</DialogTitle>
              <DialogDescription>
                Veuillez fournir les informations relatives à votre commande
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="orderType">Type de cérémonie *</Label>
                <Select value={orderType} onValueChange={(v) => setOrderType(v as OrderType)}>
                  <SelectTrigger id="orderType">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="RECENT_DEATH">Décès récent</SelectItem>
                    <SelectItem value="COMMEMORATION">Anniversaire de décès</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="deceasedName">Nom du défunt</Label>
                <Input
                  id="deceasedName"
                  value={deceasedName}
                  onChange={(e) => setDeceasedName(e.target.value)}
                  placeholder="Ex : Jean Dupont"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="instructions">Instructions spéciales</Label>
                <Textarea
                  id="instructions"
                  value={clientInstructions}
                  onChange={(e) => setClientInstructions(e.target.value)}
                  placeholder="Détails importants pour la prestation..."
                  rows={4}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setDialogOpen(false)}>
                Annuler
              </Button>
              <Button onClick={handleCheckout} disabled={submitting}>
                {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Créer la commande
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
