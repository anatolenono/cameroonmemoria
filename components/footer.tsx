"use client";

import Link from "next/link";
import Image from "next/image";
import { Heart, Mail, Phone, MapPin, Facebook, Twitter, Instagram } from "lucide-react";

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gradient-to-br from-gris-lavande/5 via-sable-clair/20 to-peche-claire/10 border-t border-gris-lavande/10">
      <div className="container mx-auto px-4 py-12 md:py-16">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 md:gap-12">
          {/* Brand Section */}
          <div className="space-y-4">
            <Link href="/" className="flex items-center group">
              <Image
                src="/assets/logo-title.svg"
                alt="Cameroon Memoria"
                width={180}
                height={40}
                className="h-10 w-auto transition-opacity group-hover:opacity-80"
              />
            </Link>
            <p className="font-body text-sm text-gris-lavande/70 leading-relaxed">
              Un espace de recueillement et de partage pour honorer la mémoire de nos êtres chers et célébrer leur vie au sein de la communauté camerounaise.
            </p>
            <div className="flex space-x-3 pt-2">
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 bg-white rounded-full hover:bg-terre-cuite/10 transition-colors group"
                aria-label="Facebook"
              >
                <Facebook className="h-4 w-4 text-gris-lavande/60 group-hover:text-terre-cuite transition-colors" />
              </a>
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 bg-white rounded-full hover:bg-terre-cuite/10 transition-colors group"
                aria-label="Twitter"
              >
                <Twitter className="h-4 w-4 text-gris-lavande/60 group-hover:text-terre-cuite transition-colors" />
              </a>
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 bg-white rounded-full hover:bg-terre-cuite/10 transition-colors group"
                aria-label="Instagram"
              >
                <Instagram className="h-4 w-4 text-gris-lavande/60 group-hover:text-terre-cuite transition-colors" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h3 className="font-display text-lg font-semibold text-gris-lavande">Navigation</h3>
            <ul className="space-y-3 font-body text-sm">
              <li>
                <Link href="/" className="text-gris-lavande/70 hover:text-terre-cuite transition-colors">
                  Accueil
                </Link>
              </li>
              <li>
                <Link href="/announcements" className="text-gris-lavande/70 hover:text-terre-cuite transition-colors">
                  Toutes les annonces
                </Link>
              </li>
              <li>
                <Link href="/announcements?type=funeral" className="text-gris-lavande/70 hover:text-terre-cuite transition-colors">
                  Funérailles
                </Link>
              </li>
              <li>
                <Link href="/announcements?type=anniversary" className="text-gris-lavande/70 hover:text-terre-cuite transition-colors">
                  Anniversaires
                </Link>
              </li>
              <li>
                <Link href="/announcements?type=thanks" className="text-gris-lavande/70 hover:text-terre-cuite transition-colors">
                  Remerciements
                </Link>
              </li>
              <li>
                <Link href="/announcements/create" className="text-gris-lavande/70 hover:text-terre-cuite transition-colors">
                  Créer une annonce
                </Link>
              </li>
            </ul>
          </div>

          {/* Resources */}
          <div className="space-y-4">
            <h3 className="font-display text-lg font-semibold text-gris-lavande">Ressources</h3>
            <ul className="space-y-3 font-body text-sm">
              <li className="flex items-center gap-2">
                <span className="text-gris-lavande/70 cursor-not-allowed">
                  À propos
                </span>
                <span className="px-2 py-0.5 text-[10px] font-medium bg-kaki-doux/20 text-kaki-doux rounded-full">
                  Bientôt
                </span>
              </li>
              <li className="flex items-center gap-2">
                <span className="text-gris-lavande/70 cursor-not-allowed">
                  Centre d&apos;aide
                </span>
                <span className="px-2 py-0.5 text-[10px] font-medium bg-kaki-doux/20 text-kaki-doux rounded-full">
                  Bientôt
                </span>
              </li>
              <li className="flex items-center gap-2">
                <span className="text-gris-lavande/70 cursor-not-allowed">
                  Contact
                </span>
                <span className="px-2 py-0.5 text-[10px] font-medium bg-kaki-doux/20 text-kaki-doux rounded-full">
                  Bientôt
                </span>
              </li>
              <li className="flex items-center gap-2">
                <span className="text-gris-lavande/70 cursor-not-allowed">
                  Politique de confidentialité
                </span>
                <span className="px-2 py-0.5 text-[10px] font-medium bg-kaki-doux/20 text-kaki-doux rounded-full">
                  Bientôt
                </span>
              </li>
              <li className="flex items-center gap-2">
                <span className="text-gris-lavande/70 cursor-not-allowed">
                  Conditions d&apos;utilisation
                </span>
                <span className="px-2 py-0.5 text-[10px] font-medium bg-kaki-doux/20 text-kaki-doux rounded-full">
                  Bientôt
                </span>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div className="space-y-4">
            <h3 className="font-display text-lg font-semibold text-gris-lavande">Contact</h3>
            <ul className="space-y-3 font-body text-sm">
              <li className="flex items-start space-x-3 text-gris-lavande/70">
                <Mail className="h-4 w-4 mt-0.5 text-terre-cuite flex-shrink-0" />
                <a href="mailto:contact@cameroonmemoria.com" className="hover:text-terre-cuite transition-colors">
                  contact@cameroonmemoria.com
                </a>
              </li>
              <li className="flex items-start space-x-3 text-gris-lavande/70">
                <Phone className="h-4 w-4 mt-0.5 text-terre-cuite flex-shrink-0" />
                <a href="tel:+237123456789" className="hover:text-terre-cuite transition-colors">
                  +237 123 456 789
                </a>
              </li>
              <li className="flex items-start space-x-3 text-gris-lavande/70">
                <MapPin className="h-4 w-4 mt-0.5 text-terre-cuite flex-shrink-0" />
                <span>Yaoundé, Cameroun</span>
              </li>
            </ul>
            <div className="pt-4">
              <p className="font-body text-xs text-gris-lavande/60 italic leading-relaxed">
                Disponible 24/7 pour vous accompagner dans ces moments difficiles
              </p>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-8 border-t border-gris-lavande/10">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <p className="font-body text-sm text-gris-lavande/60 text-center md:text-left">
              © {currentYear} Cameroon Memoria. Tous droits réservés.
            </p>
            <div className="flex items-center space-x-1 text-sm font-body text-gris-lavande/60">
              <span>Fait avec</span>
              <Heart className="h-3 w-3 text-terre-cuite fill-terre-cuite" />
              <span>pour notre communauté</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
