import type { ReactNode } from "react";
import type { Metadata } from "next";
import { KeyboardNavigationHelper } from "./components/accessibility";
import { AuthProvider } from "./components/auth/AuthProvider";
import { ErrorBoundary } from "./components/ui/ErrorBoundary";
import { OfflineBanner } from "./components/ui/OfflineBanner";
import "./globals.css";
import "./theme.css";

export const metadata: Metadata = {
  title: {
    default: "Doe Sangue Angola",
    template: "%s | Doe Sangue Angola"
  },
  description: "Plataforma nacional conectada de doação de sangue em Angola.",
  applicationName: "Doe Sangue Angola",
  keywords: [
    "doação de sangue Angola",
    "Sangue Angola",
    "hospitais Angola",
    "dadores de sangue"
  ],
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "https://doesangue.ao"),
  openGraph: {
    title: "Doe Sangue Angola",
    description: "Admin, hospitais e dadores ligados para salvar vidas.",
    locale: "pt_AO",
    siteName: "Doe Sangue Angola",
    type: "website"
  },
  robots: {
    index: true,
    follow: true
  }
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html data-scroll-behavior="smooth" lang="pt">
      <body>
        <KeyboardNavigationHelper />
        <OfflineBanner />
        <ErrorBoundary>
          <AuthProvider>{children}</AuthProvider>
        </ErrorBoundary>
      </body>
    </html>
  );
}
