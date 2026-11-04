import Legal from "@/components/Legal";
import { getSettings } from "@/lib/settings";

export const metadata = { title: "Terms and Conditions" };
export default async function Terms() {
  const s = await getSettings();
  return <Legal active="/terms" title="Terms and Conditions" sections={[
    { h: "Using our website", p: [`By using ${s.business_name} you agree to these terms. You must give accurate information when you register and keep your password private. You are responsible for activity on your account.`] },
    { h: "Our products", p: ["We sell digital study resources, mainly PDF files. Products are for your personal study and revision.", "We only sell materials we created or are authorised to distribute."] },
    { h: "Licence and restrictions", p: ["When you buy a product you receive a personal, non-transferable licence to use it. You must not:", "- Copy, resell, upload or share the files with others.", "- Remove copyright notices or publish our content as your own."] },
    { h: "Payments", p: ["Prices are in Nigerian naira (₦). Payments are processed securely by Paystack. An order is confirmed only after the payment is verified by our system."] },
    { h: "Delivery and downloads", p: ["After payment is verified, your product appears in My Library and you can download it. Each product has a download limit. Links to files are temporary and private."] },
    { h: "Refunds", p: ["Our Refund Policy explains when you can request a refund. Refund requests must be made within 24 hours of payment."] },
    { h: "Educational use only", p: ["Our materials are for learning and revision. They do not replace approved textbooks, clinical guidelines, professional supervision or your institution's protocols."] },
    { h: "Limitation of liability", p: ["We take care to keep our materials accurate, but we cannot guarantee exam results or that content suits every course or syllabus. To the extent allowed by law, we are not liable for losses arising from your use of the materials."] },
    { h: "Changes, law and contact", p: [`We may update these terms from time to time. These terms are governed by the laws of the Federal Republic of Nigeria. Contact us at ${s.support_email}.`] },
  ]} />;
}
