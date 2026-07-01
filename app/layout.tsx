import type { Metadata } from "next";
import { DM_Sans, Playfair_Display } from "next/font/google";
import { Providers } from "./providers";
import "./globals.css";
import { Toaster } from "sonner";

const fontSans = DM_Sans({
  variable: "--font-sans",
  subsets: ["latin"],
});

const fontSerif = Playfair_Display({
  variable: "--font-serif",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://tech.seesunilag.com"),
  title: {
    default: "SEES Tech Hub",
    template: "%s | SEES Tech Hub",
  },
  description: "The exclusive portal for SEES builders, connecting students with opportunities, hackathons, and quests.",
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
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${fontSans.variable} ${fontSerif.variable} font-sans h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col selection:bg-brand selection:text-[#95fde2]">
        <Providers>
          {children}
          <Toaster theme="dark" position="top-center" richColors />
        </Providers>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Organization",
              "name": "SEES Tech Hub",
              "url": "https://tech.seesunilag.com",
              "logo": "https://tech.seesunilag.com/logo-mark.svg",
              "sameAs": [
                "https://x.com/sees_unilag",
                "https://www.linkedin.com/company/seesunilag"
              ]
            })
          }}
        />
      </body>
    </html>
  );
}
