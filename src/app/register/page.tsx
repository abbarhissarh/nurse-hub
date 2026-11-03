"use client";
import { useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

export default function Register() {
  const [err, setErr] = useState(""); const [busy, setBusy] = useState(false); const [done, setDone] = useState(false);
  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault(); setErr("");
    const f = new FormData(e.currentTarget);
    const name = String(f.get("name")).trim(), email = String(f.get("email")).trim(), pw = String(f.get("password"));
    if (name.length < 2) return setErr("Enter your full name.");
    if (pw.length < 8) return setErr("Password must be at least 8 characters.");
    if (pw !== String(f.get("confirm"))) return setErr("Passwords do not match.");
    setBusy(true);
    const { error } = await createClient().auth.signUp({ email, password: pw, options: { data: { full_name: name }, emailRedirectTo: `${location.origin}/auth/callback` } });
    setBusy(false);
    if (error) return setErr(error.message);
    setDone(true);
  }
  if (done) return <div className="mx-auto mt-10 max-w-md rounded-2xl border border-slate-200 bg-white p-6"><h1 className="text-2xl font-extrabold">Check your email</h1><p className="mt-2 text-muted">We sent a verification link. Click it to activate your account, then <Link href="/login" className="text-teal">log in</Link>.</p></div>;
  return (
    <form onSubmit={submit} className="mx-auto mt-10 max-w-md space-y-4 rounded-2xl border border-slate-200 bg-white p-6">
      <h1 className="text-2xl font-extrabold">Create account</h1>
      <label className="block">Full name<input name="name" required autoComplete="name" className="input mt-1" /></label>
      <label className="block">Email<input name="email" type="email" required autoComplete="email" className="input mt-1" /></label>
      <label className="block">Password<input name="password" type="password" required autoComplete="new-password" className="input mt-1" /></label>
      <label className="block">Confirm password<input name="confirm" type="password" required autoComplete="new-password" className="input mt-1" /></label>
      {err && <p role="alert" className="text-sm text-red-600">{err}</p>}
      <button className="btn w-full" disabled={busy}>{busy ? "Creating account…" : "Create account"}</button>
      <p className="text-sm">Have an account? <Link href="/login" className="text-teal">Log in</Link></p>
    </form>
  );
}
