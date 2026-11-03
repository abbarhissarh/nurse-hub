"use client";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

export default function Forgot() {
  const [msg, setMsg] = useState(""); const [busy, setBusy] = useState(false);
  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault(); setBusy(true);
    const email = String(new FormData(e.currentTarget).get("email")).trim();
    await createClient().auth.resetPasswordForEmail(email, { redirectTo: `${location.origin}/auth/callback?next=/account` });
    setBusy(false); setMsg("If that email has an account, a reset link is on its way.");
  }
  return (
    <form onSubmit={submit} className="mx-auto mt-10 max-w-md space-y-4 rounded-2xl border border-slate-200 bg-white p-6">
      <h1 className="text-2xl font-extrabold">Reset password</h1>
      <label className="block">Email<input name="email" type="email" required className="input mt-1" /></label>
      {msg && <p role="status" className="text-sm text-teal">{msg}</p>}
      <button className="btn w-full" disabled={busy}>{busy ? "Sending…" : "Send reset link"}</button>
    </form>
  );
}
