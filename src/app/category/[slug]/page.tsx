import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import ProductCard, { Product } from "@/components/ProductCard";

const sel = "id,title,slug,short_description,description,price,discount_price,thumbnail_url,file_type,file_size,categories(name,slug)";
export async function generateMetadata({ params }: { params: { slug: string } }) {
  const { data } = await createClient().from("categories").select("name,description").eq("slug", params.slug).maybeSingle();
  return { title: data?.name ?? "Category", description: data?.description };
}
export default async function Category({ params }: { params: { slug: string } }) {
  const supabase = createClient();
  const { data: cat } = await supabase.from("categories").select("id,name,description").eq("slug", params.slug).eq("status", "active").maybeSingle();
  if (!cat) notFound();
  const { data } = await supabase.from("products").select(sel).eq("category_id", cat.id).eq("status", "published");
  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <h1 className="text-3xl font-extrabold">{cat.name}</h1><p className="mb-6 text-muted">{cat.description}</p>
      {data?.length ? <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{data.map((p: any) => <ProductCard key={p.id} p={p as Product} />)}</div>
        : <p className="rounded-xl border border-dashed border-slate-300 bg-white p-6 text-muted">No published products in this category yet.</p>}
    </div>
  );
}
