"use client";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

export default function PasswordForm() {
  const [msg, setMsg] = useState(""); const [err, setErr] = useState(""); const [busy, setBusy] = useState(false);
  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault(); setMsg(""); setErr("");
    const form = e.currentTarget; const f = new FormData(form);
    const pw = String(f.get("pw"));
    if (pw.length < 8) return setErr("Password must be at least 8 characters.");
    if (pw !== String(f.get("pw2"))) return setErr("Passwords do not match.");
    setBusy(true);
    const { error } = await createClient().auth.updateUser({ password: pw });
    setBusy(false);
    if (error) return setErr(error.message);
    form.reset(); setMsg("Password updated.");
  }
  return (
    <form onSubmit={submit} className="max-w-sm space-y-3">
      <label className="block">New password<input name="pw" type="password" required autoComplete="new-password" className="input mt-1" /></label>
      <label className="block">Confirm new password<input name="pw2" type="password" required autoComplete="new-password" className="input mt-1" /></label>
      {err && <p role="alert" className="text-sm text-red-600">{err}</p>}{msg && <p role="status" className="text-sm text-teal">{msg}</p>}
      <button className="btn" disabled={busy}>{busy ? "Saving…" : "Change password"}</button>
    </form>
  );
}
