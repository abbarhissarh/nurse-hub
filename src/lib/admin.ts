import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

// Call at the start of every admin page and every admin action.
export async function requireAdmin() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login?next=/admin");
  const { data: p } = await supabase.from("profiles").select("role").eq("id", user.id).single();
  if (p?.role !== "admin") redirect("/");
  return user;
}

export async function audit(adminId: string, action: string, details: Record<string, unknown> = {}) {
  await createAdminClient().from("audit_logs").insert({ admin_id: adminId, action, details });
}
