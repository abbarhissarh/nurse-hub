import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/admin";
import { naira } from "@/lib/format";

export default async function Overview() {
  await requireAdmin();
  const db = createClient();
  const head = { count: "exact" as const, head: true };
  const [paid, pending, customers, products, published, recent, items] = await Promise.all([
    db.from("orders").select("total_amount").eq("payment_status", "paid"),
    db.from("orders").select("id", head).eq("payment_status", "pending"),
    db.from("profiles").select("id", head).eq("role", "customer"),
    db.from("products").select("id", head),
    db.from("products").select("id", head).eq("status", "published"),
    db.from("orders").select("id,order_number,total_amount,payment_status,created_at,profiles(email)").order("created_at", { ascending: false }).limit(8),
    db.from("order_items").select("product_title_snapshot,quantity,orders!inner(payment_status)").eq("orders.payment_status", "paid"),
  ]);
  const revenue = (paid.data ?? []).reduce((a: number, o: any) => a + o.total_amount, 0);
  const tally: Record<string, number> = {};
  (items.data ?? []).forEach((i: any) => { tally[i.product_title_snapshot] = (tally[i.product_title_snapshot] ?? 0) + i.quantity; });
  const best = Object.entries(tally).sort((a, b) => b[1] - a[1]).slice(0, 5);
  const stats: [string, string | number][] = [["Total revenue", naira(revenue)], ["Paid orders", paid.data?.length ?? 0], ["Customers", customers.count ?? 0], ["Products", products.count ?? 0], ["Published", published.count ?? 0], ["Pending payments", pending.count ?? 0]];
  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-extrabold">Admin overview</h1>
      <div className="grid grid-cols-2 gap-3 md:grid-cols-3">{stats.map(([k, v]) => <div key={k} className="rounded-2xl border border-slate-200 bg-white p-4"><p className="text-sm text-muted">{k}</p><p className="text-xl font-extrabold">{v}</p></div>)}</div>
      <section><h2 className="mb-2 text-xl font-bold">Recent orders</h2>
        {recent.data?.length ? <ul className="space-y-2">{recent.data.map((o: any) => <li key={o.id} className="rounded-xl border border-slate-200 bg-white p-3 text-sm"><b>{o.order_number}</b> · {o.profiles?.email} · {naira(o.total_amount)} · {o.payment_status}</li>)}</ul> : <p className="text-muted">No orders yet.</p>}
        <Link href="/admin/orders" className="mt-2 inline-block text-teal">All orders</Link></section>
      <section><h2 className="mb-2 text-xl font-bold">Best sellers</h2>
        {best.length ? <ul className="space-y-1">{best.map(([t, n]) => <li key={t} className="text-sm">{t}: {n} sold</li>)}</ul> : <p className="text-muted">No paid orders yet.</p>}</section>
    </div>
  );
}
