import { createAdminClient } from "@/lib/supabase/admin";
import { sendEmail, esc } from "@/lib/email";
import { SITE } from "@/lib/site";

export async function sendOrderEmails(orderId: string) {
  const db = createAdminClient();
  const { data } = await db.from("orders")
    .select("order_number,total_amount,created_at,profiles(full_name,email),order_items(product_title_snapshot)").eq("id", orderId).single();
  const o: any = data;
  if (!o) return;
  const profile: any = Array.isArray(o.profiles) ? o.profiles[0] : o.profiles;
  const items: string[] = (o.order_items ?? []).map((i: any) => i.product_title_snapshot);
  const list = items.map((t) => `<li>${esc(t)}</li>`).join("");
  const amount = `₦${Number(o.total_amount).toLocaleString("en-NG")}`;
  const date = new Date(o.created_at).toLocaleDateString("en-NG", { day: "numeric", month: "long", year: "numeric" });
  const to = profile?.email as string | undefined;
  if (to) {
    await sendEmail({
      to, subject: `Your Nurse Hub order ${o.order_number}`,
      html: `<div style="font-family:Arial,sans-serif;max-width:520px;margin:auto;color:#1E293B">
        <h2 style="color:#102A43">Thank you for your purchase, ${esc(profile?.full_name || "")}</h2>
        <p>Your payment was confirmed. Your files are ready in your library.</p>
        <p><b>Order:</b> ${esc(o.order_number)}<br><b>Date:</b> ${esc(date)}<br><b>Amount paid:</b> ${esc(amount)}</p>
        <ul>${list}</ul>
        <p><a href="${SITE}/library" style="background:#0D9488;color:#fff;padding:10px 18px;border-radius:8px;text-decoration:none">Go to My Library</a></p>
        <p style="color:#64748B;font-size:12px">Materials are for learning and do not replace clinical guidelines or supervision.</p></div>`,
    });
  }
  const admin = process.env.ADMIN_EMAIL;
  if (admin) {
    await sendEmail({ to: admin, subject: `New order ${o.order_number} (${amount})`, html: `<p>New paid order <b>${esc(o.order_number)}</b> from ${esc(to)}.</p><ul>${list}</ul><p>Total: ${esc(amount)}</p>` });
  }
}
