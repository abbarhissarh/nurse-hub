import Link from "next/link";
import { getSettings } from "@/lib/settings";

export const metadata = { title: "About Us" };
export default async function About() {
  const s = await getSettings();
  const paras = s.about_text.split(/\n{2,}/).map((t) => t.trim()).filter(Boolean);
  const pts: [string, string][] = [["⚡", "Instant access"], ["🔒", "Secure payments"], ["📥", "Download anytime"]];
  return (
    <>
      <section className="bg-gradient-to-br from-navy to-[#14506b] py-14 text-white"><div className="mx-auto max-w-3xl px-4"><h1 className="text-4xl font-extrabold">About Nurse Hub</h1><p className="mt-2 opacity-90">Your Knowledge. Your Nursing Journey.</p></div></section>
      <div className="mx-auto max-w-3xl space-y-6 px-4 py-10">
        <div className="space-y-4 text-lg leading-relaxed">{paras.map((t, i) => t.startsWith("Our materials are for learning") ? <p key={i} className="rounded-xl bg-sky p-4 text-base italic text-muted">{t}</p> : <p key={i}>{t}</p>)}</div>
        <div className="grid gap-3 sm:grid-cols-3">{pts.map(([i, t]) => <div key={t} className="rounded-2xl border border-slate-200 bg-white p-4 text-center font-semibold"><div className="text-2xl">{i}</div>{t}</div>)}</div>
        <div className="flex flex-wrap gap-3"><Link href="/shop" className="btn">Explore products</Link><Link href="/contact" className="btn-alt">Contact us</Link></div>
      </div>
    </>
  );
}
