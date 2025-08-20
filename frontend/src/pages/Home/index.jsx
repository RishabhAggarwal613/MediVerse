// src/pages/Home/index.jsx
import Hero from './Hero.jsx';
import FeatureGrid from './FeatureGrid.jsx';
import AboutBlock from './AboutBlock.jsx';
import FAQ from './FAQ.jsx';

export default function HomePage() {
  return (
    <div className="relative">
      {/* subtle page-level accent divider */}
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-emerald-500/40 to-transparent" aria-hidden />

      {/* Hero */}
      <section id="hero" className="relative">
        <Hero />
      </section>

      {/* divider */}
      <div className="mx-auto max-w-7xl px-0">
        <div className="my-6 h-px bg-gradient-to-r from-emerald-500/30 via-transparent to-emerald-500/30 rounded-full" aria-hidden />
      </div>

      {/* Features */}
      <section id="features" className="relative">
        <FeatureGrid />
      </section>

      {/* divider */}
      <div className="mx-auto max-w-7xl px-0">
        <div className="my-6 h-px bg-gradient-to-r from-transparent via-emerald-500/20 to-transparent rounded-full" aria-hidden />
      </div>

      {/* About */}
      <section id="about" className="relative">
        <AboutBlock />
      </section>

      {/* divider */}
      <div className="mx-auto max-w-7xl px-0">
        <div className="my-6 h-px bg-gradient-to-r from-emerald-500/20 via-transparent to-emerald-500/20 rounded-full" aria-hidden />
      </div>

      {/* FAQ */}
      <section id="faq" className="relative">
        <FAQ />
      </section>
    </div>
  );
}
