"use client";
import { useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

function Form() {
  const router = useRouter(); const sp = useSearchParams();
  const [err, setErr] = useState(""); const [busy, setBusy] = useState(false);
  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault(); setErr(""); setBusy(true);
    const f = new FormData(e.currentTarget);
    const { error } = await createClient().auth.signInWithPassword({ email: String(f.get("email")).trim(), password: String(f.get("password")) });
    setBusy(false);
    if (error) return setErr(error.message.includes("Email not confirmed") ? "Verify your email first. Check your inbox for the link." : "Incorrect email or password.");
    const next = sp.get("next"); router.push(next && next.startsWith("/") ? next : "/account"); router.refresh();
  }
  return (
    <form onSubmit={submit} className="mx-auto mt-10 max-w-md space-y-4 rounded-2xl border border-slate-200 bg-white p-6">
      <h1 className="text-2xl font-extrabold">Log in</h1>
      <label className="block">Email<input name="email" type="email" required autoComplete="email" className="input mt-1" /></label>
      <label className="block">Password<input name="password" type="password" required autoComplete="current-password" className="input mt-1" /></label>
      {err && <p role="alert" className="text-sm text-red-600">{err}</p>}
      <button className="btn w-full" disabled={busy}>{busy ? "Logging in…" : "Log in"}</button>
      <p className="text-sm"><Link href="/forgot-password" className="text-teal">Forgot password?</Link> · <Link href="/register" className="text-teal">Create an account</Link></p>
    </form>
  );
}
export default function Login() { return <Suspense><Form /></Suspense>; }
