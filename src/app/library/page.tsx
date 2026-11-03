import { createClient } from "@/lib/supabase/server";

export const metadata = { title: "My Library" };
const MESSAGES: Record<string, string> = {
  limit: "You’ve reached the download limit for this product. Contact us if you need help.",
  missing: "This file is temporarily unavailable. Please try again later or contact us.",
  disabled: "Downloads for this product are disabled. Contact us for help.",
  unavailable: "That download isn’t available.",
};

export default async function Library({ searchParams }: { searchParams: { error?: string } }) {
  const { data } = await createClient().from("entitlements")
    .select("id,purchased_at,download_count,products(id,title,download_limit,file_type),orders(order_number)")
    .eq("status", "active").order("purchased_at", { ascending: false });
  const msg = searchParams.error ? MESSAGES[searchParams.error] ?? MESSAGES.unavailable : "";
  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <h1 className="mb-4 text-3xl font-extrabold">My Library</h1>
      {msg && <p role="alert" className="mb-4 rounded-xl bg-red-50 p-3 text-red-700">{msg}</p>}
      {data?.length ? (
        <ul className="space-y-3">
          {data.map((e: any) => (
            <li key={e.id} className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white p-4">
              <div>
                <b>{e.products?.title ?? "Product no longer available"}</b>
                <p className="text-sm text-muted">Order {e.orders?.order_number} · {new Date(e.purchased_at).toLocaleDateString("en-NG")}</p>
                {e.products && <p className="text-sm text-muted">Downloads used: {e.download_count}{e.products.download_limit > 0 ? ` of ${e.products.download_limit}` : ""}</p>}
              </div>
              {e.products && <a href={`/api/download/${e.products.id}`} className="btn">Download {e.products.file_type}</a>}
            </li>
          ))}
        </ul>
      ) : <p className="rounded-xl border border-dashed border-slate-300 bg-white p-6 text-muted">Products you buy will appear here.</p>}
    </div>
  );
}
