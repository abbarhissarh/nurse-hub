import { createClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/admin";
import { naira } from "@/lib/format";

function group(rows: { d: string; v: number }[], len: number) {
  const m: Record<string, { n: number; sum: number }> = {};
  rows.forEach((r) => { const k = r.d.slice(0, len); const a = (m[k] ??= { n: 0, sum: 0 }); a.n += 1; a.sum += r.v; });
  return Object.entries(m).sort((a, b) => b[0].localeCompare(a[0]));
}
function weekKey(iso: string) { const d = new Date(iso); d.setUTCDate(d.getUTCDate() - ((d.getUTCDay() + 6) % 7)); return d.toISOString().slice(0, 10); }

export default async function Reports() {
  await requireAdmin();
  const db = createClient();
  const [{ data: paid }, { data: items }, { data: people }] = await Promise.all([
    db.from("orders").select("created_at,total_amount").eq("payment_status", "paid"),
    db.from("order_items").select("product_title_snapshot,quantity,subtotal,orders!inner(payment_status)").eq("orders.payment_status", "paid"),
    db.from("profiles").select("created_at").eq("role", "customer"),
  ]);
  const rows = (paid ?? []).map((o: any) => ({ d: o.created_at as string, v: o.total_amount as number }));
  const wk = (() => { const m: Record<string, { n: number; sum: number }> = {}; rows.forEach((r) => { const k = weekKey(r.d); const a = (m[k] ??= { n: 0, sum: 0 }); a.n += 1; a.sum += r.v; }); return Object.entries(m).sort((a, b) => b[0].localeCompare(a[0])); })();
  const perf: Record<string, { q: number; sum: number }> = {};
  (items ?? []).forEach((i: any) => { const a = (perf[i.product_title_snapshot] ??= { q: 0, sum: 0 }); a.q += i.quantity; a.sum += i.subtotal; });
  const growth = group((people ?? []).map((p: any) => ({ d: p.created_at as string, v: 0 })), 7);
  const total = rows.reduce((a, r) => a + r.v, 0);
  const Table = ({ title, data }: { title: string; data: [string, { n: number; sum: number }][] }) => (
    <section><h2 className="mb-2 text-xl font-bold">{title}</h2>{data.length ? <ul className="space-y-1 text-sm">{data.slice(0, 12).map(([k, a]) => <li key={k} className="flex justify-between rounded-lg bg-white p-2"><span>{k}</span><span>{a.n} orders · {naira(a.sum)}</span></li>)}</ul> : <p className="text-muted">No data yet.</p>}</section>
  );
  return (
    <div className="max-w-2xl space-y-8">
      <div className="flex items-center justify-between"><h1 className="text-3xl font-extrabold">Reports</h1><a href="/admin/reports/export" className="btn">Download CSV</a></div>
      <p>Total revenue: <b>{naira(total)}</b> from {rows.length} paid orders.</p>
      <Table title="Daily sales" data={group(rows, 10)} />
      <Table title="Weekly sales (week starting Monday)" data={wk} />
      <Table title="Monthly sales" data={group(rows, 7)} />
      <section><h2 className="mb-2 text-xl font-bold">Product performance</h2>
        {Object.keys(perf).length ? <ul className="space-y-1 text-sm">{Object.entries(perf).sort((a, b) => b[1].q - a[1].q).map(([t, a]) => <li key={t} className="flex justify-between rounded-lg bg-white p-2"><span>{t}</span><span>{a.q} sold · {naira(a.sum)}</span></li>)}</ul> : <p className="text-muted">No sales yet.</p>}</section>
      <section><h2 className="mb-2 text-xl font-bold">Customer growth</h2>
        {growth.length ? <ul className="space-y-1 text-sm">{growth.map(([k, a]) => <li key={k} className="flex justify-between rounded-lg bg-white p-2"><span>{k}</span><span>{a.n} new customers</span></li>)}</ul> : <p className="text-muted">No customers yet.</p>}</section>
    </div>
  );
}
