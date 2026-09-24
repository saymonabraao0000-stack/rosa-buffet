import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import { siteConfig } from "@/lib/site-config";
import { partyPackages } from "@/lib/quiz-data";
import WhatsAppFloatingButton from "@/components/layout/WhatsAppFloatingButton";
import "./globals.css";

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  display: "swap",
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: {
    default: `${siteConfig.name} | ${siteConfig.tagline}`,
    template: `%s | ${siteConfig.name}`,
  },
  description: siteConfig.description,
  keywords: [
    "buffet em manaus",
    "buffet de eventos manaus",
    "casa de festas manaus",
    "casamentos manaus",
    "festa de 15 anos manaus",
    "buffet infantil manaus",
    "produção de eventos manaus",
  ],
  authors: [{ name: siteConfig.name }],
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: "pt_BR",
    url: siteConfig.url,
    siteName: siteConfig.name,
    title: `${siteConfig.name} | ${siteConfig.tagline}`,
    description: siteConfig.description,
    images: [
      {
        url: "/images/logo.jpg",
        width: 1080,
        height: 1080,
        alt: siteConfig.name,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: `${siteConfig.name} | ${siteConfig.tagline}`,
    description: siteConfig.description,
    images: ["/images/logo.jpg"],
  },
  robots: {
    index: true,
    follow: true,
  },
};

// Faixa de preço real dos pacotes fechados (ver quiz-data.ts), pro priceRange
// do schema — nada inventado, é o mínimo e o máximo entre os valores por
// convidados dos 3 pacotes.
const allPrices = partyPackages.flatMap((pkg) => Object.values(pkg.pricesByGuests));
const priceRange = allPrices.length
  ? `R$ ${Math.min(...allPrices).toLocaleString("pt-BR")} – R$ ${Math.max(...allPrices).toLocaleString("pt-BR")}`
  : undefined;

// sameAs só entra com perfis reais confirmados.
const sameAs = [siteConfig.social.instagram, siteConfig.social.facebook];

const businessJsonLd = {
  "@context": "https://schema.org",
  "@type": ["EventVenue", "FoodEstablishment"],
  name: siteConfig.name,
  image: `${siteConfig.url}/images/logo.jpg`,
  url: siteConfig.url,
  telephone: `+${siteConfig.whatsappNumber}`,
  ...(priceRange ? { priceRange } : {}),
  address: {
    "@type": "PostalAddress",
    streetAddress: siteConfig.address.street,
    addressLocality: siteConfig.address.city,
    addressRegion: siteConfig.address.state,
    addressCountry: "BR",
  },
  areaServed: {
    "@type": "City",
    name: siteConfig.address.city,
  },
  sameAs,
  description: siteConfig.description,
};

const websiteJsonLd = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: siteConfig.name,
  url: siteConfig.url,
  inLanguage: "pt-BR",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" className={`${playfair.variable} ${inter.variable}`}>
      <body className="bg-cream text-ink antialiased">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(businessJsonLd) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd) }}
        />
        {children}
        <WhatsAppFloatingButton />
      </body>
    </html>
  );
}
