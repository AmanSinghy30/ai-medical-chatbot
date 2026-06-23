import React, { useState } from 'react';
import { Sparkles, ArrowRight, ShieldCheck, HeartPulse, Search, Bot, Activity } from 'lucide-react';
import { Eyebrow, Button } from './ui';

interface HeroProps {
  onSearchSymptom: (symptom: string) => void;
  onOpenChat: () => void;
}

export const Hero: React.FC<HeroProps> = ({ onSearchSymptom, onOpenChat }) => {
  const [symptom, setSymptom] = useState('');

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (symptom.trim()) onSearchSymptom(symptom.trim());
  };

  const pills = ['Sharp headache', 'Persistent dry cough', 'Chest discomfort', 'Sudden skin rash', 'Stomach cramps'];

  return (
    <section className="relative isolate overflow-hidden pb-16 pt-28 md:pt-36">
      <div className="mx-auto max-w-7xl px-5 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-12">
          {/* Copy */}
          <div className="space-y-7 text-center lg:col-span-7 lg:text-left">
            <div className="flex justify-center lg:justify-start">
              <Eyebrow>
                <Sparkles className="h-3.5 w-3.5" />
                AI Medical Recommendation & Doctor Match
              </Eyebrow>
            </div>

            <h1 className="text-4xl font-bold leading-[1.05] tracking-tight text-slate-900 sm:text-5xl md:text-[64px]">
              Your personal AI doctor,{' '}
              <span className="text-brand-600">
                ready to listen 24/7.
              </span>
            </h1>

            <p className="mx-auto max-w-2xl text-md leading-relaxed text-slate-600 sm:text-lg lg:mx-0">
              Describe how you feel in plain language. Medisage delivers evidence-aware assessments, OTC medicine
              guidance, and priority referrals to verified specialists — in seconds, all in a private real-time chat.
            </p>

            {/* Symptom launcher */}
            <div className="mx-auto max-w-xl space-y-3 lg:mx-0">
              <form
                onSubmit={submit}
                className="flex flex-col items-stretch gap-2 rounded-2xl border border-slate-200 bg-white p-2 shadow-sm transition-colors focus-within:border-brand-500 sm:flex-row sm:items-center"
              >
                <div className="flex flex-1 items-center gap-2.5 pl-3">
                  <Search className="h-5 w-5 shrink-0 text-slate-400" />
                  <input
                    value={symptom}
                    onChange={(e) => setSymptom(e.target.value)}
                    placeholder="e.g. Fever with chills since last night..."
                    aria-label="Describe your symptom"
                    className="w-full bg-transparent py-2 text-md text-slate-900 placeholder:text-slate-500 focus:outline-none"
                  />
                </div>
                <Button type="submit" size="md" className="shrink-0">
                  Start Assessment <ArrowRight className="h-4 w-4" />
                </Button>
              </form>

              <div className="flex flex-wrap items-center justify-center gap-1.5 pt-1 lg:justify-start">
                <span className="mr-1 flex items-center gap-1 text-xs font-semibold text-slate-600">
                  <HeartPulse className="h-3.5 w-3.5 text-rose-500" /> Common:
                </span>
                {pills.map((p) => (
                  <button
                    key={p}
                    onClick={() => onSearchSymptom(p)}
                    className="rounded-lg border border-slate-200 bg-white px-3 py-1 text-xs font-medium text-slate-600 transition-colors hover:border-slate-300 hover:text-slate-900 shadow-sm"
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>

            {/* Stats */}
            <div className="mx-auto grid max-w-lg grid-cols-3 gap-6 border-t border-slate-200 pt-6 lg:mx-0">
              {[
                ['180ms', 'Triage latency'],
                ['40+', 'Specialties'],
                ['98.7%', 'Protocol accuracy'],
              ].map(([v, l], i) => (
                <div key={l} className="text-center lg:text-left">
                  <p className={`text-2xl font-bold tracking-tight sm:text-3xl ${i === 2 ? 'text-brand-600' : 'text-slate-900'}`}>{v}</p>
                  <p className="mt-1 text-xs font-medium text-slate-500">{l}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Visual */}
          <div className="relative flex justify-center lg:col-span-5">
            <div className="w-full max-w-md overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl">
              {/* header */}
              <div className="flex items-center justify-between border-b border-slate-100 px-5 py-3.5 bg-slate-50">
                <div className="flex items-center gap-2.5">
                  <span className="relative flex h-3 w-3">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-70" />
                    <span className="relative inline-flex h-3 w-3 rounded-full bg-emerald-500" />
                  </span>
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-700">Live AI Assistant</span>
                </div>
                <span className="rounded-full border border-slate-200 bg-white px-2 py-0.5 font-mono text-[10px] font-semibold text-slate-500 shadow-sm">
                  Gemini · GPT
                </span>
              </div>

              {/* mock chat */}
              <div className="space-y-4 p-5 bg-slate-50/50">
                <div className="flex items-start gap-2.5">
                  <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-brand-100 text-brand-700 shadow-sm"><Bot className="h-4 w-4" /></span>
                  <div className="flex-1 rounded-2xl rounded-bl-sm border border-slate-200 bg-white px-3.5 py-3 text-xs leading-relaxed text-slate-700 shadow-sm">
                    Good evening! I'm Sage. What symptoms would you like me to evaluate right now?
                  </div>
                </div>
                <div className="flex flex-row-reverse items-start gap-2.5">
                  <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-slate-200 text-[10px] font-bold text-slate-700 shadow-sm">YOU</span>
                  <div className="rounded-2xl rounded-br-sm bg-brand-600 px-3.5 py-3 text-xs font-medium text-white shadow-sm">
                    Mild headache and slight fever since this morning.
                  </div>
                </div>
                <div className="flex items-start gap-2.5">
                  <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-brand-100 text-brand-700 shadow-sm"><Bot className="h-4 w-4" /></span>
                  <div className="flex-1 space-y-3 rounded-2xl rounded-bl-sm border border-slate-200 bg-white px-3.5 py-3 text-xs leading-relaxed text-slate-700 shadow-sm">
                    <p className="flex items-center gap-1 font-semibold text-brand-700">
                      <ShieldCheck className="h-3.5 w-3.5" /> Clinical breakdown
                    </p>
                    <p>Likely a viral response or mild dehydration. Rest, hydrate, and consider paracetamol.</p>
                    <div className="flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50 px-3 py-2">
                      <div>
                        <p className="text-xs font-semibold text-slate-900">Tylenol 500mg</p>
                        <p className="text-[10px] text-slate-500">OTC · Acetaminophen</p>
                      </div>
                      <span className="text-xs font-bold text-emerald-600">Safe</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* CTA */}
              <div className="border-t border-slate-100 p-4 bg-white">
                <button
                  onClick={onOpenChat}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-brand-50 py-3 text-xs font-bold uppercase tracking-wider text-brand-700 transition-colors hover:bg-brand-100 border border-brand-200"
                >
                  <Activity className="h-4 w-4" /> Open Full AI Assistant
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
