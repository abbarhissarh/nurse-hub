import { createClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/admin";
import { addCoupon, toggleCoupon } from "../actions";

export default async function Coupons({ searchParams }: { searchParams: { error?: string } }) {
  await requireAdmin();
  const { data } = await createClient().from("coupons").select("*").order("code");
  return (
    <div className="max-w-xl space-y-4">
      <h1 className="text-3xl font-extrabold">Discount codes</h1>
      {searchParams.error && <p role="alert" className="rounded-xl bg-red-50 p-3 text-red-700">{searchParams.error}</p>}
      <form action={addCoupon} className="space-y-2 rounded-2xl border border-slate-200 bg-white p-4">
        <input name="code" className="input" placeholder="Code, e.g. WELCOME10" required aria-label="Code" />
        <select name="type" className="input" aria-label="Type"><option value="percent">Percent off</option><option value="fixed">Fixed ₦ off</option></select>
        <input name="value" inputMode="numeric" className="input" placeholder="Amount (percent or naira)" required aria-label="Amount" />
        <label className="block text-sm">Start date (optional)<input name="start" type="date" className="input mt-1" /></label>
        <label className="block text-sm">Expiry date (optional)<input name="expiry" type="date" className="input mt-1" /></label>
        <input name="limit" inputMode="numeric" className="input" placeholder="Usage limit (optional)" aria-label="Usage limit" />
        <button className="btn">Create code</button>
      </form>
      <ul className="space-y-2">{data?.map((c: any) => (
        <li key={c.id} className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-slate-200 bg-white p-3 text-sm">
          <span><b>{c.code}</b> · {c.discount_type === "percent" ? `${c.discount_value}%` : `₦${c.discount_value}`} · used {c.usage_count}{c.usage_limit ? `/${c.usage_limit}` : ""} · {c.status}{c.expiry_date ? ` · expires ${new Date(c.expiry_date).toLocaleDateString("en-NG")}` : ""}</span>
          <form action={toggleCoupon}><input type="hidden" name="id" value={c.id} /><input type="hidden" name="to" value={c.status === "active" ? "inactive" : "active"} /><button className="btn-alt">{c.status === "active" ? "Deactivate" : "Activate"}</button></form>
        </li>))}</ul>
    </div>
  );
}
