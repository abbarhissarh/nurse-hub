// Sends mail through Resend. If keys are missing it does nothing, so checkout never breaks.
export async function sendEmail(p: { to: string; subject: string; html: string }): Promise<void> {
  const key = process.env.RESEND_API_KEY, from = process.env.EMAIL_FROM;
  if (!key || !from) return;
  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
      body: JSON.stringify({ from, to: [p.to], subject: p.subject, html: p.html }),
    });
    if (!res.ok) console.error("Resend error", res.status, await res.text());
  } catch (e) { console.error("Email failed", e); }
}

const ESCAPES: Record<string, string> = { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" };
export const esc = (s: unknown) => String(s ?? "").replace(/[&<>"']/g, (c) => ESCAPES[c]);
