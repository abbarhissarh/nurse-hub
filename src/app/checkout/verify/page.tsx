import Link from "next/link";
import { fulfilByReference } from "@/lib/fulfil";
import ClearCart from "@/components/ClearCart";

export const dynamic = "force-dynamic";
export const metadata = { title: "Payment status" };

export default async function Verify({ searchParams }: { searchParams: { reference?: string; trxref?: string } }) {
  const ref = searchParams.reference || searchParams.trxref;
  const result = ref ? await fulfilByReference(ref) : { ok: false, state: "no_reference" };
  const box = "mx-auto mt-10 max-w-md space-y-3 rounded-2xl border border-slate-200 bg-white p-6";
  if (result.ok) {
    return (
      <div className={box}><ClearCart /><h1 className="text-2xl font-extrabold text-teal">Payment successful</h1>
        <p>Your purchase is verified and added to your library.</p>
        <Link href="/library" className="btn w-full">Go to My Library</Link></div>
    );
  }
  const pending = ["abandoned", "pending", "ongoing", "verify_error", "processing", "queued"].includes(result.state);
  return (
    <div className={box}>
      <h1 className="text-2xl font-extrabold">{pending ? "Payment not confirmed yet" : "Payment not completed"}</h1>
      <p className="text-muted">{pending
        ? "If you were charged, wait a minute and refresh this page. Your files appear automatically once Paystack confirms."
        : "We couldn’t confirm this payment. You have not been given access. If money left your account, contact us with your reference."}</p>
      {ref && <p className="break-all text-xs text-muted">Reference: {ref}</p>}
      <div className="flex gap-3"><Link href={ref ? `/checkout/verify?reference=${encodeURIComponent(ref)}` : "/cart"} className="btn-alt">Refresh</Link><Link href="/cart" className="btn-alt">Back to cart</Link></div>
    </div>
  );
}
