import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import ProductCard, { Product } from "@/components/ProductCard";

export const revalidate = 60;
const sel = "id,title,slug,short_description,description,price,discount_price,thumbnail_url,file_type,file_size,categories(name,slug)";

export default async function Home() {
  const supabase = createClient();
  const [{ data: cats }, { data: featured }, { data: recent }] = await Promise.all([
    supabase.from("categories").select("name,slug,description").eq("status", "active").order("name"),
    supabase.from("products").select(sel).eq("is_featured", true).eq("status", "published").limit(6),
    supabase.from("products").select(sel).eq("status", "published").order("created_at", { ascending: false }).limit(6),
  ]);
  const grid = (list: any[] | null, empty: string) =>
    list?.length ? <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{list.map((p) => <ProductCard key={p.id} p={p as Product} />)}</div>
      : <p className="rounded-xl border border-dashed border-slate-300 bg-white p-5 text-muted">{empty}</p>;
  return (
    <>
      <section className="bg-gradient-to-br from-navy to-[#14506b] py-14 text-white">
        <div className="mx-auto max-w-6xl px-4">
          <h1 className="max-w-2xl text-4xl font-extrabold leading-tight sm:text-5xl">Your Nursing Knowledge, All in One Place.</h1>
          <p className="mt-4 max-w-xl opacity-90">Discover quality nursing notes, examination resources, clinical guides, study materials and digital products designed to support your nursing journey.</p>
          <div className="mt-6 flex flex-wrap gap-3"><Link href="/shop" className="btn">Explore Products</Link>
            <Link href="/#categories" className="inline-flex rounded-xl border border-white px-5 py-2.5 text-sm font-semibold">Browse Categories</Link></div>
        </div>
      </section>
      <div className="mx-auto -mt-6 max-w-6xl px-4">
        <form action="/shop" className="flex gap-2 rounded-2xl border border-slate-200 bg-white p-2 shadow-lg" role="search">
          <input name="q" className="min-w-0 flex-1 px-3 py-2 outline-none" placeholder="Search by title, subject, category or exam, e.g. NMCN" aria-label="Search products" />
          <button className="btn">Search</button>
        </form>
      </div>
      <div className="mx-auto max-w-6xl space-y-12 px-4 pt-10">
        <section id="categories"><h2 className="mb-4 text-2xl font-bold">Browse categories</h2>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
            {cats?.map((c) => <Link key={c.slug} href={`/category/${c.slug}`} className="rounded-2xl border border-slate-200 bg-sky p-4 font-semibold hover:border-teal">{c.name}</Link>)}
          </div></section>
        <section><h2 className="mb-4 text-2xl font-bold">Featured products</h2>{grid(featured, "Featured products will appear here once you publish and feature them.")}</section>
        <section><h2 className="mb-2 text-2xl font-bold">Best sellers</h2><p className="rounded-xl border border-dashed border-slate-300 bg-white p-5 text-muted">Best sellers will appear after real sales are recorded.</p></section>
        <section><h2 className="mb-4 text-2xl font-bold">Recently added</h2>{grid(recent, "No published products yet.")}</section>
        <section><h2 className="mb-2 text-2xl font-bold">Testimonials</h2><p className="rounded-xl border border-dashed border-slate-300 bg-white p-5 text-muted">Genuine customer reviews will be shown here once available.</p></section>
      </div>
    </>
  );
}
