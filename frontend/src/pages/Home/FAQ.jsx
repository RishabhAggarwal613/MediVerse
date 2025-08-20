// src/pages/Home/FAQ.jsx
import Card, { CardContent } from '@/components/ui/Card.jsx';

const faqs = [
  {
    q: 'Is MediVerse a replacement for a doctor?',
    a: 'No. It provides educational insights and triage suggestions. For diagnosis or treatment, consult a licensed physician.',
  },
  {
    q: 'Which reports are supported?',
    a: 'Common lab PDFs and images (PNG/JPG). We extract ranges, flags, and summaries.',
  },
  {
    q: 'Which wearables can I connect?',
    a: 'Popular providers with OAuth/device codes (e.g., Google Fit, Fitbit, Garmin) depending on your backend integrations.',
  },
  {
    q: 'Is my data private?',
    a: 'Yes. Tokens are stored client-side; the server uses isolated collections per user. You control connecting/disconnecting providers.',
  },
];

export default function FAQ() {
  return (
    <section id="faq" className="scroll-mt-20">
      <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-400/5 px-3 py-1 text-[13px] text-emerald-300">
        FAQs
      </div>
      <h2 className="mt-3 text-xl font-semibold text-gray-100">Frequently asked</h2>

      <Card className="mt-4 border-[#1A1F1D] bg-[#0B0F10]">
        <CardContent className="p-0">
          {faqs.map((f, i) => (
            <details
              key={i}
              className="group border-t border-[#1A1F1D] first:border-t-0"
            >
              <summary className="flex cursor-pointer list-none items-center justify-between px-5 py-4 transition-colors hover:bg-white/5 group-open:bg-emerald-400/5">
                <span className="text-sm font-medium text-gray-200">{f.q}</span>
                <span className="grid h-6 w-6 place-items-center rounded-md bg-emerald-400/10 text-emerald-300 ring-1 ring-emerald-400/20 transition-transform duration-200 group-open:rotate-45">
                  ＋
                </span>
              </summary>
              <div className="px-5 pb-4 text-sm leading-6 text-gray-400">
                {f.a}
              </div>
            </details>
          ))}
        </CardContent>
      </Card>
    </section>
  );
}
