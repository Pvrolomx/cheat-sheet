import type { Metadata, Viewport } from "next";
import "./globals.css";
import { AuthProvider } from "@/lib/AuthContext";
import { LangProvider } from "@/lib/LangContext";
import PWARegister from "@/components/PWARegister";

export const metadata: Metadata = {
  title: "Property Concierge | Expat Advisor MX",
  description: "Your personal property information hub in Puerto Vallarta",
  manifest: "/manifest.json",
  icons: { apple: "/icon-192.png" },
};

export const viewport: Viewport = {
  themeColor: "#2D3748",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-brand-cream min-h-screen">
        <LangProvider>
          <AuthProvider>
            <PWARegister />
            {children}
          </AuthProvider>
        </LangProvider>
      </body>
    </html>
  );
}
