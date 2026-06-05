"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Loader2, MapPin, Phone, Mail, ArrowLeft, ShoppingCart } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useCart } from "@/hooks/useCart";
import { useToast } from "@/hooks/use-toast";

interface Category {
  id: string;
  name: string;
  slug: string;
}

interface Product {
  id: string;
  name: string;
  description?: string | null;
  price: number;
  currency: string;
  imageUrl?: string | null;
  conditions?: string | null;
}

interface ProviderDetail {
  provider: {
    id: string;
    companyName: string;
    companyCity: string;
    companyDescription?: string | null;
    companyPhone?: string | null;
    companyEmail?: string | null;
    category?: Category;
  };
  products: Product[];
}

export default function ProviderDetailPage() {
  const params = useParams();
  const providerId = params.providerId as string;
  const [data, setData] = useState<ProviderDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { addItem } = useCart();
  const { toast } = useToast();

  const handleAddToCart = (product: Product) => {
    if (!data?.provider) return;

    addItem({
      productId: product.id,
      productName: product.name,
      price: product.price,
      quantity: 1,
      currency: product.currency,
      providerId: providerId,
      providerName: data.provider.companyName,
    });

    toast({
      title: "Ajouté au panier",
      description: `${product.name} a été ajouté au panier`,
    });
  };

  useEffect(() => {
    if (!providerId) return;

    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await fetch(`/api/marketplace/providers/${providerId}`);
        const result = await res.json();

        if (!res.ok) {
          throw new Error(result.error || "Erreur lors du chargement");
        }

        setData(result);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Erreur");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [providerId]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-gris-lavande/5">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gris-lavande/5 to-transparent">
        <div className="max-w-4xl mx-auto px-4 py-12">
          <Link href="/marketplace" className="flex items-center gap-2 text-primary hover:underline mb-6">
            <ArrowLeft className="h-4 w-4" />
            Retour aux prestataires
          </Link>
          <div className="rounded-lg border border-red-200 bg-red-50 p-6 text-red-700 text-center">
            <p>{error || "Prestataire non trouvé"}</p>
          </div>
        </div>
      </div>
    );
  }

  const provider = data.provider;
  const products = data.products;

  return (
    <div className="min-h-screen bg-gradient-to-b from-gris-lavande/5 to-transparent">
      <div className="max-w-4xl mx-auto px-4 py-8 sm:py-12">
        {/* Back link */}
        <Link href="/marketplace" className="flex items-center gap-2 text-primary hover:underline mb-8">
          <ArrowLeft className="h-4 w-4" />
          Retour aux prestataires
        </Link>

        {/* Provider Header */}
        <Card className="mb-8">
          <CardHeader>
            <div className="space-y-4">
              <div>
                <h1 className="font-display text-3xl font-bold text-gris-lavande mb-2">
                  {provider.companyName}
                </h1>
                {provider.category && (
                  <Badge className="mb-3">{provider.category.name}</Badge>
                )}
              </div>

              {provider.companyDescription && (
                <p className="text-base text-muted-foreground">
                  {provider.companyDescription}
                </p>
              )}
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2">
              {provider.companyCity && (
                <div className="flex items-start gap-3">
                  <MapPin className="h-5 w-5 text-muted-foreground flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm text-muted-foreground">Localisation</p>
                    <p className="font-semibold">{provider.companyCity}</p>
                  </div>
                </div>
              )}
              {provider.companyPhone && (
                <div className="flex items-start gap-3">
                  <Phone className="h-5 w-5 text-muted-foreground flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm text-muted-foreground">Téléphone</p>
                    <a href={`tel:${provider.companyPhone}`} className="font-semibold hover:text-primary">
                      {provider.companyPhone}
                    </a>
                  </div>
                </div>
              )}
              {provider.companyEmail && (
                <div className="flex items-start gap-3">
                  <Mail className="h-5 w-5 text-muted-foreground flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm text-muted-foreground">Email</p>
                    <a href={`mailto:${provider.companyEmail}`} className="font-semibold hover:text-primary truncate">
                      {provider.companyEmail}
                    </a>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Products Section */}
        <div>
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-gris-lavande">
              Nos services et produits
            </h2>
            <p className="text-muted-foreground">
              {products.length === 0
                ? "Aucun produit disponible pour le moment"
                : `${products.length} produit${products.length > 1 ? "s" : ""} disponible${products.length > 1 ? "s" : ""}`}
            </p>
          </div>

          {products.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center text-muted-foreground">
                <p>Ce prestataire n&apos;a pas encore publié de produits</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {products.map((product) => (
                <Card key={product.id} className="hover:shadow-md transition-shadow">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg line-clamp-2">
                      {product.name}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {product.description && (
                      <p className="text-sm text-muted-foreground line-clamp-3">
                        {product.description}
                      </p>
                    )}

                    <div className="text-xl font-bold text-primary">
                      {product.price.toLocaleString("fr-CM", {
                        style: "currency",
                        currency: product.currency,
                      })}
                    </div>

                    {product.conditions && (
                      <div className="bg-gray-50 rounded p-3 text-xs text-muted-foreground">
                        <p className="font-semibold mb-1">Conditions :</p>
                        <p className="line-clamp-2">{product.conditions}</p>
                      </div>
                    )}

                    <Button
                      className="w-full mt-4"
                      variant="default"
                      onClick={() => handleAddToCart(product)}
                    >
                      <ShoppingCart className="h-4 w-4 mr-2" />
                      Ajouter au panier
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
