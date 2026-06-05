"use client";

import { useEffect, useState, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Loader2, MapPin, Phone, Mail, Search } from "lucide-react";
import Link from "next/link";

interface Category {
  id: string;
  name: string;
  slug: string;
}

interface Provider {
  id: string;
  categoryId: string;
  category?: Category;
  companyName: string;
  companyCity: string;
  companyDescription?: string | null;
  companyPhone?: string | null;
  companyEmail?: string | null;
}

export default function MarketplacePage() {
  const [providers, setProviders] = useState<Provider[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [searchCity, setSearchCity] = useState<string>("");

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams();
      if (selectedCategory) params.append("categoryId", selectedCategory);
      if (searchCity) params.append("city", searchCity);

      const [providersRes, categoriesRes] = await Promise.all([
        fetch(`/api/marketplace/providers?${params.toString()}`),
        fetch("/api/marketplace/categories"),
      ]);

      if (!providersRes.ok) throw new Error("Erreur lors du chargement des prestataires");
      if (!categoriesRes.ok) throw new Error("Erreur lors du chargement des catégories");

      const providersData = await providersRes.json();
      const categoriesData = await categoriesRes.json();

      setProviders(providersData.providers || []);
      setCategories(categoriesData.categories || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur");
    } finally {
      setLoading(false);
    }
  }, [selectedCategory, searchCity]);

  useEffect(() => { fetchData(); }, [fetchData]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-gris-lavande/5 to-transparent">
      <div className="max-w-7xl mx-auto px-4 py-8 sm:py-12">
        {/* Header */}
        <div className="mb-12 text-center">
          <h1 className="font-display text-4xl font-bold tracking-tight text-gris-lavande mb-3">
            Nos prestataires funéraires
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Découvrez nos partenaires agréés pour tous vos besoins lors de cette période difficile
          </p>
        </div>

        {/* Filters */}
        <div className="mb-8 space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm font-medium">Catégorie</label>
              <select
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
              >
                <option value="">Toutes les catégories</option>
                {categories.map(cat => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Ville</label>
              <div className="relative">
                <Search className="absolute left-2.5 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Rechercher par ville..."
                  value={searchCity}
                  onChange={(e) => setSearchCity(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>
          </div>
        </div>

        {error && (
          <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-700 mb-6">
            <p>{error}</p>
          </div>
        )}

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : providers.length === 0 ? (
          <Card className="text-center py-12">
            <CardContent className="text-muted-foreground">
              <p>Aucun prestataire trouvé avec ces critères</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {providers.map((provider) => (
              <Link key={provider.id} href={`/marketplace/${provider.id}`}>
                <Card className="h-full hover:shadow-lg hover:border-primary/50 transition-all cursor-pointer">
                  <CardHeader className="pb-2">
                    <div className="space-y-2">
                      <CardTitle className="line-clamp-2">{provider.companyName}</CardTitle>
                      {provider.category && (
                        <Badge variant="outline" className="w-fit">
                          {provider.category.name}
                        </Badge>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {provider.companyDescription && (
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {provider.companyDescription}
                      </p>
                    )}

                    <div className="space-y-2 text-sm">
                      {provider.companyCity && (
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <MapPin className="h-4 w-4 flex-shrink-0" />
                          <span>{provider.companyCity}</span>
                        </div>
                      )}
                      {provider.companyPhone && (
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Phone className="h-4 w-4 flex-shrink-0" />
                          <span className="truncate">{provider.companyPhone}</span>
                        </div>
                      )}
                      {provider.companyEmail && (
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Mail className="h-4 w-4 flex-shrink-0" />
                          <span className="truncate">{provider.companyEmail}</span>
                        </div>
                      )}
                    </div>

                    <Button className="w-full mt-4" variant="outline">
                      Voir les produits
                    </Button>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
