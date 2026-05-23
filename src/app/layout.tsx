import type { Metadata } from "next";
import "./globals.css";
import Navbar from "@/components/Navbar";
import ScrollToTop from "@/components/ScrollToTop";
import AgeGate from "@/components/AgeGate";
import AuthProvider from "@/components/AuthProvider";
import AuthModal from "@/components/AuthModal";
import MandatoryAuthGate from "@/components/MandatoryAuthGate";

export const metadata: Metadata = {
  title: "HentaiVault 🌸",
  description: "A modern, curated hentai discovery platform. 18+ only.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-surface text-on-surface antialiased overflow-x-hidden">
        <AuthProvider>
          <MandatoryAuthGate>
            {/* Ambient background blobs — fixed, below all content */}
            <div
              className="fixed -top-32 -right-32 w-[500px] h-[500px] rounded-full pointer-events-none -z-10"
              style={{ background: "radial-gradient(circle, rgba(255,141,138,0.08) 0%, transparent 70%)", filter: "blur(80px)" }}
            />
            <div
              className="fixed bottom-[-10%] left-[-10%] w-[450px] h-[450px] rounded-full pointer-events-none -z-10"
              style={{ background: "radial-gradient(circle, rgba(168,140,251,0.06) 0%, transparent 70%)", filter: "blur(100px)" }}
            />
            <div
              className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full pointer-events-none -z-10"
              style={{ background: "radial-gradient(circle, rgba(255,121,75,0.03) 0%, transparent 70%)", filter: "blur(120px)" }}
            />

            <Navbar />
            <main className="page-container py-6 pb-24">{children}</main>
            <ScrollToTop />
            <AgeGate />
            <AuthModal />
          </MandatoryAuthGate>
        </AuthProvider>
      </body>
    </html>
  );
}
