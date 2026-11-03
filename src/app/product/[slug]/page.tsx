import { notFound } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import ProductCard, { Product } from "@/components/ProductCard";
import AddToCart from "@/components/AddToCart";
import { naira, fileSize } from "@/lib/format";
import { SITE } from "@/lib/site";

const sel = "id,title,slug,short_description,description,price,discount_price,thumbnail_url,file_type,file_size,category_id,categories(name,slug)";

export async function generateMetadata({ params }: { params: { slug: string } }) {
  const { data } = await createClient().from("products").select("title,short_description,thumbnail_url,slug").eq("slug", params.slug).eq("status", "published").maybeSingle();
  if (!data) return { title: "Product" };
  const url = `${SITE}/product/${data.slug}`;
  return {
    title: data.title, description: data.short_description, alternates: { canonical: url },
    openGraph: { title: data.title, description: data.short_description, url, type: "website", images: data.thumbnail_url ? [{ url: data.thumbnail_url }] : undefined },
    twitter: { card: data.thumbnail_url ? "summary_large_image" : "summary", title: data.title, description: data.short_description },
  };
}

export default async function ProductPage({ params }: { params: { slug: string } }) {
  const supabase = createClient();
  const { data: p } = await supabase.from("products").select(sel).eq("slug", params.slug).eq("status", "published").maybeSingle();
  if (!p) notFound();
  const { data: related } = await supabase.from("products").select(sel).eq("category_id", (p as any).category_id).eq("status", "published").neq("id", p.id).limit(3);
  const cat = (p as any).categories;
  const price = p.discount_price ?? p.price;
  const ld = {
    "@context": "https://schema.org", "@type": "Product", name: p.title, description: p.short_description || p.description,
    image: p.thumbnail_url ? [p.thumbnail_url] : undefined, url: `${SITE}/product/${p.slug}`,
    offers: { "@type": "Offer", priceCurrency: "NGN", price, availability: "https://schema.org/InStock", url: `${SITE}/product/${p.slug}` },
  };
  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ld).replace(/</g, "\\u003c") }} />
      <div className="grid gap-8 md:grid-cols-2">
        <div className="relative h-72 overflow-hidden rounded-2xl bg-sky">
          {p.thumbnail_url ? /* eslint-disable-next-line @next/next/no-img-element */ <img src={p.thumbnail_url} alt={p.title} className="absolute inset-0 h-full w-full object-contain" /> : <span className="grid h-full place-items-center bg-gradient-to-br from-teal to-navy p-6 text-center text-xl font-bold text-white">{p.title}</span>}
        </div>
        <div className="space-y-3">
          {cat && <Link href={`/category/${cat.slug}`} className="text-sm font-semibold text-teal">{cat.name}</Link>}
          <h1 className="text-3xl font-extrabold">{p.title}</h1>
          <p className="text-2xl font-extrabold">{naira(price)}{p.discount_price && <s className="ml-2 text-base font-normal text-muted">{naira(p.price)}</s>}</p>
          <p className="text-muted">Format: {p.file_type} · {fileSize(p.file_size)}</p>
          <p className="whitespace-pre-line">{p.description || p.short_description}</p>
          <AddToCart item={{ id: p.id, slug: p.slug, title: p.title, price }} />
        </div>
      </div>
      {related && related.length > 0 && <section className="mt-12"><h2 className="mb-4 text-2xl font-bold">Related products</h2>
        <div className="grid gap-4 sm:grid-cols-3">{related.map((r: any) => <ProductCard key={r.id} p={r as Product} />)}</div></section>}
    </div>
  );
}
