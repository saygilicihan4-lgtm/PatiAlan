import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";

export const metadata: Metadata = {
  title: "PatiAlan — Köpeğin için özel alan",
  description: "Köpeğiniz için güvenli ve size özel alanları saatlik keşfedin ve rezerve edin."
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="tr">
      <body>
        <header className="topbar">
          <Link className="brand" href="/">PatiAlan<span>.</span></Link>
          <nav>
            <Link href="/kesfet">Alanları keşfet</Link>
            <Link href="/ev-sahibi">Alanını listele</Link>
            <Link className="navCta" href="/giris">Giriş / Panel</Link>
          </nav>
        </header>
        <main>{children}</main>
        <footer>
          <div><strong>PatiAlan</strong> <span className="muted">Private Pet Spaces</span></div>
          <div className="muted">V0.1 pilot · İstanbul</div>
        </footer>
      </body>
    </html>
  );
}
