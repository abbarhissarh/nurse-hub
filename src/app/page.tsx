import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import ProductCard, { Product } from "@/components/ProductCard";
import { getSettings } from "@/lib/settings";

const sel = "id,title,slug,short_description,description,price,discount_price,thumbnail_url,file_type,file_size,categories(name,slug)";
const ICONS: Record<string, string> = {
  "anatomy-physiology": "🫀", pharmacology: "💊", "medical-surgical-nursing": "🩺", "maternal-child-health": "🤱", "community-health-nursing": "🏘️",
  "nursing-procedures": "🧤", "exam-preparation": "📝", "clinical-skills": "✅", "nursing-research": "🔬", "professional-development": "🎓",
};

export default async function Home() {
  const supabase = createClient();
  const [s, { data: cats }, { data: featured }, { data: recent }] = await Promise.all([
    getSettings(),
    supabase.from("categories").select("name,slug").eq("status", "active").order("name"),
    supabase.from("products").select(sel).eq("is_featured", true).eq("status", "published").limit(6),
    supabase.from("products").select(sel).eq("status", "published").order("created_at", { ascending: false }).limit(6),
  ]);
  const grid = (list: any[] | null, empty: string) =>
    list?.length ? <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">{list.map((p) => <ProductCard key={p.id} p={p as Product} />)}</div>
      : <p className="rounded-xl border border-dashed border-slate-300 bg-white p-5 text-muted">{empty}</p>;
  const steps: [string, string, string][] = [["1", "Choose a resource", "Browse notes, guides and exam packs by subject."], ["2", "Pay securely", "Pay in naira through Paystack."], ["3", "Download instantly", "Your files appear in My Library right away."]];
  const why: [string, string, string][] = [["⚡", "Instant digital delivery", "No waiting. Access starts as soon as payment is verified."], ["💸", "Affordable resources", "Study materials priced for students."], ["📥", "Easy downloads", "Download again anytime from your library."], ["🗂️", "Organised materials", "Sorted by subject, exam and skill."], ["📱", "Convenient access", "Works on any phone, tablet or laptop."], ["🔒", "Secure payments", "Verified on our server before access is given."]];
  return (
    <>
      <section className="relative overflow-hidden bg-gradient-to-br from-navy via-[#14506b] to-teal py-16 text-white sm:py-24">
        <div aria-hidden className="pointer-events-none absolute -right-24 -top-24 h-80 w-80 rounded-full bg-white/10 blur-3xl" />
        <div aria-hidden className="pointer-events-none absolute -bottom-32 left-10 h-72 w-72 rounded-full bg-teal/40 blur-3xl" />
        <div className="relative mx-auto max-w-6xl px-4">
          <p className="fade-up mb-3 inline-block rounded-full bg-white/15 px-3 py-1 text-xs font-semibold tracking-wide">DIGITAL NURSING RESOURCES</p>
          <h1 className="fade-up max-w-3xl text-4xl font-extrabold leading-tight sm:text-6xl">{s.hero_title}</h1>
          <p className="fade-up mt-4 max-w-xl text-lg opacity-90">{s.hero_subtitle}</p>
          <div className="fade-up mt-7 flex flex-wrap gap-3"><Link href="/shop" className="btn !bg-white !text-navy hover:!bg-sky">Explore Products</Link>
            <Link href="/#categories" className="inline-flex items-center rounded-xl border border-white/70 px-5 py-2.5 text-sm font-semibold hover:bg-white/10">Browse Categories</Link></div>
        </div>
      </section>
      <div className="mx-auto -mt-7 max-w-6xl px-4">
        <form action="/shop" className="flex gap-2 rounded-2xl border border-slate-200 bg-white p-2 shadow-xl" role="search">
          <input name="q" className="min-w-0 flex-1 rounded-xl px-3 py-2 outline-none" placeholder="Search by title, subject or exam, e.g. NMCN" aria-label="Search products" />
          <button className="btn">Search</button>
        </form>
      </div>
      <div className="mx-auto max-w-6xl space-y-16 px-4 pt-14">
        <section id="categories"><h2 className="mb-1 text-2xl font-bold sm:text-3xl">Browse categories</h2><p className="mb-5 text-muted">Find resources by subject.</p>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
            {cats?.map((c: any) => <Link key={c.slug} href={`/category/${c.slug}`} className="lift rounded-2xl border border-slate-200 bg-white p-4"><span className="text-2xl">{ICONS[c.slug] ?? "📘"}</span><p className="mt-2 font-semibold leading-snug">{c.name}</p></Link>)}
          </div></section>
        <section><div className="mb-5 flex items-end justify-between"><h2 className="text-2xl font-bold sm:text-3xl">Featured products</h2><Link href="/shop" className="text-sm font-semibold text-teal">View all</Link></div>
          {grid(featured, "Featured products will appear here once you publish and feature them.")}</section>
        <section><h2 className="mb-5 text-2xl font-bold sm:text-3xl">How it works</h2>
          <div className="grid gap-4 sm:grid-cols-3">{steps.map(([n, t, d]) => <div key={n} className="rounded-2xl border border-slate-200 bg-white p-5"><span className="grid h-9 w-9 place-items-center rounded-full bg-teal font-bold text-white">{n}</span><p className="mt-3 font-bold">{t}</p><p className="text-sm text-muted">{d}</p></div>)}</div></section>
        <section><h2 className="mb-2 text-2xl font-bold sm:text-3xl">Best sellers</h2><p className="rounded-xl border border-dashed border-slate-300 bg-white p-5 text-muted">Best sellers will appear after real sales are recorded.</p></section>
        <section><h2 className="mb-5 text-2xl font-bold sm:text-3xl">Recently added</h2>{grid(recent, "No published products yet.")}</section>
        <section><h2 className="mb-5 text-2xl font-bold sm:text-3xl">Why choose Nurse Hub?</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{why.map(([i, t, d]) => <div key={t} className="rounded-2xl bg-sky p-5"><span className="text-2xl">{i}</span><p className="mt-2 font-bold">{t}</p><p className="text-sm text-muted">{d}</p></div>)}</div></section>
        <section><h2 className="mb-2 text-2xl font-bold sm:text-3xl">Testimonials</h2><p className="rounded-xl border border-dashed border-slate-300 bg-white p-5 text-muted">Genuine customer reviews will be shown here once available.</p></section>
      </div>
    </>
  );
}
