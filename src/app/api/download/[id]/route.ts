import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export async function GET(req: Request, { params }: { params: { id: string } }) {
  const origin = new URL(req.url).origin;
  const back = (e: string) => NextResponse.redirect(`${origin}/library?error=${e}`);

  const { data: { user } } = await createClient().auth.getUser();
  if (!user) return NextResponse.redirect(`${origin}/login?next=/library`);
  if (!UUID.test(params.id)) return back("unavailable");

  const ip = (req.headers.get("x-forwarded-for") || "").split(",")[0].trim() || null;
  const db = createAdminClient();
  // Checks ownership, status and download limit, then counts and logs the download, all in one step.
  const { data, error } = await db.rpc("claim_download", { p_user: user.id, p_product: params.id, p_ip: ip });
  if (error || typeof data !== "string") return back("unavailable");
  if (!data.startsWith("ok:")) return back(data);

  // Short-lived link (60 seconds). The private file path is never shown to the customer.
  const { data: signed, error: sErr } = await db.storage.from("product-files").createSignedUrl(data.slice(3), 60, { download: true });
  if (sErr || !signed?.signedUrl) return back("missing");
  return NextResponse.redirect(signed.signedUrl);
}
