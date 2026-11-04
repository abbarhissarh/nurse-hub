import Legal from "@/components/Legal";
import { getSettings } from "@/lib/settings";

export const metadata = { title: "Privacy Policy" };
export default async function Privacy() {
  const s = await getSettings();
  return <Legal active="/privacy" title="Privacy Policy" sections={[
    { h: "Who we are", p: [`${s.business_name} (“we”, “us”) sells digital nursing study resources online. This policy explains what personal information we collect and how we use it.`] },
    { h: "What we collect", p: ["- Your full name and email address when you create an account.", "- Your orders, payments status and download activity.", "- Basic technical data such as your IP address when you download a file, to protect our products from misuse.", "We do not see or store your card details. Payments are processed by Paystack."] },
    { h: "How we use it", p: ["- To create and secure your account.", "- To process payments and deliver your purchased files.", "- To respond to support and refund requests.", "We do not send promotional messages unless you have agreed to receive them."] },
    { h: "Who we share it with", p: ["We share only what is needed with trusted service providers: Paystack (payments), Supabase (database, login and file storage) and Vercel (website hosting). We do not sell your personal information."] },
    { h: "Cookies and local storage", p: ["We use cookies to keep you logged in. Your shopping cart is saved in your browser so it is still there when you return."] },
    { h: "Your rights", p: [`You can ask us to correct or delete your account information, or to explain what we hold about you, by contacting ${s.support_email}. We handle personal data in line with applicable Nigerian data protection law.`] },
    { h: "Changes and contact", p: [`We may update this policy and will change the date above when we do. Questions? Email ${s.support_email}.`] },
  ]} />;
}
