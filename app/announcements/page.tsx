"use client";

import { useEffect, useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Heart, Loader2, Filter as FilterIcon, X, Calendar as CalendarIcon } from "lucide-react";
import Link from "next/link";
import { AnnouncementCard } from "@/components/AnnouncementCard";
import { Checkbox } from "@/components/ui/checkbox";
import type { TransformedAnnouncement } from "@/features/feature-announcement/presentation/services/announcementApiService";
import { useSearchParams, useRouter } from "next/navigation";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import type { DateRange } from "react-day-picker";
import { format, parseISO } from "date-fns";
import { announcementApiService, type AnnouncementFilters } from "@/features/feature-announcement/presentation/services/announcementApiService";

export default function AnnouncementsPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const searchInputRef = useRef<HTMLInputElement>(null);
  const [announcements, setAnnouncements] = useState<TransformedAnnouncement[]>([]);
  const [loading, setLoading] = useState(true);
  // États pour les filtres
  const [type, setType] = useState<string[]>([]); // multi-checkbox
  const [location, setLocation] = useState("");
  const [recentOnly, setRecentOnly] = useState(false);
  const [withDonations, setWithDonations] = useState(false);
  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined);
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  // Utilitaire pour convertir CheckedState en booléen
  function toBoolean(checked: boolean | "indeterminate") {
    return checked === true;
  }

  // Fonction pour fetch les annonces à partir des query params
  async function fetchAnnouncementsFromParams(searchParams: ReturnType<typeof useSearchParams>) {
    setLoading(true);
    try {
      const params: AnnouncementFilters = {};
      const q = searchParams.get("q") || "";
      if (q) params.q = q;
      const typeParam = searchParams.getAll("type");
      if (typeParam.length > 0) params.type = typeParam.join(",");
      const locationParam = searchParams.get("location") || "";
      if (locationParam) params.location = locationParam;
      const dateFrom = searchParams.get("dateFrom");
      const dateTo = searchParams.get("dateTo");
      if (dateFrom) params.dateFrom = dateFrom;
      if (dateTo) params.dateTo = dateTo;
      if (searchParams.get("withDonations") === "true") params.withDonations = "true";
      if (searchParams.get("recentOnly") === "true") params.recentOnly = "true";
      params.status = "PUBLISHED";
      const data = await announcementApiService.getAnnouncements(params);
      setAnnouncements(data);
    } catch {
      setAnnouncements([]);
    } finally {
      setLoading(false);
    }
  }

  // Fonction pour parser les query params et retourner les valeurs des filtres
  function parseFiltersFromSearchParams(searchParams: ReturnType<typeof useSearchParams>) {
    const q = searchParams.get("q") || "";
    const typeParam = searchParams.getAll("type");
    const type = typeParam.length > 0 ? typeParam : [];
    const location = searchParams.get("location") || "";
    const withDonations = searchParams.get("withDonations") === "true";
    const recentOnly = searchParams.get("recentOnly") === "true";
    const dateFrom = searchParams.get("dateFrom");
    const dateTo = searchParams.get("dateTo");
    const dateRange = (dateFrom || dateTo)
      ? {
          from: dateFrom ? parseISO(dateFrom) : undefined,
          to: dateTo ? parseISO(dateTo) : undefined,
        }
      : undefined;
    return { q, type, location, withDonations, recentOnly, dateRange };
  }

  // À chaque changement de query params, on parse les filtres ET on fetch les annonces
  useEffect(() => {
    const { q, type, location, withDonations, recentOnly, dateRange } = parseFiltersFromSearchParams(searchParams);
    if (searchInputRef.current) {
      searchInputRef.current.value = q;
    }
    setType(type);
    setLocation(location);
    setWithDonations(withDonations);
    setRecentOnly(recentOnly);
    setDateRange(dateRange);
    // Fetch les annonces
    fetchAnnouncementsFromParams(searchParams);
  }, [searchParams]);

  // Soumission des filtres
  function handleApplyFilters() {
    const params = new URLSearchParams();
    const q = searchInputRef.current?.value;
    if (q) params.set("q", q);
    type.forEach(t => params.append("type", t));
    if (location) params.set("location", location);
    if (dateRange?.from) params.set("dateFrom", format(dateRange.from, "yyyy-MM-dd"));
    if (dateRange?.to) params.set("dateTo", format(dateRange.to, "yyyy-MM-dd"));
    if (withDonations) params.set("withDonations", "true");
    if (recentOnly) params.set("recentOnly", "true");
    router.push(`/announcements${params.toString() ? `?${params.toString()}` : ""}`);
    setShowMobileFilters(false);
  }

  // Reset des filtres
  function handleClearFilters() {
    router.push("/announcements");
    setShowMobileFilters(false);
  }

  // Composant Sidebar (réutilisé dans Drawer mobile et desktop)
  function FiltersSidebar() {
    return (
      <div className="w-full max-w-xs bg-white md:bg-transparent md:border-none border-r pr-0 pl-2 md:pr-6 pt-4 md:pt-4 h-full overflow-y-auto">
        <div className="flex items-center justify-between mb-4 md:mb-4">
          <h2 className="text-lg font-bold">Filtres</h2>
          <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setShowMobileFilters(false)} aria-label="Fermer les filtres">
            <X className="h-5 w-5" />
          </Button>
        </div>
        {/* Searchbar pour nom ou titre */}
        <div className="mb-6">
          <input
            ref={searchInputRef}
            type="text"
            placeholder="Nom du défunt ou titre de l'annonce"
            className="w-full px-3 py-2 border rounded-md"
            defaultValue={searchParams.get("q") || ""}
            aria-label="Recherche par nom ou titre"
          />
        </div>
        {/* Type d&apos;annonce */}
        <div className="mb-6">
          <div className="font-semibold mb-2">Type d&apos;annonce</div>
          <div className="flex flex-col gap-2">
            <label className="flex items-center gap-2 cursor-pointer">
              <Checkbox checked={type.includes("death_notice")} onCheckedChange={checked => setType(t => checked ? [...t, "death_notice"] : t.filter(x => x !== "death_notice"))} />
              Avis de décès
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <Checkbox checked={type.includes("funeral")} onCheckedChange={checked => setType(t => checked ? [...t, "funeral"] : t.filter(x => x !== "funeral"))} />
              Funérailles
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <Checkbox checked={type.includes("anniversary")} onCheckedChange={checked => setType(t => checked ? [...t, "anniversary"] : t.filter(x => x !== "anniversary"))} />
              Anniversaire
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <Checkbox checked={type.includes("thanks")} onCheckedChange={checked => setType(t => checked ? [...t, "thanks"] : t.filter(x => x !== "thanks"))} />
              Remerciements
            </label>
          </div>
        </div>
        {/* Lieu */}
        <div className="mb-6">
          <div className="font-semibold mb-2">Lieu</div>
          <input
            type="text"
            placeholder="Ville, région..."
            className="w-full px-3 py-2 border rounded-md"
            value={location}
            onChange={e => setLocation(e.target.value)}
          />
        </div>
        {/* Période */}
        <div className="mb-6">
          <div className="font-semibold mb-2">Période</div>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={`w-full justify-start text-left font-normal ${!dateRange?.from ? "text-muted-foreground" : ""}`}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {dateRange?.from && dateRange?.to
                  ? `${format(dateRange.from, "dd/MM/yyyy")} - ${format(dateRange.to, "dd/MM/yyyy")}`
                  : dateRange?.from
                  ? format(dateRange.from, "dd/MM/yyyy")
                  : "Sélectionner une période"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="range"
                selected={dateRange}
                onSelect={setDateRange}
                numberOfMonths={2}
                captionLayout="dropdown"
              />
            </PopoverContent>
          </Popover>
        </div>
        {/* Options supplémentaires */}
        <div className="mb-6 flex flex-col gap-2">
          <label className="flex items-center gap-2 cursor-pointer">
            <Checkbox checked={withDonations} onCheckedChange={checked => setWithDonations(toBoolean(checked))} />
            Annonces avec dons possibles
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <Checkbox checked={recentOnly} onCheckedChange={checked => setRecentOnly(toBoolean(checked))} />
            Annonces récentes (30 jours)
          </label>
        </div>
        {/* Actions */}
        <div className="flex gap-2 pb-4">
          <Button variant="outline" size="sm" onClick={handleClearFilters}>
            Réinitialiser
          </Button>
          <Button size="sm" className="flex-1" onClick={handleApplyFilters}>
            Appliquer
          </Button>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin mx-auto" />
          <p className="text-muted-foreground">Chargement des annonces...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col md:flex-row gap-8">
      {/* Bouton Filtres mobile */}
      <div className="md:hidden flex justify-between items-center px-2 pt-4 pb-2">
        <h1 className="text-2xl font-bold">Annonces</h1>
        <Button variant="outline" size="sm" onClick={() => setShowMobileFilters(true)}>
          <FilterIcon className="h-5 w-5 mr-2" /> Filtres
        </Button>
      </div>
      {/* Drawer mobile */}
      {showMobileFilters && (
        <div className="fixed inset-0 z-40 bg-black/40 flex">
          <div className="bg-white w-80 max-w-full h-full shadow-lg animate-slide-in-left">
            <FiltersSidebar />
          </div>
          <div className="flex-1" onClick={() => setShowMobileFilters(false)} />
        </div>
      )}
      {/* Sidebar desktop */}
      <aside className="hidden md:block w-72 flex-shrink-0 border-r pr-6 pt-4">
        <FiltersSidebar />
      </aside>
      {/* Contenu principal */}
      <main className="flex-1 space-y-8 pt-4">
        <div className="hidden md:block text-center space-y-4">
          <h1 className="font-display text-4xl font-bold tracking-tight text-gris-lavande">Annonces</h1>
          <p className="font-body text-xl text-muted-foreground max-w-2xl mx-auto">
            Découvrez les annonces de funérailles et commémorations de notre communauté
          </p>
        </div>
        {/* CTA */}
        <div className="text-center">
          <Button asChild size="lg">
            <Link href="/announcements/create">
              <Heart className="mr-2 h-5 w-5" />
              Créer une annonce
            </Link>
          </Button>
        </div>
        {/* Grille d'annonces */}
        {announcements.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground text-lg">Aucune annonce trouvée.</p>
            <p className="text-muted-foreground">Soyez le premier à créer une annonce.</p>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 pt-20">
            {announcements.map((announcement) => (
              <AnnouncementCard
                key={announcement.id}
                {...announcement}
              />
            ))}
          </div>
        )}
        {/* Actualiser */}
        {announcements.length > 0 && (
          <div className="text-center">
            <Button variant="outline" size="lg" onClick={() => window.location.reload()}>
              Actualiser les annonces
            </Button>
          </div>
        )}
      </main>
    </div>
  );
} 