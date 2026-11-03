import { NextResponse } from "next/server";
import { validSignature } from "@/lib/paystack";
import { fulfilByReference } from "@/lib/fulfil";

export const dynamic = "force-dynamic";
export async function POST(req: Request) {
  const raw = await req.text();
  if (!validSignature(raw, req.headers.get("x-paystack-signature"))) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }
  let evt: any;
  try { evt = JSON.parse(raw); } catch { return NextResponse.json({ error: "Bad body" }, { status: 400 }); }
  if (evt?.event === "charge.success" && typeof evt?.data?.reference === "string") {
    await fulfilByReference(evt.data.reference);
  }
  return NextResponse.json({ received: true });
}
