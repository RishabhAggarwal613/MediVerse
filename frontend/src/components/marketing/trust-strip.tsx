import { Container } from "@/components/ui/container";
import { Reveal } from "@/components/common/reveal";

const STATS = [
  { value: "10,000+", label: "Patients onboarded" },
  { value: "200+", label: "Verified doctors" },
  { value: "50+", label: "Specializations" },
  { value: "98%", label: "Satisfaction rate" },
];

export function TrustStrip() {
  return (
    <section className="relative">
      <div className="bg-brand-gradient py-10">
        <Container>
          <div className="grid grid-cols-2 gap-y-6 sm:grid-cols-4 sm:gap-x-8">
            {STATS.map((s, idx) => (
              <Reveal key={s.label} delay={80 * idx}>
                <div className="flex flex-col items-center text-center text-white">
                  <span className="text-2xl font-bold tracking-tight sm:text-3xl">
                    {s.value}
                  </span>
                  <span className="mt-1 text-xs font-medium uppercase tracking-[0.18em] text-white/80">
                    {s.label}
                  </span>
                </div>
              </Reveal>
            ))}
          </div>
        </Container>
      </div>
    </section>
  );
}
