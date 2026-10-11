import type { Metadata } from "next";
import { Geist, Playfair_Display, Instrument_Serif } from "next/font/google";
import { Providers } from "./providers";
import "./globals.css";
import { Toaster } from "sonner";

const fontSans = Geist({
  variable: "--font-sans",
  subsets: ["latin"],
});

const fontSerif = Playfair_Display({
  variable: "--font-serif",
  subsets: ["latin"],
  style: ["normal", "italic"],
  display: "swap",
});

const fontInstrumentSerif = Instrument_Serif({
  variable: "--font-instrument",
  subsets: ["latin"],
  weight: "400",
  style: ["normal", "italic"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://tech.seesunilag.com"),
  title: {
    default: "SEES Tech Hub",
    template: "%s | SEES Tech Hub",
  },
  description:
    "The exclusive portal for SEES builders, connecting students with opportunities, hackathons, and quests.",
  openGraph: {
    title: "SEES Tech Hub",
    description: "The exclusive portal for SEES builders.",
    url: "https://tech.seesunilag.com",
    siteName: "SEES Tech Hub",
    locale: "en_NG",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "SEES Tech Hub",
    description: "The exclusive portal for SEES builders.",
  },
  verification: {
    google: "5t6l62KH7rzXdJNkp1TuiAUZ-AuWmNZ1OgrLwAA7yEU",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${fontSans.variable} ${fontSerif.variable} ${fontInstrumentSerif.variable} font-sans h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col selection:bg-brand selection:text-[#95fde2]">
        <Providers>
          {children}
          <Toaster
            theme="light"
            position="top-center"
            richColors
            toastOptions={{ style: { fontFamily: "var(--font-sans)" } }}
          />
        </Providers>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Organization",
              name: "SEES Tech Hub",
              url: "https://tech.seesunilag.com",
              logo: "https://tech.seesunilag.com/logo-mark.svg",
              sameAs: [
                "https://x.com/sees_unilag",
                "https://www.linkedin.com/company/seesunilag",
              ],
            }),
          }}
        />
      </body>
    </html>
  );
}
