import React from 'react';
import { Heart, Shield, Lock } from 'lucide-react';
import { Logo } from './ui';

export const Footer: React.FC = () => {
  const cols = [
    { h: 'Core Modules', links: ['AI Medical Chatbot', 'Symptom Recommendations', 'Medicine Suggestions', 'Doctor Match', 'Health Tips'] },
    { h: 'Tech Stack', links: ['React 19 + TypeScript', 'Gemini / OpenAI Models', 'Socket.IO Real-Time', 'MongoDB', 'Tailwind CSS v4'] },
    { h: 'Company', links: ['About', 'Careers', 'Privacy', 'Terms', 'Contact'] },
  ];

  return (
    <footer className="border-t border-line bg-surface/50">
      <div className="mx-auto max-w-7xl px-5 py-14 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-[1.4fr_repeat(3,1fr)]">
          <div className="space-y-4">
            <Logo />
            <p className="max-w-xs text-sm leading-relaxed text-ink-soft">
              AI-powered healthcare assistant providing instant diagnostic roadmaps and verified specialist connections.
            </p>
            <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-300">
              <Shield className="h-4 w-4" /> HIPAA-Ready Simulation
            </span>
          </div>

          {cols.map((c) => (
            <div key={c.h}>
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-ink-muted">{c.h}</p>
              <ul className="mt-4 space-y-2.5 text-sm">
                {c.links.map((l) => (
                  <li key={l}>
                    <a href="#" className="text-ink-soft transition-colors hover:text-ink">{l}</a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 flex flex-col items-start justify-between gap-4 border-t border-line pt-6 sm:flex-row sm:items-center">
          <p className="text-xs text-ink-muted">© {new Date().getFullYear()} Medisage Healthcare Systems. Not a substitute for emergency care.</p>
          <div className="flex items-center gap-4 text-xs text-ink-muted">
            <span className="inline-flex items-center gap-1"><Lock className="h-3.5 w-3.5 text-brand-300" /> 256-bit SSL</span>
            <span className="inline-flex items-center gap-1">Built with <Heart className="h-3.5 w-3.5 fill-rose-400 text-rose-400" /> for accessible care</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
