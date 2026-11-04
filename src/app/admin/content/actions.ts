"use server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdmin, audit } from "@/lib/admin";
import { createAdminClient } from "@/lib/supabase/admin";
import { SETTING_KEYS } from "@/lib/settings";

const MAX: Record<string, number> = { about_text: 3000, hero_subtitle: 300, hero_title: 120, announcement: 200 };
const bad = (m: string): never => redirect(`/admin/content?error=${encodeURIComponent(m)}`);

export async function saveSettings(f: FormData) {
  const admin = await requireAdmin();
  const rows = SETTING_KEYS.map((key) => ({ key: String(key), value: String(f.get(String(key)) ?? "").trim().slice(0, MAX[key] ?? 200), updated_at: new Date().toISOString() }));
  const get = (k: string) => rows.find((r) => r.key === k)!.value;
  if (get("support_email") && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(get("support_email"))) bad("Enter a valid support email.");
  for (const k of ["phone", "whatsapp"]) if (get(k) && !/^[+\d\s-]{7,20}$/.test(get(k))) bad("Phone numbers can only contain digits, spaces, + and -.");
  for (const k of ["instagram", "facebook", "tiktok"]) if (get(k) && !get(k).startsWith("https://")) bad("Social links must start with https://");
  if (get("hero_title").length < 3) bad("Enter a homepage heading.");
  const { error } = await createAdminClient().from("site_settings").upsert(rows, { onConflict: "key" });
  if (error) bad("Could not save. Did you run the 005_settings.sql step?");
  await audit(admin.id, "settings.update", {});
  revalidatePath("/", "layout");
  redirect("/admin/content?saved=1");
}
