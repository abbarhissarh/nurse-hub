import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { priceCart } from "@/lib/pricing";

export const dynamic = "force-dynamic";
export async function POST(req: Request) {
  let body: any;
  try { body = await req.json(); } catch { return NextResponse.json({ error: "Bad request" }, { status: 400 }); }
  const ids: string[] = Array.isArray(body?.ids) ? body.ids.filter((x: unknown): x is string => typeof x === "string") : [];
  const { data: { user } } = await createClient().auth.getUser();
  const { couponId, ...priced } = await priceCart(user?.id ?? null, ids, typeof body?.coupon === "string" ? body.coupon : null);
  void couponId;
  return NextResponse.json(priced);
}
