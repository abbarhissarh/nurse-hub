import { createClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/admin";
import { naira } from "@/lib/format";

export default async function Customers() {
  await requireAdmin();
  const db = createClient();
  const [{ data: people }, { data: orders }] = await Promise.all([
    db.from("profiles").select("id,full_name,email,created_at").eq("role", "customer").order("created_at", { ascending: false }).limit(200),
    db.from("orders").select("user_id,total_amount").eq("payment_status", "paid"),
  ]);
  const agg: Record<string, { n: number; sum: number }> = {};
  (orders ?? []).forEach((o: any) => { const a = (agg[o.user_id] ??= { n: 0, sum: 0 }); a.n += 1; a.sum += o.total_amount; });
  return (
    <div className="space-y-4">
      <h1 className="text-3xl font-extrabold">Customers</h1>
      {people?.length ? <ul className="space-y-2">{people.map((p: any) => (
        <li key={p.id} className="rounded-xl border border-slate-200 bg-white p-3 text-sm"><b>{p.full_name || "No name"}</b> · {p.email}
          <p className="text-muted">Joined {new Date(p.created_at).toLocaleDateString("en-NG")} · {agg[p.id]?.n ?? 0} paid orders · {naira(agg[p.id]?.sum ?? 0)}</p></li>))}</ul>
        : <p className="text-muted">No customers yet.</p>}
    </div>
  );
}
