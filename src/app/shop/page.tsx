import { createClient } from "@/lib/supabase/server";
import ProductCard, { Product } from "@/components/ProductCard";
import { cleanQuery } from "@/lib/format";

export const metadata = { title: "Shop" };
const sel = "id,title,slug,short_description,description,price,discount_price,thumbnail_url,file_type,file_size,categories(name,slug)";

export default async function Shop({ searchParams }: { searchParams: { q?: string } }) {
  const q = cleanQuery(searchParams.q ?? "");
  const supabase = createClient();
  let query = supabase.from("products").select(sel).eq("status", "published").order("created_at", { ascending: false });
  if (q) query = query.or(`title.ilike.%${q}%,short_description.ilike.%${q}%,tags.cs.{${q.toLowerCase()}}`);
  const { data, error } = await query;
  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <h1 className="text-3xl font-extrabold">{q ? `Results for “${q}”` : "Shop"}</h1>
      <form className="my-5 flex gap-2" role="search"><input name="q" defaultValue={q} className="input" placeholder="Search products" aria-label="Search" /><button className="btn">Search</button></form>
      {error ? <p className="rounded-xl bg-red-50 p-4 text-red-700">We couldn’t load products. Refresh the page or try again shortly.</p>
        : data?.length ? <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{data.map((p: any) => <ProductCard key={p.id} p={p as Product} />)}</div>
        : <p className="rounded-xl border border-dashed border-slate-300 bg-white p-6 text-muted">{q ? "No products match. Try a subject like “pharmacology” or an exam like “NMCN”." : "No products are published yet."}</p>}
    </div>
  );
}
