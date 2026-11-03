import type { MetadataRoute } from "next";
import { createPublicClient } from "@/lib/supabase/public";
import { SITE } from "@/lib/site";

export const revalidate = 3600;
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const db = createPublicClient();
  const [{ data: prods }, { data: cats }] = await Promise.all([
    db.from("products").select("slug,updated_at").eq("status", "published"),
    db.from("categories").select("slug").eq("status", "active"),
  ]);
  const now = new Date();
  const fixed = ["", "/shop", "/about", "/contact", "/privacy", "/terms", "/refunds"].map((p) => ({ url: `${SITE}${p}`, lastModified: now }));
  return [
    ...fixed,
    ...(cats ?? []).map((c: any) => ({ url: `${SITE}/category/${c.slug}`, lastModified: now })),
    ...(prods ?? []).map((p: any) => ({ url: `${SITE}/product/${p.slug}`, lastModified: new Date(p.updated_at) })),
  ];
}
