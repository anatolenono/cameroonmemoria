"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Heart, Plus, Search, Users, Loader2, ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { AnnouncementCard } from "@/components/AnnouncementCard";
import { announcementApiService, type TransformedAnnouncement } from "@/features/feature-announcement/presentation/services/announcementApiService";
import { useRouter } from "next/navigation";

const QUOTES = [
  { text: "La mémoire est le parfum de l'âme", author: "Un lieu de recueillement pour notre communauté" },
  { text: "Il y a quelque chose de plus fort que la mort, c'est la présence des absents dans la mémoire des vivants.", author: "Jean d'Ormesson" },
  { text: "Nous sommes ce que nous nous rappelons. Sans mémoire, nous ne sommes rien.", author: "Umberto Eco" },
  { text: "Le deuil est comme un tronc d'arbre : il est trop lourd pour une seule personne, mais léger quand tout le village le porte.", author: "Proverbe africain" },
  { text: "Un homme ne meurt vraiment que lorsque son nom n'est plus prononcé.", author: "Proverbe camerounais" },
];

export default function HomePage() {
  const [recentAnnouncements, setRecentAnnouncements] = useState<TransformedAnnouncement[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Nouveaux états pour la recherche
  const [search, setSearch] = useState("");
  const router = useRouter();

  // Carousel
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const updateScrollButtons = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 0);
    setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 1);
  }, []);

  const scroll = useCallback((direction: "left" | "right") => {
    const el = scrollRef.current;
    if (!el) return;
    const cardWidth = 320;
    el.scrollBy({ left: direction === "left" ? -cardWidth : cardWidth, behavior: "smooth" });
  }, []);

  useEffect(() => {
    updateScrollButtons();
  }, [recentAnnouncements, updateScrollButtons]);

  // Rotation des citations
  const [quoteIndex, setQuoteIndex] = useState(0);
  const [quoteVisible, setQuoteVisible] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => {
      setQuoteVisible(false);
      setTimeout(() => {
        setQuoteIndex((prev) => (prev + 1) % QUOTES.length);
        setQuoteVisible(true);
      }, 600);
    }, 6000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const fetchRecentAnnouncements = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const announcements = await announcementApiService.getRecentAnnouncements(8);
        setRecentAnnouncements(announcements);
      } catch (error) {
        console.error("Erreur lors de la récupération des annonces:", error);
        setError("Impossible de charger les annonces récentes.");
      } finally {
        setLoading(false);
      }
    };

    fetchRecentAnnouncements();
  }, []);

  // Gestion de la soumission du formulaire de recherche
  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    const params = new URLSearchParams();
    if (search.trim()) params.set("q", search.trim());
    router.push(`/announcements?${params.toString()}`);
  }

  return (
    <div className="space-y-16">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-peche-claire/30 via-sable-clair/40 to-kaki-doux/20 rounded-2xl overflow-hidden">
        <div className="relative flex flex-col items-center justify-center min-h-[65vh] py-16 px-6">
          {/* En-tête avec icône */}
          <div className="mb-6 p-4 bg-white/80 backdrop-blur-sm rounded-full shadow-md">
            <Image
              src="/assets/logo.svg"
              alt="Cameroon Memoria"
              width={40}
              height={40}
              className="h-10 w-10"
            />
          </div>

          {/* Titre principal */}
          <h1 className="font-display text-3xl sm:text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight text-terre-cuite mb-4 text-center px-4">
            Honorons leur mémoire
          </h1>

          {/* Sous-titre chaleureux */}
          <p className="font-body text-base sm:text-lg md:text-xl text-gris-lavande/90 max-w-3xl mx-auto mb-3 text-center leading-relaxed px-4">
            Un espace de recueillement et de partage pour célébrer la vie de nos êtres chers
          </p>
          <p className="font-body text-sm sm:text-base md:text-lg text-gris-lavande/75 max-w-2xl mx-auto mb-8 text-center px-4">
            Rejoignez la communauté camerounaise dans le souvenir et la solidarité
          </p>

          {/* Barre de recherche élégante */}
          <form
            onSubmit={handleSearch}
            className="w-full max-w-2xl mb-8 px-4 sm:px-0"
          >
            <div className="relative group">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-terre-cuite to-kaki-doux rounded-full opacity-20 group-hover:opacity-30 transition duration-300 blur"></div>
              <div className="relative flex items-center gap-2 sm:gap-3 bg-white rounded-full shadow-lg px-3 sm:px-6 py-3 sm:py-4 hover:shadow-xl transition-shadow duration-300">
                <Search className="h-4 w-4 sm:h-5 sm:w-5 text-terre-cuite/60 flex-shrink-0" />
                <input
                  type="text"
                  placeholder="Nom ou lieu..."
                  className="flex-1 bg-transparent border-none outline-none text-sm sm:text-base md:text-lg placeholder:text-gris-lavande/50 font-body min-w-0"
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  aria-label="Recherche par nom ou lieu"
                />
                <Button
                  type="submit"
                  size="sm"
                  className="rounded-full px-3 sm:px-6 py-2 text-xs sm:text-sm bg-terre-cuite hover:bg-terre-cuite/90 transition-all duration-300 flex-shrink-0"
                >
                  <span className="hidden sm:inline">Rechercher</span>
                  <Search className="h-4 w-4 sm:hidden" />
                </Button>
              </div>
            </div>
          </form>

          {/* Boutons d'action */}
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center items-center w-full px-4 sm:px-0 max-w-md sm:max-w-none">
            <Button asChild size="lg" className="w-full sm:w-auto text-sm sm:text-base md:text-lg px-6 sm:px-8 py-5 sm:py-6 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 bg-terre-cuite hover:bg-terre-cuite/90">
              <Link href="/announcements">
                <Heart className="mr-2 h-4 w-4 sm:h-5 sm:w-5" />
                Parcourir les annonces
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="w-full sm:w-auto text-sm sm:text-base md:text-lg px-6 sm:px-8 py-5 sm:py-6 rounded-full border-2 border-terre-cuite/30 hover:border-terre-cuite/50 hover:bg-terre-cuite/5 transition-all duration-300">
              <Link href="/announcements/create">
                <Plus className="mr-2 h-4 w-4 sm:h-5 sm:w-5" />
                Publier une annonce
              </Link>
            </Button>
          </div>

          {/* Citations tournantes */}
          <div className="mt-8 sm:mt-12 text-center px-4 min-h-[3rem] flex flex-col items-center justify-center">
            <p
              className="font-body text-xs sm:text-sm text-gris-lavande/60 italic max-w-xl transition-opacity duration-600"
              style={{ opacity: quoteVisible ? 1 : 0 }}
            >
              &laquo;&nbsp;{QUOTES[quoteIndex].text}&nbsp;&raquo;
            </p>
            <p
              className="font-body text-xs text-gris-lavande/45 mt-1 transition-opacity duration-600"
              style={{ opacity: quoteVisible ? 1 : 0 }}
            >
              — {QUOTES[quoteIndex].author}
            </p>
          </div>
        </div>
      </section>

      {/* Recent Announcements */}
      <section className="space-y-10 py-8">
        <div className="text-center space-y-4">
          <h2 className="font-display text-3xl md:text-4xl font-bold tracking-tight text-gris-lavande">
            Annonces récentes
          </h2>
          <p className="font-body text-lg md:text-xl text-gris-lavande/70 max-w-2xl mx-auto">
            Les derniers hommages partagés par notre communauté
          </p>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="text-center space-y-4">
              <div className="relative">
                <div className="w-16 h-16 mx-auto bg-gradient-to-br from-terre-cuite/20 to-peche-claire/20 rounded-full flex items-center justify-center">
                  <Loader2 className="h-8 w-8 animate-spin text-terre-cuite" />
                </div>
              </div>
              <p className="font-body text-gris-lavande/70">Chargement des annonces récentes...</p>
            </div>
          </div>
        ) : error ? (
          <div className="text-center py-16">
            <div className="max-w-md mx-auto space-y-4">
              <div className="w-16 h-16 mx-auto bg-red-50 rounded-full flex items-center justify-center">
                <Heart className="h-8 w-8 text-red-400" />
              </div>
              <p className="font-body text-gris-lavande/70">{error}</p>
            </div>
          </div>
        ) : recentAnnouncements.length === 0 ? (
          <div className="text-center py-16">
            <div className="max-w-md mx-auto space-y-6">
              <div className="w-20 h-20 mx-auto bg-gradient-to-br from-sable-clair to-peche-claire/30 rounded-full flex items-center justify-center">
                <Heart className="h-10 w-10 text-terre-cuite/60" />
              </div>
              <div className="space-y-2">
                <p className="font-body text-lg text-gris-lavande">Aucune annonce disponible pour le moment</p>
                <p className="font-body text-base text-gris-lavande/60">Soyez le premier à créer une annonce et à honorer la mémoire d&apos;un être cher</p>
              </div>
              <Button asChild size="lg" className="mt-4">
                <Link href="/announcements/create">
                  <Plus className="mr-2 h-5 w-5" />
                  Créer une annonce
                </Link>
              </Button>
            </div>
          </div>
        ) : (
          <div className="relative">
            {/* Left arrow */}
            {canScrollLeft && (
              <button
                onClick={() => scroll("left")}
                className="absolute left-0 top-1/2 -translate-y-1/2 z-10 hidden md:flex h-10 w-10 items-center justify-center rounded-full bg-white shadow-lg border border-sable-clair/50 hover:bg-peche-claire/10 transition-colors"
                aria-label="Défiler vers la gauche"
              >
                <ChevronLeft className="h-5 w-5 text-gris-lavande" />
              </button>
            )}

            {/* Scrollable container */}
            <div
              ref={scrollRef}
              onScroll={updateScrollButtons}
              onLoad={updateScrollButtons}
              className="flex gap-6 overflow-x-auto pt-20 pb-4 px-1 snap-x snap-mandatory scrollbar-hide"
              style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
            >
              {recentAnnouncements.map((announcement) => (
                <div key={announcement.id} className="w-[300px] shrink-0 snap-start">
                  <AnnouncementCard {...announcement} />
                </div>
              ))}
            </div>

            {/* Right arrow */}
            {canScrollRight && (
              <button
                onClick={() => scroll("right")}
                className="absolute right-0 top-1/2 -translate-y-1/2 z-10 hidden md:flex h-10 w-10 items-center justify-center rounded-full bg-white shadow-lg border border-sable-clair/50 hover:bg-peche-claire/10 transition-colors"
                aria-label="Défiler vers la droite"
              >
                <ChevronRight className="h-5 w-5 text-gris-lavande" />
              </button>
            )}
          </div>
        )}

        {!loading && !error && recentAnnouncements.length > 0 && (
          <div className="text-center pt-4">
            <Button asChild variant="outline" size="lg" className="rounded-full px-8 border-2 hover:border-terre-cuite/50 hover:bg-terre-cuite/5 transition-all duration-300">
              <Link href="/announcements">
                <Heart className="mr-2 h-4 w-4" />
                Voir toutes les annonces
              </Link>
            </Button>
          </div>
        )}
      </section>

      {/* Features Section */}
      <section className="space-y-12 py-8">
        <div className="text-center space-y-4">
          <h2 className="font-display text-3xl md:text-4xl font-bold tracking-tight text-gris-lavande">
            Un hommage digne et respectueux
          </h2>
          <p className="font-body text-lg md:text-xl text-gris-lavande/70 max-w-3xl mx-auto leading-relaxed">
            Partagez vos annonces de funérailles et commémorations avec simplicité, respect et dignité
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-3">
          <Card className="text-center border-none shadow-lg hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-white to-peche-claire/10">
            <CardHeader className="space-y-4 pb-8">
              <div className="mx-auto w-16 h-16 bg-gradient-to-br from-terre-cuite/20 to-terre-cuite/10 rounded-2xl flex items-center justify-center shadow-md">
                <Plus className="h-8 w-8 text-terre-cuite" />
              </div>
              <CardTitle className="font-display text-xl text-gris-lavande">Créez votre annonce</CardTitle>
              <CardDescription className="font-body text-base leading-relaxed text-gris-lavande/70">
                Rédigez facilement une annonce de funérailles, d&apos;anniversaire ou de remerciements avec tous les détails importants
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="text-center border-none shadow-lg hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-white to-sable-clair/30">
            <CardHeader className="space-y-4 pb-8">
              <div className="mx-auto w-16 h-16 bg-gradient-to-br from-kaki-doux/30 to-kaki-doux/10 rounded-2xl flex items-center justify-center shadow-md">
                <Users className="h-8 w-8 text-kaki-doux" />
              </div>
              <CardTitle className="font-display text-xl text-gris-lavande">Partagez avec la communauté</CardTitle>
              <CardDescription className="font-body text-base leading-relaxed text-gris-lavande/70">
                Votre annonce est partagée avec la communauté camerounaise pour informer, rassembler et soutenir
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="text-center border-none shadow-lg hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-white to-peche-claire/20">
            <CardHeader className="space-y-4 pb-8">
              <div className="mx-auto w-16 h-16 bg-gradient-to-br from-terre-cuite/20 to-peche-claire/30 rounded-2xl flex items-center justify-center shadow-md">
                <Heart className="h-8 w-8 text-terre-cuite" />
              </div>
              <CardTitle className="font-display text-xl text-gris-lavande">Honorez la mémoire</CardTitle>
              <CardDescription className="font-body text-base leading-relaxed text-gris-lavande/70">
                Permettez à vos proches et amis de rendre hommage, partager leurs condoléances et leur soutien
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-terre-cuite/10 via-peche-claire/30 to-sable-clair/50 p-12 md:p-16 text-center">
        <div className="absolute inset-0 bg-[url('/patterns/memorial-pattern.svg')] opacity-5"></div>
        <div className="relative space-y-8">
          <div className="space-y-4">
            <div className="inline-block p-3 bg-white/80 backdrop-blur-sm rounded-full shadow-md mb-4">
              <Heart className="h-8 w-8 text-terre-cuite" />
            </div>
            <h2 className="font-display text-3xl md:text-4xl font-bold tracking-tight text-gris-lavande">
              Créez votre annonce dès maintenant
            </h2>
            <p className="font-body text-lg md:text-xl text-gris-lavande/80 max-w-2xl mx-auto leading-relaxed">
              Rejoignez notre communauté et rendez hommage à vos êtres chers avec respect, dignité et compassion
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button asChild size="lg" className="text-base md:text-lg px-10 py-6 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 bg-terre-cuite hover:bg-terre-cuite/90">
              <Link href="/announcements/create">
                <Plus className="mr-2 h-5 w-5" />
                Publier une annonce
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="text-base md:text-lg px-10 py-6 rounded-full border-2 border-gris-lavande/30 hover:border-gris-lavande/50 bg-white/80 backdrop-blur-sm hover:bg-white transition-all duration-300">
              <Link href="/announcements">
                <Heart className="mr-2 h-5 w-5" />
                Parcourir les annonces
              </Link>
            </Button>
          </div>

          <p className="font-body text-sm text-gris-lavande/60 italic pt-4">
            Un espace bienveillant pour honorer la mémoire et soutenir notre communauté
          </p>
        </div>
      </section>
    </div>
  );
}
