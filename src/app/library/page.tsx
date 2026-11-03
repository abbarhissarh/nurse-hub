import { createClient } from "@/lib/supabase/server";

export const metadata = { title: "My Library" };
export default async function Library() {
  const { data } = await createClient().from("entitlements")
    .select("id,purchased_at,status,products(title),orders(order_number)").eq("status", "active").order("purchased_at", { ascending: false });
  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <h1 className="mb-4 text-3xl font-extrabold">My Library</h1>
      {data?.length ? <ul className="space-y-3">{data.map((e: any) => (
        <li key={e.id} className="rounded-2xl border border-slate-200 bg-white p-4"><b>{e.products?.title}</b>
          <p className="text-sm text-muted">Order {e.orders?.order_number} · {new Date(e.purchased_at).toLocaleDateString("en-NG")}</p>
          <p className="mt-1 text-sm text-muted">Downloads unlock in phase 3.</p></li>))}</ul>
        : <p className="rounded-xl border border-dashed border-slate-300 bg-white p-6 text-muted">Products you buy will appear here.</p>}
    </div>
  );
}
