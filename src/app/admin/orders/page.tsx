import { createClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/admin";
import { naira, cleanQuery } from "@/lib/format";

export default async function Orders({ searchParams }: { searchParams: { q?: string; status?: string } }) {
  await requireAdmin();
  const db = createClient();
  const q = cleanQuery(searchParams.q ?? "");
  let query = db.from("orders").select("id,order_number,total_amount,payment_status,order_status,created_at,profiles(full_name,email),order_items(product_title_snapshot),payments(payment_reference)").order("created_at", { ascending: false }).limit(100);
  if (["pending", "paid", "failed", "refunded"].includes(searchParams.status ?? "")) query = query.eq("payment_status", searchParams.status!);
  if (q.includes("@")) {
    const { data: ps } = await db.from("profiles").select("id").ilike("email", `%${q}%`);
    query = query.in("user_id", (ps ?? []).map((p: any) => p.id));
  } else if (q) query = query.ilike("order_number", `%${q}%`);
  const { data } = await query;
  return (
    <div className="space-y-4">
      <h1 className="text-3xl font-extrabold">Orders</h1>
      <form className="flex flex-wrap gap-2"><input name="q" defaultValue={q} className="input max-w-xs" placeholder="Order number or email" aria-label="Search" />
        <select name="status" defaultValue={searchParams.status ?? ""} className="input max-w-[10rem]" aria-label="Status"><option value="">All</option><option value="paid">Paid</option><option value="pending">Pending</option><option value="failed">Failed</option><option value="refunded">Refunded</option></select>
        <button className="btn">Filter</button></form>
      {data?.length ? <ul className="space-y-2">{data.map((o: any) => (
        <li key={o.id} className="rounded-xl border border-slate-200 bg-white p-3 text-sm">
          <b>{o.order_number}</b> · {new Date(o.created_at).toLocaleString("en-NG")}
          <p>{o.profiles?.full_name} ({o.profiles?.email})</p>
          <p className="text-muted">{o.order_items?.map((i: any) => i.product_title_snapshot).join(", ")}</p>
          <p>{naira(o.total_amount)} · payment {o.payment_status} · order {o.order_status}</p>
          <p className="break-all text-xs text-muted">Ref: {o.payments?.[0]?.payment_reference ?? "none"}</p></li>))}</ul>
        : <p className="text-muted">No orders match.</p>}
    </div>
  );
}
