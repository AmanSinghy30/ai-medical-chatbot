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
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10 bg-mesh">
        <div className="absolute inset-0 grid-lines [mask-image:radial-gradient(ellipse_70%_55%_at_50%_0%,black,transparent)]" />
      </div>

      <div className="mx-auto max-w-7xl px-5 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-12">
          {/* Copy */}
          <div className="space-y-7 text-center lg:col-span-7 lg:text-left">
            <div className="flex justify-center lg:justify-start">
              <Eyebrow>
                <Sparkles className="h-3.5 w-3.5 animate-spin" style={{ animationDuration: '8s' }} />
                AI Medical Recommendation & Doctor Match
              </Eyebrow>
            </div>

            <h1 className="text-4xl font-semibold leading-[1.05] tracking-tight text-ink sm:text-5xl md:text-[64px]">
              Your personal AI doctor,{' '}
              <span className="bg-gradient-to-r from-brand-300 via-brand-400 to-accent-400 bg-clip-text text-transparent">
                ready to listen 24/7.
              </span>
            </h1>

            <p className="mx-auto max-w-2xl text-md leading-relaxed text-ink-soft sm:text-lg lg:mx-0">
              Describe how you feel in plain language. Medisage delivers evidence-aware assessments, OTC medicine
              guidance, and priority referrals to verified specialists — in seconds, all in a private real-time chat.
            </p>

            {/* Symptom launcher */}
            <div className="mx-auto max-w-xl space-y-3 lg:mx-0">
              <form
                onSubmit={submit}
                className="flex flex-col items-stretch gap-2 rounded-2xl border border-line bg-raised/70 p-2 backdrop-blur-sm transition-colors focus-within:border-brand-400/50 sm:flex-row sm:items-center"
              >
                <div className="flex flex-1 items-center gap-2.5 pl-3">
                  <Search className="h-5 w-5 shrink-0 text-brand-300" />
                  <input
                    value={symptom}
                    onChange={(e) => setSymptom(e.target.value)}
                    placeholder="e.g. Fever with chills since last night..."
                    aria-label="Describe your symptom"
                    className="w-full bg-transparent py-2 text-md text-ink placeholder:text-ink-muted focus:outline-none"
                  />
                </div>
                <Button type="submit" size="md" className="shrink-0">
                  Start AI Assessment <ArrowRight className="h-4 w-4" />
                </Button>
              </form>

              <div className="flex flex-wrap items-center justify-center gap-1.5 pt-1 lg:justify-start">
                <span className="mr-1 flex items-center gap-1 text-xs font-semibold text-ink-soft">
                  <HeartPulse className="h-3.5 w-3.5 text-rose-400" /> Common:
                </span>
                {pills.map((p) => (
                  <button
                    key={p}
                    onClick={() => onSearchSymptom(p)}
                    className="rounded-lg border border-line bg-white/[0.03] px-3 py-1 text-xs font-medium text-ink-soft transition-colors hover:border-brand-400/40 hover:text-ink"
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>

            {/* Stats */}
            <div className="mx-auto grid max-w-lg grid-cols-3 gap-6 border-t border-line pt-6 lg:mx-0">
              {[
                ['180ms', 'Triage latency'],
                ['40+', 'Specialties'],
                ['98.7%', 'Protocol accuracy'],
              ].map(([v, l], i) => (
                <div key={l} className="text-center lg:text-left">
                  <p className={`text-2xl font-semibold tracking-tight sm:text-3xl ${i === 2 ? 'text-brand-300' : 'text-ink'}`}>{v}</p>
                  <p className="mt-1 text-xs font-medium text-ink-muted">{l}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Visual */}
          <div className="relative flex justify-center lg:col-span-5">
            <div aria-hidden className="absolute -inset-6 -z-10 rounded-[40px] bg-gradient-to-br from-brand-500/15 via-accent-500/10 to-violet-400/10 blur-3xl" />
            <div className="w-full max-w-md overflow-hidden rounded-2xl border border-line bg-surface/90 shadow-2xl backdrop-blur-xl">
              {/* header */}
              <div className="flex items-center justify-between border-b border-line px-5 py-3.5">
                <div className="flex items-center gap-2.5">
                  <span className="relative flex h-3 w-3">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-70" />
                    <span className="relative inline-flex h-3 w-3 rounded-full bg-emerald-500" />
                  </span>
                  <span className="text-xs font-semibold uppercase tracking-wider text-ink-soft">Live AI Assistant</span>
                </div>
                <span className="rounded-full border border-brand-500/25 bg-brand-500/10 px-2 py-0.5 font-mono text-[10px] text-brand-300">
                  Gemini · GPT
                </span>
              </div>

              {/* mock chat */}
              <div className="space-y-4 p-5">
                <div className="flex items-start gap-2.5">
                  <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-gradient-to-br from-brand-400 to-accent-500 text-[#04201d]"><Bot className="h-4 w-4" /></span>
                  <div className="flex-1 rounded-2xl rounded-bl-sm border border-line bg-raised px-3.5 py-3 text-xs leading-relaxed text-ink-soft">
                    Good evening! I'm Sage. What symptoms would you like me to evaluate right now?
                  </div>
                </div>
                <div className="flex flex-row-reverse items-start gap-2.5">
                  <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-white/10 text-[10px] font-bold text-brand-200">YOU</span>
                  <div className="rounded-2xl rounded-br-sm bg-gradient-to-r from-brand-500 to-accent-500 px-3.5 py-3 text-xs font-medium text-[#04201d]">
                    Mild headache and slight fever since this morning.
                  </div>
                </div>
                <div className="flex items-start gap-2.5">
                  <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-gradient-to-br from-brand-400 to-accent-500 text-[#04201d]"><Bot className="h-4 w-4" /></span>
                  <div className="flex-1 space-y-3 rounded-2xl rounded-bl-sm border border-line bg-raised px-3.5 py-3 text-xs leading-relaxed text-ink-soft">
                    <p className="flex items-center gap-1 font-semibold text-brand-300">
                      <ShieldCheck className="h-3.5 w-3.5" /> Clinical breakdown
                    </p>
                    <p>Likely a viral response or mild dehydration. Rest, hydrate, and consider paracetamol.</p>
                    <div className="flex items-center justify-between rounded-xl border border-line bg-surface px-3 py-2">
                      <div>
                        <p className="text-xs font-semibold text-ink">Tylenol 500mg</p>
                        <p className="text-[10px] text-ink-muted">OTC · Acetaminophen</p>
                      </div>
                      <span className="text-xs font-semibold text-emerald-300">Safe</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* CTA */}
              <div className="border-t border-line p-4">
                <button
                  onClick={onOpenChat}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-brand-400 to-accent-500 py-3 text-xs font-semibold uppercase tracking-wider text-[#04201d] transition-transform hover:scale-[1.02] active:scale-[0.98]"
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
