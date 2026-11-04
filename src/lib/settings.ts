import { createClient } from "@supabase/supabase-js";

export const DEFAULTS = {
  business_name: "NurseHub",
  support_email: "starfordrapid@gmail.com",
  phone: "09164147355",
  whatsapp: "09021959753",
  instagram: "https://www.instagram.com/nursehubenterprise",
  facebook: "",
  tiktok: "",
  hero_title: "Your Nursing Knowledge, All in One Place.",
  hero_subtitle: "Discover quality nursing notes, examination resources, clinical guides, study materials and digital products designed to support your nursing journey.",
  announcement: "",
  about_text: "Nurse Hub was founded by a professional educator to make nursing study materials clearer, more organised and easier to reach. We create digital notes, study guides and revision resources for nursing students and nurses in Nigeria.\n\nPay securely online, and your files appear in your account right away. We only sell materials we created or are authorised to share.\n\nOur materials are for learning and revision. They do not replace approved textbooks, clinical guidelines, or your institution's protocols.",
};
export type Settings = typeof DEFAULTS;
export const SETTING_KEYS = Object.keys(DEFAULTS) as (keyof Settings)[];

// Nigerian number to international format for wa.me and tel: links
export const intl = (n: string) => { const d = n.replace(/\D/g, ""); return d.startsWith("0") ? "234" + d.slice(1) : d; };

export async function getSettings(): Promise<Settings> {
  const out: Record<string, string> = { ...DEFAULTS };
  try {
    const db = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, {
      auth: { persistSession: false },
      global: { fetch: (input, init) => fetch(input, { ...init, cache: "no-store" }) },
    });
    const { data } = await db.from("site_settings").select("key,value");
    (data ?? []).forEach((r: { key: string; value: string }) => { if (r.key in DEFAULTS && typeof r.value === "string") out[r.key] = r.value; });
  } catch {}
  return out as Settings;
}
