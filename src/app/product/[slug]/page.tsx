import { notFound } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import ProductCard, { Product } from "@/components/ProductCard";
import AddToCart from "@/components/AddToCart";
import { naira, fileSize } from "@/lib/format";

const sel = "id,title,slug,short_description,description,price,discount_price,thumbnail_url,file_type,file_size,category_id,categories(name,slug)";
export async function generateMetadata({ params }: { params: { slug: string } }) {
  const { data } = await createClient().from("products").select("title,short_description").eq("slug", params.slug).eq("status", "published").maybeSingle();
  return { title: data?.title ?? "Product", description: data?.short_description };
}
export default async function ProductPage({ params }: { params: { slug: string } }) {
  const supabase = createClient();
  const { data: p } = await supabase.from("products").select(sel).eq("slug", params.slug).eq("status", "published").maybeSingle();
  if (!p) notFound();
  const { data: related } = await supabase.from("products").select(sel).eq("category_id", (p as any).category_id).eq("status", "published").neq("id", p.id).limit(3);
  const cat = (p as any).categories;
  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <div className="grid gap-8 md:grid-cols-2">
        <div className="grid h-72 place-items-center overflow-hidden rounded-2xl bg-gradient-to-br from-teal to-navy p-6 text-center text-xl font-bold text-white">
          {p.thumbnail_url ? /* eslint-disable-next-line @next/next/no-img-element */ <img src={p.thumbnail_url} alt={p.title} className="h-full w-full object-cover" /> : p.title}
        </div>
        <div className="space-y-3">
          {cat && <Link href={`/category/${cat.slug}`} className="text-sm font-semibold text-teal">{cat.name}</Link>}
          <h1 className="text-3xl font-extrabold">{p.title}</h1>
          <p className="text-2xl font-extrabold">{naira(p.discount_price ?? p.price)}{p.discount_price && <s className="ml-2 text-base font-normal text-muted">{naira(p.price)}</s>}</p>
          <p className="text-muted">Format: {p.file_type} · {fileSize(p.file_size)}</p>
          <p className="whitespace-pre-line">{p.description || p.short_description}</p>
          <AddToCart item={{ id: p.id, slug: p.slug, title: p.title, price: p.discount_price ?? p.price }} />
        </div>
      </div>
      {related && related.length > 0 && <section className="mt-12"><h2 className="mb-4 text-2xl font-bold">Related products</h2>
        <div className="grid gap-4 sm:grid-cols-3">{related.map((r: any) => <ProductCard key={r.id} p={r as Product} />)}</div></section>}
    </div>
  );
}
