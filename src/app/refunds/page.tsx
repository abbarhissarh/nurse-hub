import Legal from "@/components/Legal";
import { getSettings, intl } from "@/lib/settings";

export const metadata = { title: "Refund Policy" };
export default async function Refunds() {
  const s = await getSettings();
  return <Legal active="/refunds" title="Refund Policy" sections={[
    { h: "In short", p: ["Our products are digital files delivered instantly, so we handle refunds carefully. You can request a refund within 24 hours of your payment."] },
    { h: "When you can get a refund", p: ["- Duplicate payment: you were charged more than once for the same order.", "- Inaccessible file: the file will not download or open and we cannot fix it.", "- Defective or wrong file: the file is damaged, incomplete or not the product you bought.", "Other situations within the 24 hours are reviewed case by case."] },
    { h: "How to ask", p: [`Within 24 hours of payment, email ${s.support_email}${s.whatsapp ? ` or message us on WhatsApp (+${intl(s.whatsapp)})` : ""} with:`, "- Your order number and the email you used.", "- A short description of the problem, with a screenshot if you can."] },
    { h: "What happens next", p: ["We review your request and tell you the outcome. Approved refunds are returned to your original payment method through Paystack. Access to the refunded product is removed."] },
    { h: "After 24 hours", p: ["Requests made more than 24 hours after payment are not eligible, except where required by law."] },
  ]} />;
}
