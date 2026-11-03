import Link from "next/link";
import { naira } from "@/lib/format";

export type Product = {
  id: string; title: string; slug: string; short_description: string;
  price: number; discount_price: number | null; thumbnail_url: string | null;
  file_type: string; file_size: number | null; description: string;
  categories?: { name: string; slug: string } | null;
};

export default function ProductCard({ p }: { p: Product }) {
  return (
    <article className="flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white">
      <Link href={`/product/${p.slug}`} className="relative block aspect-[4/3] w-full overflow-hidden bg-sky">
        {p.thumbnail_url ? (
          /* eslint-disable-next-line @next/next/no-img-element */
          <img src={p.thumbnail_url} alt={p.title} className="absolute inset-0 h-full w-full object-contain" loading="lazy" />
        ) : (
          <span className="grid h-full place-items-center bg-gradient-to-br from-teal to-navy p-4 text-center font-bold text-white">{p.title}</span>
        )}
      </Link>
      <div className="flex flex-1 flex-col gap-2 p-4">
        {p.categories && <Link href={`/category/${p.categories.slug}`} className="text-xs font-semibold text-teal">{p.categories.name}</Link>}
        <h3 className="font-bold">{p.title}</h3>
        <p className="text-sm text-muted">{p.short_description}</p>
        <p className="mt-auto text-lg font-extrabold">
          {naira(p.discount_price ?? p.price)}
          {p.discount_price && <s className="ml-2 text-sm font-normal text-muted">{naira(p.price)}</s>}
        </p>
        <Link href={`/product/${p.slug}`} className="btn-alt">View details</Link>
      </div>
    </article>
  );
}
