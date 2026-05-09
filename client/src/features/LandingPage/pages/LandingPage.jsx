import React, { useEffect } from 'react';
import { Header } from '../components/Header';
import { HeroSection } from '../components/HeroSection';
import { FeaturesSection } from '../components/FeaturesSection';
import { RolesSection } from '../components/RolesSection';
import { CTASection } from '../components/CTASection';
import { Footer } from '../components/Footer';
import '../styles/landing.css';

/* ─── Hook: Scroll animations ───────────────────────────── */
function useScrollAnimation() {
  useEffect(() => {
    const els = document.querySelectorAll('.animate-on-scroll');
    const obs = new IntersectionObserver(
      (entries) => entries.forEach((e) => { if (e.isIntersecting) e.target.classList.add('visible'); }),
      { threshold: 0.12 }
    );
    els.forEach((el) => obs.observe(el));
    return () => obs.disconnect();
  }, []);
}

export function LandingPage() {
  useScrollAnimation();

  return (
    <div className="landing-root">
      <Header />
      <HeroSection />
      <FeaturesSection />
      <RolesSection />
      <CTASection />
      <Footer />
    </div>
  );
}

export default LandingPage;
