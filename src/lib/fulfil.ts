import { createAdminClient } from "@/lib/supabase/admin";
import { verifyTransaction } from "@/lib/paystack";
import { sendOrderEmails } from "@/lib/orderEmails";

// Called by BOTH the return page and the webhook. Safe to call many times.
export async function fulfilByReference(reference: string): Promise<{ ok: boolean; state: string }> {
  const db = createAdminClient();
  const { data: pay } = await db.from("payments").select("id,amount,status,order_id").eq("payment_reference", reference).maybeSingle();
  if (!pay) return { ok: false, state: "not_found" };
  if (pay.status === "success") return { ok: true, state: "already_fulfilled" };

  let tx: { status: string; amount: number; currency: string };
  try { tx = await verifyTransaction(reference); } catch { return { ok: false, state: "verify_error" }; }

  if (tx.status !== "success") {
    if (tx.status === "failed") {
      await db.from("payments").update({ status: "failed" }).eq("id", pay.id).eq("status", "pending");
      await db.from("orders").update({ payment_status: "failed" }).eq("id", pay.order_id).eq("payment_status", "pending");
    }
    return { ok: false, state: tx.status };
  }
  if (tx.currency !== "NGN" || tx.amount !== pay.amount * 100) return { ok: false, state: "amount_mismatch" };

  const { data, error } = await db.rpc("fulfil_order", { p_reference: reference, p_amount: pay.amount });
  if (error) return { ok: false, state: "db_error" };
  // Only the call that actually completed the order sends emails, so customers never get duplicates.
  if (data === "fulfilled") { try { await sendOrderEmails(pay.order_id); } catch {} }
  return { ok: data === "fulfilled" || data === "already_fulfilled", state: String(data) };
}
