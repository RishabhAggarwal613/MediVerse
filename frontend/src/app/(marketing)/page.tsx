import type { Metadata } from "next";

import { Hero } from "@/components/marketing/hero";
import { TrustStrip } from "@/components/marketing/trust-strip";
import { Features } from "@/components/marketing/features";
import { HowItWorks } from "@/components/marketing/how-it-works";
import { ForDoctors } from "@/components/marketing/for-doctors";
import { About } from "@/components/marketing/about";
import { Testimonials } from "@/components/marketing/testimonials";
import { Faq } from "@/components/marketing/faq";
import { CtaBand } from "@/components/marketing/cta-band";

export const metadata: Metadata = {
  title: "MediVerse — AI-powered healthcare, trusted doctors",
  description:
    "Chat with an AI health assistant, scan medical reports for instant insights, and book consultations with verified specialists — all in one place.",
  openGraph: {
    title: "MediVerse — AI-powered healthcare, trusted doctors",
    description:
      "Chat with an AI health assistant, scan medical reports, and book consultations with verified specialists.",
    type: "website",
  },
};

export default function LandingPage() {
  return (
    <>
      <Hero />
      <TrustStrip />
      <Features />
      <HowItWorks />
      <ForDoctors />
      <About />
      <Testimonials />
      <Faq />
      <CtaBand />
    </>
  );
}
