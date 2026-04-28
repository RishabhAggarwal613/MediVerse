import Link from "next/link";
import { ArrowRight, Sparkles, ShieldCheck, Activity } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { GradientBlob } from "@/components/marketing/gradient-blob";
import { HeartbeatLine } from "@/components/marketing/illustrations/heartbeat-line";

export function Hero() {
  return (
    <section className="relative overflow-hidden pt-28 pb-20 md:pt-32 md:pb-28">
      {/* Background grid */}
      <div className="pointer-events-none absolute inset-0 -z-10 bg-hero-grid bg-[size:40px_40px] opacity-60 [mask-image:radial-gradient(ellipse_60%_60%_at_50%_30%,black,transparent)] dark:opacity-25" />

      {/* Animated gradient blobs */}
      <GradientBlob
        className="-top-20 -left-32 h-[28rem] w-[28rem] dark:opacity-30"
        variant="emerald"
      />
      <GradientBlob
        className="-top-10 -right-24 h-[24rem] w-[24rem] [animation-delay:-4s] dark:opacity-30"
        variant="cyan"
      />
      <GradientBlob
        className="bottom-0 left-1/3 h-[18rem] w-[18rem] opacity-40 [animation-delay:-8s] dark:opacity-20"
        variant="violet"
      />

      <Container className="relative">
        <div className="mx-auto flex max-w-3xl flex-col items-center text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-brand-200 bg-white/70 px-4 py-1.5 text-xs font-medium text-brand-700 shadow-sm backdrop-blur-md animate-fade-up dark:border-brand-700/50 dark:bg-white/5 dark:text-brand-300">
            <Sparkles className="h-3.5 w-3.5" />
            AI-powered healthcare, reimagined
          </span>

          <h1
            className="mt-6 text-4xl font-bold tracking-tight text-foreground text-balance sm:text-5xl md:text-6xl lg:text-7xl animate-fade-up"
            style={{ animationDelay: "0.1s" }}
          >
            Your health,{" "}
            <span className="text-gradient-brand">powered by AI</span>
            <br className="hidden sm:block" /> and trusted doctors.
          </h1>

          <p
            className="mt-6 max-w-2xl text-lg leading-relaxed text-muted-foreground sm:text-xl animate-fade-up"
            style={{ animationDelay: "0.2s" }}
          >
            Chat with an AI health assistant, scan medical reports for instant
            insights, and book consultations with verified specialists — all in
            one place.
          </p>

          <div
            className="mt-10 flex flex-col items-center gap-3 sm:flex-row animate-fade-up"
            style={{ animationDelay: "0.3s" }}
          >
            <Button asChild size="xl">
              <Link href="/signup">
                Get started free
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button asChild variant="outline" size="xl">
              <Link href="#features">See how it works</Link>
            </Button>
          </div>

          <div
            className="mt-10 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs text-muted-foreground animate-fade-up"
            style={{ animationDelay: "0.4s" }}
          >
            <span className="inline-flex items-center gap-1.5">
              <ShieldCheck className="h-4 w-4 text-brand-600 dark:text-brand-400" />
              HIPAA-grade security
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Activity className="h-4 w-4 text-brand-600 dark:text-brand-400" />
              Verified specialists
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Sparkles className="h-4 w-4 text-brand-600 dark:text-brand-400" />
              Powered by Gemini
            </span>
          </div>

          <HeartbeatLine className="mx-auto mt-12 max-w-xl opacity-70 animate-fade-up [animation-delay:0.5s]" />
        </div>

        {/* Hero visual: floating preview card */}
        <div
          className="relative mx-auto mt-12 max-w-4xl animate-fade-up"
          style={{ animationDelay: "0.6s" }}
        >
          <div className="relative rounded-3xl border border-white/60 bg-white/70 p-2 shadow-2xl shadow-brand-500/10 backdrop-blur-xl dark:border-white/10 dark:bg-white/5">
            <div className="absolute -top-3 left-6 flex gap-1.5">
              <span className="h-3 w-3 rounded-full bg-rose-400/80" />
              <span className="h-3 w-3 rounded-full bg-amber-400/80" />
              <span className="h-3 w-3 rounded-full bg-emerald-400/80" />
            </div>
            <div className="rounded-2xl bg-gradient-to-br from-white to-brand-50 p-6 sm:p-8 dark:from-white/5 dark:to-brand-500/5">
              <div className="grid gap-4 md:grid-cols-3">
                <PreviewCard
                  emoji="💬"
                  title="AI Assistant"
                  body="“What can I do about a recurring headache?”"
                />
                <PreviewCard
                  emoji="📄"
                  title="Report Analysis"
                  body="Hemoglobin: 14.2 g/dL · ✓ Normal"
                  highlight
                />
                <PreviewCard
                  emoji="🗓"
                  title="Next Appointment"
                  body="Dr. Aisha · Tomorrow, 10:30 AM"
                />
              </div>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}

function PreviewCard({
  emoji,
  title,
  body,
  highlight,
}: {
  emoji: string;
  title: string;
  body: string;
  highlight?: boolean;
}) {
  return (
    <div
      className={
        "rounded-2xl border bg-white p-5 shadow-sm transition-transform animate-float dark:bg-white/[0.06] " +
        (highlight
          ? "border-brand-200 [animation-delay:-2s] dark:border-brand-700/50"
          : "border-border [animation-delay:-1s]")
      }
    >
      <div className="text-2xl">{emoji}</div>
      <p className="mt-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        {title}
      </p>
      <p className="mt-1.5 text-sm font-medium text-foreground">{body}</p>
    </div>
  );
}
