"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Loader2, CheckCircle, Store } from "lucide-react";

interface Category {
  id: string;
  name: string;
  description?: string | null;
}

interface ExistingProvider {
  id: string;
  companyName: string;
  status: "PENDING" | "ACTIVE" | "SUSPENDED";
}

const STATUS_LABEL: Record<ExistingProvider["status"], string> = {
  PENDING: "En cours de validation",
  ACTIVE: "Validé et actif",
  SUSPENDED: "Suspendu",
};

const STATUS_VARIANT: Record<ExistingProvider["status"], "default" | "secondary" | "destructive"> = {
  PENDING: "secondary",
  ACTIVE: "default",
  SUSPENDED: "destructive",
};

export default function BecomeProviderPage() {
  const { data: session, isPending } = useSession();
  const router = useRouter();

  const [categories, setCategories] = useState<Category[]>([]);
  const [existingProvider, setExistingProvider] = useState<ExistingProvider | null>(null);
  const [loadingInit, setLoadingInit] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [form, setForm] = useState({
    categoryId: "",
    companyName: "",
    companyAddress: "",
    companyCity: "",
    companyPhone: "",
    companyEmail: "",
    companyDescription: "",
    repName: "",
    repPhone: "",
    repEmail: "",
    mobileMoneyNumber: "",
    mobileMoneyOperator: "",
  });

  useEffect(() => {
    if (isPending) return;
    if (!session) {
      router.push("/login?next=/marketplace/become-provider");
      return;
    }
    (async () => {
      try {
        const [catRes, provRes] = await Promise.all([
          fetch("/api/marketplace/categories"),
          fetch("/api/marketplace/provider/register"),
        ]);
        const catData = await catRes.json();
        const provData = await provRes.json();
        setCategories(catData.categories || []);
        if (provData.provider) {
          setExistingProvider(provData.provider);
        }
      } catch {
        setError("Impossible de charger les données");
      } finally {
        setLoadingInit(false);
      }
    })();
  }, [session, isPending, router]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const res = await fetch("/api/marketplace/provider/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setSubmitted(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur lors de l'inscription");
    } finally {
      setSubmitting(false);
    }
  }

  const f = (field: keyof typeof form) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => setForm({ ...form, [field]: e.target.value });

  if (isPending || loadingInit) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (submitted || existingProvider) {
    const provider = existingProvider;
    return (
      <div className="max-w-lg mx-auto px-4 py-16 text-center space-y-6">
        <div className="flex justify-center">
          <div className="rounded-full bg-green-100 p-4">
            <CheckCircle className="h-10 w-10 text-green-600" />
          </div>
        </div>
        {submitted ? (
          <>
            <h1 className="text-2xl font-bold">Inscription soumise !</h1>
            <p className="text-muted-foreground">
              Votre dossier est en cours de validation par notre équipe. Vous serez contacté
              une fois votre compte activé.
            </p>
          </>
        ) : (
          <>
            <h1 className="text-2xl font-bold">Dossier déjà soumis</h1>
            <p className="text-muted-foreground">
              Vous avez déjà soumis une demande pour{" "}
              <strong>{provider?.companyName}</strong>.
            </p>
            <Badge variant={STATUS_VARIANT[provider!.status]}>
              {STATUS_LABEL[provider!.status]}
            </Badge>
          </>
        )}
        <Button variant="outline" onClick={() => router.push("/")}>
          Retour à l&apos;accueil
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-12">
      <div className="mb-8 text-center">
        <div className="flex justify-center mb-4">
          <div className="rounded-full bg-terre-cuite/10 p-4">
            <Store className="h-8 w-8 text-terre-cuite" />
          </div>
        </div>
        <h1 className="text-3xl font-bold">Devenir prestataire</h1>
        <p className="mt-2 text-muted-foreground">
          Rejoignez notre réseau et proposez vos services aux familles dans le deuil.
        </p>
      </div>

      {error && (
        <div className="mb-6 rounded-md bg-red-50 border border-red-200 p-4 text-red-700 text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Catégorie */}
        <Card>
          <CardHeader>
            <CardTitle>Catégorie d&apos;activité</CardTitle>
            <CardDescription>Sélectionnez le type de services que vous proposez</CardDescription>
          </CardHeader>
          <CardContent>
            <Select
              value={form.categoryId}
              onValueChange={(v) => setForm({ ...form, categoryId: v })}
              required
            >
              <SelectTrigger>
                <SelectValue placeholder="Choisir une catégorie…" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </CardContent>
        </Card>

        {/* Entreprise */}
        <Card>
          <CardHeader>
            <CardTitle>Informations entreprise</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2 space-y-1">
              <Label>Nom de l&apos;entreprise *</Label>
              <Input value={form.companyName} onChange={f("companyName")} required placeholder="Ex : Fleurs du Paradis" />
            </div>
            <div className="space-y-1">
              <Label>Ville</Label>
              <Input value={form.companyCity} onChange={f("companyCity")} placeholder="Yaoundé" />
            </div>
            <div className="space-y-1">
              <Label>Adresse</Label>
              <Input value={form.companyAddress} onChange={f("companyAddress")} placeholder="Quartier, rue…" />
            </div>
            <div className="space-y-1">
              <Label>Téléphone</Label>
              <Input value={form.companyPhone} onChange={f("companyPhone")} placeholder="+237 6XX XX XX XX" />
            </div>
            <div className="space-y-1">
              <Label>Email professionnel</Label>
              <Input type="email" value={form.companyEmail} onChange={f("companyEmail")} placeholder="contact@entreprise.cm" />
            </div>
            <div className="sm:col-span-2 space-y-1">
              <Label>Description de l&apos;activité</Label>
              <Textarea
                value={form.companyDescription}
                onChange={f("companyDescription")}
                rows={3}
                placeholder="Décrivez brièvement vos services…"
              />
            </div>
          </CardContent>
        </Card>

        {/* Représentant */}
        <Card>
          <CardHeader>
            <CardTitle>Représentant légal</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2 space-y-1">
              <Label>Nom complet *</Label>
              <Input value={form.repName} onChange={f("repName")} required placeholder="Prénom et Nom" />
            </div>
            <div className="space-y-1">
              <Label>Téléphone *</Label>
              <Input value={form.repPhone} onChange={f("repPhone")} required placeholder="+237 6XX XX XX XX" />
            </div>
            <div className="space-y-1">
              <Label>Email</Label>
              <Input type="email" value={form.repEmail} onChange={f("repEmail")} placeholder="rep@exemple.cm" />
            </div>
          </CardContent>
        </Card>

        {/* Mobile Money */}
        <Card>
          <CardHeader>
            <CardTitle>Mobile Money</CardTitle>
            <CardDescription>Pour le versement de vos commissions</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1">
              <Label>Numéro Mobile Money</Label>
              <Input value={form.mobileMoneyNumber} onChange={f("mobileMoneyNumber")} placeholder="+237 6XX XX XX XX" />
            </div>
            <div className="space-y-1">
              <Label>Opérateur</Label>
              <Select
                value={form.mobileMoneyOperator}
                onValueChange={(v) => setForm({ ...form, mobileMoneyOperator: v })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Choisir…" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="MTN_MoMo">MTN Mobile Money</SelectItem>
                  <SelectItem value="Orange_Money">Orange Money</SelectItem>
                  <SelectItem value="Express_Union">Express Union</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        <Button type="submit" className="w-full" size="lg" disabled={submitting || !form.categoryId}>
          {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Soumettre ma demande
        </Button>
      </form>
    </div>
  );
}
