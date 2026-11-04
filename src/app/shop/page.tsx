import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import ProductCard, { Product } from "@/components/ProductCard";
import { cleanQuery } from "@/lib/format";

export const metadata = { title: "Shop" };
const sel = "id,title,slug,short_description,description,price,discount_price,thumbnail_url,file_type,file_size,categories(name,slug)";

export default async function Shop({ searchParams }: { searchParams: { q?: string; category?: string } }) {
  const q = cleanQuery(searchParams.q ?? "");
  const supabase = createClient();
  const { data: cats } = await supabase.from("categories").select("id,name,slug").eq("status", "active").order("name");
  const active = cats?.find((c: any) => c.slug === searchParams.category);
  let query = supabase.from("products").select(sel).eq("status", "published").order("created_at", { ascending: false });
  if (active) query = query.eq("category_id", active.id);
  if (q) query = query.or(`title.ilike.%${q}%,short_description.ilike.%${q}%,tags.cs.{${q.toLowerCase()}}`);
  const { data, error } = await query;
  const pill = (on: boolean) => `whitespace-nowrap rounded-full px-4 py-1.5 text-sm font-semibold transition ${on ? "bg-teal text-white" : "bg-white text-ink border border-slate-200 hover:bg-sky"}`;
  const href = (slug?: string) => {
    const p = new URLSearchParams();
    if (slug) p.set("category", slug);
    if (q) p.set("q", q);
    const qs = p.toString();
    return qs ? `/shop?${qs}` : "/shop";
  };
  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <h1 className="text-3xl font-extrabold">{q ? `Results for “${q}”` : active ? active.name : "Shop"}</h1>
      <form className="my-5 flex gap-2" role="search">
        {active && <input type="hidden" name="category" value={active.slug} />}
        <input name="q" defaultValue={q} className="input" placeholder="Search products, subjects or exams" aria-label="Search" /><button className="btn">Search</button></form>
      <div className="-mx-4 mb-6 flex gap-2 overflow-x-auto px-4 pb-1" role="tablist" aria-label="Categories">
        <Link href={href()} className={pill(!active)}>All</Link>
        {cats?.map((c: any) => <Link key={c.id} href={href(c.slug)} className={pill(active?.id === c.id)}>{c.name}</Link>)}
      </div>
      {error ? <p className="rounded-xl bg-red-50 p-4 text-red-700">We couldn’t load products. Refresh the page or try again shortly.</p>
        : data?.length ? <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">{data.map((p: any) => <ProductCard key={p.id} p={p as Product} />)}</div>
        : <p className="rounded-xl border border-dashed border-slate-300 bg-white p-6 text-muted">{q || active ? "No products match. Try another subject or category." : "No products are published yet."}</p>}
    </div>
  );
}
