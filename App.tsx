import React from 'react';
import { Hero } from './components/Hero';
import { HowItWorks } from './components/HowItWorks';
import { Pricing } from './components/Pricing';
import { BetaSignup } from './components/BetaSignup';
import { Footer } from './components/Footer';

export default function App() {
  return (
    <main className="min-h-screen w-full bg-white selection:bg-black selection:text-white">
      {/* Sticky Navigation / Header */}
      <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-4 bg-white/80 backdrop-blur-md border-b border-gray-100">
        <div className="text-xl font-bold tracking-tight">Vibepe.</div>
        <a 
          href="#beta"
          className="text-sm font-medium px-4 py-2 bg-black text-white rounded-full hover:bg-gray-800 transition-colors"
        >
          Get Early Access
        </a>
      </nav>

      {/* Main Sections */}
      <div className="pt-20">
        <Hero />
        <HowItWorks />
        <Pricing />
        <BetaSignup />
      </div>

      <Footer />
    </main>
  );
}