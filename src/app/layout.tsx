import type { Metadata, Viewport } from "next";
import { Plus_Jakarta_Sans, Sora } from "next/font/google";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import CartProvider from "@/components/CartProvider";
import RegisterSW from "@/components/RegisterSW";
import { SITE } from "@/lib/site";
import { getSettings } from "@/lib/settings";

const body = Plus_Jakarta_Sans({ subsets: ["latin"], variable: "--font-jakarta" });
const display = Sora({ subsets: ["latin"], variable: "--font-display" });
const description = "Digital nursing notes, exam resources and clinical guides for nursing students and nurses in Nigeria.";

export const viewport: Viewport = { themeColor: "#102A43", width: "device-width", initialScale: 1 };
export const metadata: Metadata = {
  metadataBase: new URL(SITE),
  title: { default: "Nurse Hub | Your Knowledge. Your Nursing Journey.", template: "%s | Nurse Hub" },
  description,
  applicationName: "Nurse Hub",
  appleWebApp: { capable: true, title: "Nurse Hub", statusBarStyle: "black-translucent" },
  openGraph: { siteName: "Nurse Hub", type: "website", locale: "en_NG", title: "Nurse Hub", description, images: [{ url: "/icons/og.png", width: 600, height: 600 }] },
  twitter: { card: "summary", title: "Nurse Hub", description, images: ["/icons/og.png"] },
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const s = await getSettings();
  return (
    <html lang="en" className={`${body.variable} ${display.variable}`}>
      <body className="font-sans">
        <CartProvider>
          {s.announcement && <div className="bg-teal px-4 py-2 text-center text-sm font-semibold text-white">{s.announcement}</div>}
          <Header />
          <main>{children}</main>
        </CartProvider>
        <Footer />
        <RegisterSW />
      </body>
    </html>
  );
}
