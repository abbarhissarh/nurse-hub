import Legal from "@/components/Legal";

export const metadata = { title: "Disclaimer" };
export default function Disclaimer() {
  return <Legal active="/disclaimer" title="Educational Disclaimer" sections={[
    { h: "For learning only", p: ["The materials sold on this website are for education and revision. They are not medical advice and must not be used to make decisions about patient care."] },
    { h: "Follow approved guidance", p: ["Our materials do not replace approved textbooks, current clinical guidelines, professional supervision, your lecturers' instructions or your institution's protocols. Always follow the rules of your school, hospital and regulatory body."] },
    { h: "No guarantees", p: ["We work to keep our content clear and accurate, but we cannot guarantee examination results. Practice and guidance may change, so check current official sources."] },
  ]} />;
}
