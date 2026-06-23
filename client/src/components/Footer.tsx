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
    <footer className="border-t border-slate-200 bg-slate-50">
      <div className="mx-auto max-w-7xl px-5 py-14 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-[1.4fr_repeat(3,1fr)]">
          <div className="space-y-4">
            <Logo />
            <p className="max-w-xs text-sm leading-relaxed text-slate-600">
              AI-powered healthcare assistant providing instant diagnostic roadmaps and verified specialist connections.
            </p>
            <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-600 bg-emerald-50 px-2 py-1 rounded border border-emerald-100">
              <Shield className="h-4 w-4" /> HIPAA-Ready Platform
            </span>
          </div>

          {cols.map((c) => (
            <div key={c.h}>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-900">{c.h}</p>
              <ul className="mt-4 space-y-2.5 text-sm">
                {c.links.map((l) => (
                  <li key={l}>
                    <a href="#" className="text-slate-600 transition-colors hover:text-brand-600">{l}</a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 flex flex-col items-start justify-between gap-4 border-t border-slate-200 pt-6 sm:flex-row sm:items-center">
          <p className="text-xs text-slate-500">© {new Date().getFullYear()} Medisage Healthcare Systems. Not a substitute for emergency care.</p>
          <div className="flex items-center gap-4 text-xs text-slate-500">
            <span className="inline-flex items-center gap-1"><Lock className="h-3.5 w-3.5 text-slate-400" /> 256-bit SSL</span>
            <span className="inline-flex items-center gap-1">Built with <Heart className="h-3.5 w-3.5 fill-rose-500 text-rose-500" /> for accessible care</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
