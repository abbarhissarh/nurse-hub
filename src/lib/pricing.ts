import { createAdminClient } from "@/lib/supabase/admin";

export type Line = { id: string; title: string; price: number };
export type Priced = {
  lines: Line[]; subtotal: number; discount: number; total: number;
  couponError: string | null; ownedCount: number; couponId: string | null;
};

// Prices are ALWAYS recalculated on the server. The browser's numbers are never trusted.
export async function priceCart(userId: string | null, ids: string[], code?: string | null): Promise<Priced> {
  const db = createAdminClient();
  const unique = Array.from(new Set(ids)).slice(0, 50);
  const { data: products } = await db.from("products").select("id,title,price,discount_price").in("id", unique).eq("status", "published");
  let owned: string[] = [];
  if (userId && unique.length) {
    const { data } = await db.from("entitlements").select("product_id").eq("user_id", userId).eq("status", "active").in("product_id", unique);
    owned = (data ?? []).map((e: { product_id: string }) => e.product_id);
  }
  const lines: Line[] = (products ?? [])
    .filter((p: any) => !owned.includes(p.id))
    .map((p: any) => ({ id: p.id as string, title: p.title as string, price: (p.discount_price ?? p.price) as number }));
  const subtotal = lines.reduce((a: number, l: Line) => a + l.price, 0);

  let discount = 0, couponId: string | null = null, couponError: string | null = null;
  if (code && code.trim()) {
    const { data: c } = await db.from("coupons").select("*").eq("code", code.trim().toUpperCase()).maybeSingle();
    const now = Date.now();
    const bad = !c || c.status !== "active"
      || (c.start_date && new Date(c.start_date).getTime() > now)
      || (c.expiry_date && new Date(c.expiry_date).getTime() < now)
      || (c.usage_limit !== null && c.usage_count >= c.usage_limit);
    if (bad) couponError = "That code isn’t valid or has expired.";
    else {
      discount = c.discount_type === "percent" ? Math.round((subtotal * Math.min(c.discount_value, 100)) / 100) : Math.min(c.discount_value, subtotal);
      couponId = c.id;
    }
  }
  return { lines, subtotal, discount, total: subtotal - discount, couponError, ownedCount: owned.length, couponId };
}
