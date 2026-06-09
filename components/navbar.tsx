"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { useSession } from "@/lib/auth-client";
import { logoutUser } from "@/features/feature-auth/application/actions/auth";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import Image from "next/image";
import {
  DollarSign,
  Heart,
  Plus,
  Search,
  User,
  LogOut,
  Menu,
  X,
  Shield,
  Wallet,
} from "lucide-react";
import { getAnnouncementTypeLabel } from "@/lib/announcementTypeLabels";

export function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { data: session, isPending } = useSession();
  const [isClient, setIsClient] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  // Vérifier si l'utilisateur est administrateur
  useEffect(() => {
    const checkAdminStatus = async () => {
      if (session?.user) {
        try {
          // Appeler l'API pour vérifier le statut d'administrateur
          const response = await fetch('/api/admin/stats');
          setIsAdmin(response.ok);
        } catch {
          setIsAdmin(false);
        }
      } else {
        setIsAdmin(false);
      }
    };

    checkAdminStatus();
  }, [session]);

  const isActive = (href: string) => {
    if (href === "/") {
      return pathname === "/";
    }
    return pathname.startsWith(href);
  };

  /**
   * Gère la déconnexion de l'utilisateur
   */
  const handleLogout = async () => {
    try {
      const result = await logoutUser();
      if ('error' in result) {
        console.error('Erreur de déconnexion:', result.error);
      } else {
        router.push('/');
        location.reload();
        // Fermer le menu mobile si ouvert
        setIsMobileMenuOpen(false);
      }
    } catch (error) {
      console.error('Erreur de déconnexion:', error);
    }
  };

  // Obtenir les informations utilisateur
  const user = session?.user;
  const isProvider = (user as any)?.role === 'PROVIDER';

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      {/* First Navbar - Logo + Create Button */}
      <div className="border-b bg-background">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          {/* Logo */}
          <Link href="/" className="flex items-center">
            <Image
              src="/assets/logo-title.svg"
              alt="Cameroon Memoria"
              width={180}
              height={40}
              className="h-8 md:h-10 w-auto"
              priority
            />
          </Link>

          {/* Desktop: Create announcement button */}
          <div className="flex items-center space-x-2 md:space-x-4">
            <Button asChild className="hidden md:flex">
              <Link href="/announcements/create">
                <Plus className="h-4 w-4 mr-2" />
                Créer une annonce
              </Link>
            </Button>

            {/* Mobile: User avatar or login + Menu button */}
            <div className="flex items-center gap-2 md:hidden">
              {isClient && (
                user ? (
                  <Button variant="ghost" size="icon" className="h-9 w-9 rounded-full" asChild>
                    <Link href="/profile">
                      <Avatar className="h-8 w-8">
                        <AvatarImage
                          src={user.image || undefined}
                          alt={user.name || user.email || "Avatar utilisateur"}
                        />
                        <AvatarFallback className="text-xs">
                          {(user.name || user.email || "U")
                            .split(" ")
                            .map((n) => n[0])
                            .join("")
                            .toUpperCase()
                            .slice(0, 2)}
                        </AvatarFallback>
                      </Avatar>
                    </Link>
                  </Button>
                ) : (
                  <Button variant="ghost" size="sm" asChild className="text-xs">
                    <Link href="/login">Connexion</Link>
                  </Button>
                )
              )}

              {/* Mobile menu button */}
              <Button
                variant="ghost"
                size="icon"
                className="h-9 w-9"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              >
                {isMobileMenuOpen ? (
                  <X className="h-5 w-5" />
                ) : (
                  <Menu className="h-5 w-5" />
                )}
                <span className="sr-only">Menu</span>
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Second Navbar - Navigation Links + User Menu (Desktop only) */}
      <div className="hidden md:block border-b bg-background">
        <div className="container mx-auto flex h-14 items-center justify-between px-4">
          {/* Desktop Navigation - Flattened Links */}
          <nav className="flex items-center space-x-1">
          <Button variant="ghost" asChild className={cn(isActive("/") && "bg-accent text-accent-foreground")}>
            <Link href="/">Accueil</Link>
          </Button>
          <Button variant="ghost" asChild className={cn(isActive("/announcements") && "bg-accent text-accent-foreground")}>
            <Link href="/announcements">Toutes les annonces</Link>
          </Button>
          <Button variant="ghost" asChild className={cn(isActive("/announcements?type=FUNERAL") && "bg-accent text-accent-foreground")}>
            <Link href="/announcements?type=funeral">{getAnnouncementTypeLabel('FUNERAL', true)}</Link>
          </Button>
          <Button variant="ghost" asChild className={cn(isActive("/announcements?type=ANNIVERSARY") && "bg-accent text-accent-foreground")}>
            <Link href="/announcements?type=anniversary">{getAnnouncementTypeLabel('ANNIVERSARY', true)}</Link>
          </Button>
          <Button variant="ghost" asChild className={cn(isActive("/announcements?type=THANKS") && "bg-accent text-accent-foreground")}>
            <Link href="/announcements?type=thanks">{getAnnouncementTypeLabel('THANKS', true)}</Link>
          </Button>
          </nav>

          {/* Right side - User menu or login */}
          <div className="flex items-center space-x-4">
            {/* Search button */}
            <Button variant="ghost" size="icon">
              <Search className="h-4 w-4" />
              <span className="sr-only">Rechercher</span>
            </Button>

            {/* User menu or login */}
            {isClient ? (
              isPending ? (
                <div className="text-sm text-muted-foreground">Chargement...</div>
              ) : user ? (
                <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                    <Avatar className="h-8 w-8">
                      <AvatarImage
                        src={user.image || undefined}
                        alt={user.name || user.email || "Avatar utilisateur"}
                      />
                      <AvatarFallback>
                        {(user.name || user.email || "U")
                          .split(" ")
                          .map((n) => n[0])
                          .join("")
                          .toUpperCase()
                          .slice(0, 2)}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">
                        {user.name || "Utilisateur"}
                      </p>
                      <p className="text-xs leading-none text-muted-foreground">
                        {user.email}
                      </p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/profile">
                      <User className="mr-2 h-4 w-4" />
                      <span>Profil</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/announcements/my">
                      <Heart className="mr-2 h-4 w-4" />
                      <span>Mes annonces</span>
                    </Link>
                  </DropdownMenuItem>
                  {!isProvider && (
                    <DropdownMenuItem asChild>
                      <Link href="/profile/wallet">
                        <Wallet className="mr-2 h-4 w-4" />
                        <span>Mon portefeuille</span>
                      </Link>
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuItem asChild>
                    <Link href="/profile/donations">
                      <DollarSign className="mr-2 h-4 w-4" />
                      <span>Mes donations</span>
                    </Link>
                  </DropdownMenuItem>
                  {isAdmin && (
                    <>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem asChild>
                        <Link href="/admin">
                          <Shield className="mr-2 h-4 w-4" />
                          <span>Administration</span>
                        </Link>
                      </DropdownMenuItem>
                    </>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout}>
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Se déconnecter</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <div className="flex items-center space-x-2">
                <Button variant="ghost" asChild>
                  <Link href="/login">Se connecter</Link>
                </Button>
                <Button asChild>
                  <Link href="/register">S&apos;inscrire</Link>
                </Button>
              </div>
              )
            ) : null}
          </div>
        </div>
      </div>

      {/* Mobile Navigation Menu */}
      {isMobileMenuOpen && isClient && (
        <div className="md:hidden border-t bg-background shadow-lg">
          <div className="container mx-auto px-4 py-6 max-h-[calc(100vh-4rem)] overflow-y-auto">

            {/* Primary Action Button */}
            <div className="mb-6">
              <Button asChild className="w-full h-12 text-base rounded-lg shadow-sm" onClick={() => setIsMobileMenuOpen(false)}>
                <Link href="/announcements/create">
                  <Plus className="h-5 w-5 mr-2" />
                  Créer une annonce
                </Link>
              </Button>
            </div>

            {/* Navigation Section */}
            <div className="space-y-1 mb-6">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-3 mb-3">
                Navigation
              </p>
              <Link
                href="/"
                className={cn(
                  "flex items-center py-3 px-3 rounded-lg text-sm font-medium transition-all duration-200",
                  isActive("/")
                    ? "bg-terre-cuite/10 text-terre-cuite"
                    : "text-gris-lavande hover:bg-sable-clair/50"
                )}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <Heart className="h-4 w-4 mr-3" />
                Accueil
              </Link>
              <Link
                href="/announcements"
                className={cn(
                  "flex items-center py-3 px-3 rounded-lg text-sm font-medium transition-all duration-200",
                  isActive("/announcements")
                    ? "bg-terre-cuite/10 text-terre-cuite"
                    : "text-gris-lavande hover:bg-sable-clair/50"
                )}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <Search className="h-4 w-4 mr-3" />
                Toutes les annonces
              </Link>
            </div>

            {/* Types d'annonces Section */}
            <div className="space-y-1 mb-6">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-3 mb-3">
                Types d&apos;annonces
              </p>
              <Link
                href="/announcements?type=funeral"
                className={cn(
                  "flex items-center py-3 px-3 rounded-lg text-sm font-medium transition-all duration-200",
                  isActive("/announcements?type=funeral")
                    ? "bg-terre-cuite/10 text-terre-cuite"
                    : "text-gris-lavande hover:bg-sable-clair/50"
                )}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                {getAnnouncementTypeLabel('FUNERAL', true)}
              </Link>
              <Link
                href="/announcements?type=anniversary"
                className={cn(
                  "flex items-center py-3 px-3 rounded-lg text-sm font-medium transition-all duration-200",
                  isActive("/announcements?type=anniversary")
                    ? "bg-terre-cuite/10 text-terre-cuite"
                    : "text-gris-lavande hover:bg-sable-clair/50"
                )}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                {getAnnouncementTypeLabel('ANNIVERSARY', true)}
              </Link>
              <Link
                href="/announcements?type=thanks"
                className={cn(
                  "flex items-center py-3 px-3 rounded-lg text-sm font-medium transition-all duration-200",
                  isActive("/announcements?type=thanks")
                    ? "bg-terre-cuite/10 text-terre-cuite"
                    : "text-gris-lavande hover:bg-sable-clair/50"
                )}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                {getAnnouncementTypeLabel('THANKS', true)}
              </Link>
            </div>

            {/* User Section */}
            {user ? (
              <div className="pt-6 border-t space-y-1">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-3 mb-3">
                  Mon compte
                </p>
                <Link
                  href="/profile"
                  className="flex items-center py-3 px-3 rounded-lg text-sm font-medium text-gris-lavande hover:bg-sable-clair/50 transition-all duration-200"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <User className="h-4 w-4 mr-3" />
                  Mon profil
                </Link>
                <Link
                  href="/announcements/my"
                  className="flex items-center py-3 px-3 rounded-lg text-sm font-medium text-gris-lavande hover:bg-sable-clair/50 transition-all duration-200"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <Heart className="h-4 w-4 mr-3" />
                  Mes annonces
                </Link>
                {!isProvider && (
                  <Link
                    href="/profile/wallet"
                    className="flex items-center py-3 px-3 rounded-lg text-sm font-medium text-gris-lavande hover:bg-sable-clair/50 transition-all duration-200"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <Wallet className="h-4 w-4 mr-3" />
                    Mon portefeuille
                  </Link>
                )}
                <Link
                  href="/profile/donations"
                  className="flex items-center py-3 px-3 rounded-lg text-sm font-medium text-gris-lavande hover:bg-sable-clair/50 transition-all duration-200"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <DollarSign className="h-4 w-4 mr-3" />
                  Mes donations
                </Link>
                <button
                  onClick={() => {
                    handleLogout();
                    setIsMobileMenuOpen(false);
                  }}
                  className="flex items-center w-full py-3 px-3 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 transition-all duration-200"
                >
                  <LogOut className="h-4 w-4 mr-3" />
                  Se déconnecter
                </button>
              </div>
            ) : (
              <div className="pt-6 border-t space-y-3">
                <Button asChild className="w-full h-11 text-base rounded-lg">
                  <Link href="/login">
                    <User className="h-4 w-4 mr-2" />
                    Se connecter
                  </Link>
                </Button>
                <Button variant="outline" asChild className="w-full h-11 text-base rounded-lg">
                  <Link href="/register">
                    S&apos;inscrire
                  </Link>
                </Button>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
} 