import { Container } from "@/components/ui/container";
import { SectionHeader } from "@/components/marketing/features";
import { Reveal } from "@/components/common/reveal";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const FAQS = [
  {
    q: "Is MediVerse free to use?",
    a: "Creating an account, using the AI Health Assistant, and scanning reports is free. Doctor consultation fees are set by individual specialists and shown transparently before booking.",
  },
  {
    q: "How is my health data protected?",
    a: "All data is encrypted in transit and at rest. Your AI reports are private by default — only doctors you explicitly share a report with can view it. You can revoke access at any time.",
  },
  {
    q: "Does the AI replace a doctor?",
    a: "No — never. The AI Assistant is for general health information and to help you understand your reports. It does not diagnose, prescribe, or replace medical advice. Every response includes a clear reminder to consult a qualified doctor.",
  },
  {
    q: "How are doctors verified?",
    a: "Every doctor uploads their license and qualification documents during signup. Our team manually reviews each application before the doctor goes live on the platform — so you always book with a verified specialist.",
  },
  {
    q: "What kinds of reports can I scan?",
    a: "Most common lab reports work — CBC, lipid profile, liver function, thyroid panels, and more. Upload as a PDF, JPG, or PNG. The AI extracts findings, flags out-of-range values, and explains them in plain language.",
  },
  {
    q: "How do I cancel an appointment?",
    a: "Open your appointments page and click Cancel — anytime up to 2 hours before the scheduled time. Your slot is freed instantly, and the doctor is notified.",
  },
];

export function Faq() {
  return (
    <section id="faq" className="relative py-20 sm:py-24">
      <Container>
        <Reveal>
          <SectionHeader
            eyebrow="FAQ"
            title="Questions, answered"
            subtitle="Can't find what you're looking for? Email us at hello@mediverse.local."
          />
        </Reveal>

        <Reveal delay={80}>
          <div className="mx-auto mt-12 max-w-3xl">
            <Accordion type="single" collapsible className="flex flex-col gap-3">
              {FAQS.map((item, idx) => (
                <AccordionItem key={item.q} value={`item-${idx}`}>
                  <AccordionTrigger>{item.q}</AccordionTrigger>
                  <AccordionContent>{item.a}</AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </Reveal>
      </Container>
    </section>
  );
}
