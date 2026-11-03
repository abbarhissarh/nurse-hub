import { createClient } from "@/lib/supabase/server";
import PasswordForm from "@/components/PasswordForm";

export const metadata = { title: "My Account" };
export default async function Account() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const [{ data: profile }, { count: orders }, { count: owned }] = await Promise.all([
    supabase.from("profiles").select("full_name,email").eq("id", user!.id).single(),
    supabase.from("orders").select("id", { count: "exact", head: true }).eq("payment_status", "paid"),
    supabase.from("entitlements").select("id", { count: "exact", head: true }),
  ]);
  return (
    <div className="mx-auto max-w-3xl space-y-8 px-4 py-8">
      <h1 className="text-3xl font-extrabold">My Account</h1>
      <div className="grid gap-3 sm:grid-cols-3">
        {[["Name", profile?.full_name], ["Email", profile?.email], ["Paid orders", orders ?? 0], ["Products owned", owned ?? 0]].map(([k, v]) =>
          <div key={String(k)} className="rounded-2xl border border-slate-200 bg-white p-4"><p className="text-sm text-muted">{k}</p><p className="break-words font-bold">{String(v ?? "")}</p></div>)}
      </div>
      <section><h2 className="mb-3 text-xl font-bold">Change password</h2><PasswordForm /></section>
    </div>
  );
}
