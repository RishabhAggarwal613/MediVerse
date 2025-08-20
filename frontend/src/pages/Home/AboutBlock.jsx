// src/pages/Home/AboutBlock.jsx
import Card, { CardContent } from '@/components/ui/Card.jsx';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

export default function AboutBlock() {
  return (
    <section id="about" className="scroll-mt-20">
      <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-400/5 px-3 py-1 text-[13px] text-emerald-300">
        About MediVerse
      </div>
      <h2 className="mt-3 text-xl font-semibold text-gray-100">Built for clarity, privacy & speed</h2>

      <div className="mt-4 grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <Card className="border-[#1A1F1D] bg-[#0B0F10]">
            <CardContent>
              <p className="text-pretty text-gray-300">
                MediVerse brings together AI chat, report analysis, wearable sync, and diet planning
                into a single privacy-first app. Built with React 19 + Tailwind v4 and a Spring Boot
                backend, it’s designed for speed, accessibility, and a clean black–green UI.
              </p>

              <ul className="mt-4 grid gap-2 text-sm text-gray-400 sm:grid-cols-2">
                {[
                  'HIPAA-style data separation on the backend',
                  'Realtime charts & insights',
                  'Works great on mobile & desktop',
                  'Downloadable diet plan PDFs',
                ].map((text) => (
                  <li key={text} className="flex items-start gap-2">
                    <span className="mt-0.5 text-emerald-300">
                      <CheckCircleIcon fontSize="inherit" />
                    </span>
                    <span>{text}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-3 gap-3">
          {[
            { k: '~30s', v: 'Report analysis' },
            { k: 'Realtime', v: 'Wearables sync' },
            { k: '100%', v: 'Responsive UI' },
          ].map(({ k, v }) => (
            <div
              key={k}
              className="rounded-xl border border-[#1A1F1D] bg-[#0B0F10] p-4 text-center transition-colors hover:border-emerald-500/30"
            >
              <p className="text-xl font-semibold text-emerald-400">{k}</p>
              <p className="text-xs text-gray-400">{v}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
