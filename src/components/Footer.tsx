import Link from "next/link";
import { getSettings, intl } from "@/lib/settings";
import InstallButton from "./InstallButton";

export default async function Footer() {
  const s = await getSettings();
  const social = [["Instagram", s.instagram], ["Facebook", s.facebook], ["TikTok", s.tiktok], ["WhatsApp", s.whatsapp ? `https://wa.me/${intl(s.whatsapp)}` : ""]].filter(([, u]) => u);
  return (
    <footer className="mt-16 bg-navy py-12 text-sm text-slate-300">
      <div className="mx-auto grid max-w-6xl gap-8 px-4 sm:grid-cols-2 lg:grid-cols-4">
        <div><p className="font-display text-xl font-extrabold text-white">Nurse<span className="text-teal-300">Hub</span></p>
          <p className="mt-2">Your Knowledge. Your Nursing Journey.</p><p className="mt-2">Digital nursing study resources for students and nurses in Nigeria.</p></div>
        <div className="flex flex-col gap-1.5"><b className="text-white">Quick links</b><Link href="/shop">Shop</Link><Link href="/#categories">Categories</Link><Link href="/about">About Us</Link><Link href="/contact">Contact</Link></div>
        <div className="flex flex-col gap-1.5"><b className="text-white">Policies</b><Link href="/privacy">Privacy Policy</Link><Link href="/terms">Terms and Conditions</Link><Link href="/refunds">Refund Policy</Link><Link href="/disclaimer">Disclaimer</Link></div>
        <div className="flex flex-col gap-1.5"><b className="text-white">Contact</b>
          {s.support_email && <a href={`mailto:${s.support_email}`} className="break-all">{s.support_email}</a>}
          {s.phone && <a href={`tel:+${intl(s.phone)}`}>{s.phone}</a>}
          <div className="mt-2 flex flex-wrap gap-2">{social.map(([n, u]) => <a key={n} href={u} target="_blank" rel="noopener noreferrer" className="rounded-full border border-slate-500 px-3 py-1 text-white hover:bg-white/10">{n}</a>)}</div>
          <InstallButton /></div>
      </div>
      <p className="mx-auto mt-8 max-w-6xl px-4">© {new Date().getFullYear()} {s.business_name}. Materials are for learning and do not replace clinical guidelines or supervision.</p>
    </footer>
  );
}
