import { createClient } from "@supabase/supabase-js";

// Cookie-free client for public data (sitemap). Respects row level security.
export const createPublicClient = () =>
  createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, { auth: { persistSession: false } });
