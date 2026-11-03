import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { priceCart } from "@/lib/pricing";
import { initializeTransaction } from "@/lib/paystack";

export const dynamic = "force-dynamic";
const fail = (error: string, status: number) => NextResponse.json({ error }, { status });

export async function POST(req: Request) {
  const { data: { user } } = await createClient().auth.getUser();
  if (!user || !user.email) return fail("Please log in to continue.", 401);

  let body: any;
  try { body = await req.json(); } catch { return fail("Bad request.", 400); }
  const ids: string[] = Array.isArray(body?.ids) ? body.ids.filter((x: unknown): x is string => typeof x === "string") : [];
  if (!ids.length) return fail("Your cart is empty.", 400);

  const priced = await priceCart(user.id, ids, typeof body?.coupon === "string" ? body.coupon : null);
  if (priced.couponError) return fail(priced.couponError, 400);
  if (!priced.lines.length) return fail("Nothing to buy. These items may already be in your library.", 400);
  if (priced.total <= 0) return fail("The total must be above ₦0.", 400);

  const db = createAdminClient();
  const orderNumber = `NH-${Date.now().toString(36).toUpperCase()}${Math.random().toString(36).slice(2, 6).toUpperCase()}`;
  const reference = `NHP-${crypto.randomUUID()}`;

  const { data: order, error: oErr } = await db.from("orders").insert({
    order_number: orderNumber, user_id: user.id, subtotal: priced.subtotal, discount: priced.discount,
    total_amount: priced.total, coupon_id: priced.couponId,
  }).select("id").single();
  if (oErr || !order) return fail("Could not create your order. Try again.", 500);

  const { error: iErr } = await db.from("order_items").insert(priced.lines.map((l) => ({
    order_id: order.id, product_id: l.id, product_title_snapshot: l.title, unit_price: l.price, quantity: 1, subtotal: l.price,
  })));
  const { error: pErr } = iErr ? { error: iErr } : await db.from("payments").insert({
    order_id: order.id, payment_provider: "paystack", payment_reference: reference, amount: priced.total,
  });
  if (iErr || pErr) {
    await db.from("orders").delete().eq("id", order.id);
    return fail("Could not create your order. Try again.", 500);
  }

  try {
    const init = await initializeTransaction({
      email: user.email, amountKobo: priced.total * 100, reference,
      callbackUrl: `${new URL(req.url).origin}/checkout/verify`, orderId: order.id,
    });
    return NextResponse.json({ url: init.authorization_url });
  } catch {
    await db.from("orders").update({ payment_status: "failed", order_status: "cancelled" }).eq("id", order.id);
    return fail("Payment could not be started. Please try again.", 502);
  }
}
