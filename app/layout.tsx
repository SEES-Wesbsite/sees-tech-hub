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
  title: "SEES Tech Hub",
  description: "The exclusive portal for SEES builders.",
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
      </body>
    </html>
  );
}
