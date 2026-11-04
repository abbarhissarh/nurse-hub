import { getSettings, intl } from "@/lib/settings";

export const metadata = { title: "Contact" };
export default async function Contact() {
  const s = await getSettings();
  const cards: [string, string, string, string][] = [];
  if (s.support_email) cards.push(["✉️", "Email", s.support_email, `mailto:${s.support_email}`]);
  if (s.phone) cards.push(["📞", "Phone", s.phone, `tel:+${intl(s.phone)}`]);
  if (s.whatsapp) cards.push(["💬", "WhatsApp", s.whatsapp, `https://wa.me/${intl(s.whatsapp)}?text=${encodeURIComponent("Hello Nurse Hub, I need help with ")}`]);
  if (s.instagram) cards.push(["📸", "Instagram", "Follow us", s.instagram]);
  return (
    <>
      <section className="bg-gradient-to-br from-navy to-[#14506b] py-14 text-white"><div className="mx-auto max-w-3xl px-4"><h1 className="text-4xl font-extrabold">Contact us</h1><p className="mt-2 opacity-90">Questions, support or a refund request? Reach us here.</p></div></section>
      <div className="mx-auto max-w-3xl space-y-6 px-4 py-10">
        <div className="grid gap-4 sm:grid-cols-2">{cards.map(([i, t, v, h]) => (
          <a key={t} href={h} target={h.startsWith("http") ? "_blank" : undefined} rel="noopener noreferrer" className="lift rounded-2xl border border-slate-200 bg-white p-5">
            <div className="text-2xl">{i}</div><p className="mt-1 font-bold">{t}</p><p className="break-all text-muted">{v}</p></a>))}</div>
        <p className="rounded-xl bg-sky p-4 text-sm text-muted">For refund requests, contact us within 24 hours of payment and include your order number.</p>
      </div>
    </>
  );
}
