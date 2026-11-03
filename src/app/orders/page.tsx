import { createClient } from "@/lib/supabase/server";
import { naira } from "@/lib/format";

export const metadata = { title: "My Orders" };
export default async function Orders() {
  const { data } = await createClient().from("orders")
    .select("id,order_number,created_at,total_amount,payment_status,order_status,order_items(product_title_snapshot)").order("created_at", { ascending: false });
  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <h1 className="mb-4 text-3xl font-extrabold">My Orders</h1>
      {data?.length ? <ul className="space-y-3">{data.map((o: any) => (
        <li key={o.id} className="rounded-2xl border border-slate-200 bg-white p-4">
          <b>{o.order_number}</b> · {new Date(o.created_at).toLocaleDateString("en-NG")}
          <p className="text-sm">{o.order_items?.map((i: any) => i.product_title_snapshot).join(", ")}</p>
          <p className="text-sm text-muted">{naira(o.total_amount)} · Payment: {o.payment_status} · Order: {o.order_status}</p></li>))}</ul>
        : <p className="rounded-xl border border-dashed border-slate-300 bg-white p-6 text-muted">You have no orders yet.</p>}
    </div>
  );
}
