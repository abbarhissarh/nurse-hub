import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import Header from "@/components/Header";
import CartProvider from "@/components/CartProvider";
import Link from "next/link";
import { SITE } from "@/lib/site";

const font = Plus_Jakarta_Sans({ subsets: ["latin"], variable: "--font-jakarta" });
const description = "Digital nursing notes, exam resources and clinical guides for nursing students and nurses in Nigeria.";
export const metadata: Metadata = {
  metadataBase: new URL(SITE),
  title: { default: "Nurse Hub | Your Knowledge. Your Nursing Journey.", template: "%s | Nurse Hub" },
  description,
  openGraph: { siteName: "Nurse Hub", type: "website", locale: "en_NG", title: "Nurse Hub", description },
  twitter: { card: "summary", title: "Nurse Hub", description },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={font.variable}>
      <body className="font-sans">
        <CartProvider>
          <Header />
          <main>{children}</main>
        </CartProvider>
        <footer className="mt-16 bg-navy py-10 text-sm text-slate-300">
          <div className="mx-auto grid max-w-6xl gap-6 px-4 sm:grid-cols-3">
            <div><b className="text-white">Nurse Hub</b><p>Your Knowledge. Your Nursing Journey.</p></div>
            <div className="flex flex-col gap-1"><b className="text-white">Quick links</b>
              <Link href="/shop">Shop</Link><Link href="/about">About Us</Link><Link href="/contact">Contact</Link></div>
            <div className="flex flex-col gap-1"><b className="text-white">Policies</b>
              <Link href="/privacy">Privacy Policy</Link><Link href="/terms">Terms and Conditions</Link><Link href="/refunds">Refund Policy</Link></div>
          </div>
          <p className="mx-auto mt-6 max-w-6xl px-4">© {new Date().getFullYear()} Nurse Hub. Materials are for learning and do not replace clinical guidelines or supervision.</p>
        </footer>
      </body>
    </html>
  );
}
