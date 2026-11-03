import { createClient } from "@supabase/supabase-js";

// Server-only. Uses the secret key: never import this in a "use client" file.
export function createAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error("Supabase server keys are missing");
  return createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
}
