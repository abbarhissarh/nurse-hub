import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";
const esc = (v: unknown) => `"${String(v ?? "").replace(/"/g, '""')}"`;

export async function GET() {
  const db = createClient();
  const { data: { user } } = await db.auth.getUser();
  if (!user) return new NextResponse("Unauthorized", { status: 401 });
  const { data: me } = await db.from("profiles").select("role").eq("id", user.id).single();
  if (me?.role !== "admin") return new NextResponse("Forbidden", { status: 403 });
  const { data } = await db.from("orders").select("order_number,created_at,subtotal,discount,total_amount,payment_status,profiles(email)").order("created_at", { ascending: false });
  const lines = ["order_number,date,email,subtotal,discount,total,payment_status"];
  (data ?? []).forEach((o: any) => lines.push([o.order_number, o.created_at, o.profiles?.email, o.subtotal, o.discount, o.total_amount, o.payment_status].map(esc).join(",")));
  return new NextResponse(lines.join("\n"), { headers: { "Content-Type": "text/csv; charset=utf-8", "Content-Disposition": 'attachment; filename="nurse-hub-orders.csv"' } });
}
