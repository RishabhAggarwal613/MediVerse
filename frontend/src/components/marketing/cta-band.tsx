import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { Reveal } from "@/components/common/reveal";

export function CtaBand() {
  return (
    <section className="relative overflow-hidden py-16 sm:py-20">
      <Container>
        <Reveal>
          <div className="relative overflow-hidden rounded-[2rem] bg-brand-gradient p-10 shadow-2xl shadow-brand-500/20 sm:p-14">
            {/* decorative blurred circles */}
            <div className="pointer-events-none absolute -left-20 -top-20 h-64 w-64 rounded-full bg-white/20 blur-3xl" />
            <div className="pointer-events-none absolute -right-16 -bottom-16 h-72 w-72 rounded-full bg-cyan-200/30 blur-3xl" />

            <div className="relative flex flex-col items-center gap-6 text-center text-white">
              <span className="inline-flex items-center gap-2 rounded-full bg-white/15 px-4 py-1.5 text-xs font-medium text-white/90 backdrop-blur-md">
                ✨ Free to get started
              </span>
              <h2 className="max-w-2xl text-balance text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">
                Ready to take charge of your health?
              </h2>
              <p className="max-w-xl text-base text-white/85 sm:text-lg">
                Join thousands of patients and doctors who use MediVerse for
                smarter, calmer, more proactive care.
              </p>

              <div className="mt-2 flex flex-col items-center gap-3 sm:flex-row">
                <Button
                  asChild
                  size="xl"
                  variant="secondary"
                  className="bg-white text-brand-700 hover:bg-white/90"
                >
                  <Link href="/signup">
                    Sign up free
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
                <Button
                  asChild
                  size="xl"
                  variant="ghost"
                  className="text-white hover:bg-white/15 hover:text-white dark:hover:bg-white/15 dark:hover:text-white"
                >
                  <Link href="/login">I already have an account</Link>
                </Button>
              </div>
            </div>
          </div>
        </Reveal>
      </Container>
    </section>
  );
}
