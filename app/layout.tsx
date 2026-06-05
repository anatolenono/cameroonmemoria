import type { Metadata } from 'next';
import { Roboto, Playfair_Display } from 'next/font/google';
import './globals.css';
import { Providers } from './providers';
import { LayoutWrapper } from './layout-wrapper';

// Main content font (Roboto)
const roboto = Roboto({
  variable: '--font-roboto',
  subsets: ['latin'],
  weight: ['300', '400', '500', '700'],
});

// Large titles font (Playfair Display)
const playfair = Playfair_Display({
  variable: '--font-playfair',
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
});

export const metadata: Metadata = {
  title: 'Cameroon Memoria',
  description: "Plateforme d'annonces nécrologiques pour la communauté camerounaise",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr">
      <body className={`${roboto.variable} ${playfair.variable} antialiased`}>
        <Providers>
          <LayoutWrapper>{children}</LayoutWrapper>
        </Providers>
      </body>
    </html>
  );
}
