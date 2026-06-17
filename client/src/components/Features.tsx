import React from 'react';
import {
  Stethoscope, MessageSquare, History, UserCheck, Pill, Sparkles,
  Cpu, Lock, Database, Globe, CheckCircle2, Layers,
} from 'lucide-react';
import { SectionShell, SectionHeading, Eyebrow, IconChip } from './ui';

interface FeaturesProps {
  onOpenChat: () => void;
  onChangeTab: (tab: string) => void;
}

export const Features: React.FC<FeaturesProps> = ({ onOpenChat, onChangeTab }) => {
  const core = [
    { title: 'Real-Time AI Chatbot', desc: 'Live messaging with typing indicators, persistent history, and instant evidence-backed suggestions.', icon: MessageSquare, tone: 'blue' as const, label: 'Try Chatbot', click: onOpenChat },
    { title: 'Symptom Assessment', desc: 'Natural-language triage that ranks possible conditions by severity with home self-care protocols.', icon: Stethoscope, tone: 'brand' as const, label: 'Open Triage', click: () => onChangeTab('symptom_checker') },
    { title: 'Medicine Suggestions', desc: 'OTC database with generic formulations, exact dosages, and interaction warnings.', icon: Pill, tone: 'emerald' as const, label: 'Browse Medicines', click: () => onChangeTab('medicines') },
    { title: 'Doctor Match', desc: 'Smart routing to verified board-certified specialists with real booking availability.', icon: UserCheck, tone: 'violet' as const, label: 'View Doctors', click: () => onChangeTab('doctors') },
    { title: 'Visit History', desc: 'Every diagnosis and care plan logged — searchable, shareable, exportable to Markdown.', icon: History, tone: 'rose' as const, label: 'Open Dashboard', click: () => onChangeTab('dashboard') },
    { title: 'Health Tips Coach', desc: 'Personalized daily micro-coaching on sleep, hydration, immunity, and recovery.', icon: Sparkles, tone: 'amber' as const, label: 'Explore Tips', click: () => onChangeTab('tips') },
  ];

  const weeks = [
    { num: 'W1', title: 'Setup & UI Design', items: ['MERN project layout', 'Git & GitHub workflow', 'Authentication UI', 'Live chat UI'] },
    { num: 'W2', title: 'Backend & Auth', items: ['JWT session architecture', 'User & chat APIs', 'History management', 'Form validations'] },
    { num: 'W3', title: 'Real-Time Engine', items: ['Socket.IO gateway', 'Bi-directional events', 'Typing indicators', 'Message persistence'] },
    { num: 'W4', title: 'AI Integration', items: ['Gemini / OpenAI connector', 'Clinical prompts', 'Doctor match logic', 'Health tips module'] },
    { num: 'W5', title: 'Testing & Rollout', items: ['Bug fixing & QA', 'API testing', 'Deployment', 'Report export'] },
  ];

  const stack = [
    { icon: Cpu, label: 'React 19 + TS', tone: 'text-brand-300' },
    { icon: Globe, label: 'Socket.IO Live', tone: 'text-accent-400' },
    { icon: Database, label: 'MongoDB', tone: 'text-violet-300' },
    { icon: Lock, label: 'JWT Encrypted', tone: 'text-emerald-300' },
  ];

  return (
    <SectionShell id="features" className="py-20 md:py-28">
      <SectionHeading
        eyebrow={<Eyebrow><Layers className="h-3.5 w-3.5" /> Complete Architecture</Eyebrow>}
        title="Six specialized healthcare modules, tightly unified."
        desc="Built to feel less like rigid hospital software and more like an exceptionally competent, compassionate medical assistant."
      />

      <div className="mt-14 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {core.map((f) => {
          const Icon = f.icon;
          return (
            <article
              key={f.title}
              className="group flex flex-col justify-between rounded-xl border border-line bg-raised/50 p-6 transition-all duration-fast hover:border-brand-400/40 hover:bg-raised"
            >
              <div>
                <IconChip tone={f.tone}><Icon className="h-5 w-5" /></IconChip>
                <h3 className="mt-5 text-lg font-semibold text-ink transition-colors group-hover:text-brand-200">{f.title}</h3>
                <p className="mt-2 text-md leading-relaxed text-ink-soft">{f.desc}</p>
              </div>
              <div className="mt-6 flex items-center justify-between border-t border-line pt-4">
                <button onClick={f.click} className="inline-flex items-center gap-1 text-xs font-semibold uppercase tracking-wider text-brand-300 transition-colors hover:text-brand-200">
                  {f.label} <span className="transition-transform group-hover:translate-x-0.5">→</span>
                </button>
                <span className="text-[10px] font-mono text-ink-muted">Live ready</span>
              </div>
            </article>
          );
        })}
      </div>

      {/* 5-week plan */}
      <div className="relative mt-24 overflow-hidden rounded-2xl border border-line bg-surface/70 p-8 sm:p-12">
        <div aria-hidden className="pointer-events-none absolute right-0 top-0 h-80 w-80 rounded-full bg-gradient-to-br from-brand-500/10 to-violet-400/10 blur-3xl" />
        <div className="relative max-w-2xl">
          <Eyebrow tone="violet"><Sparkles className="h-3.5 w-3.5" /> Internship Deliverables</Eyebrow>
          <h3 className="mt-4 text-2xl font-semibold tracking-tight text-ink sm:text-3xl">Built through a 5-week fullstack roadmap</h3>
          <p className="mt-2 text-md text-ink-soft">Demonstrating state management, AI prompt engineering, live web-sockets, and encrypted patient logging.</p>
        </div>

        <div className="relative mt-10 grid grid-cols-1 gap-3 md:grid-cols-5">
          {weeks.map((w) => (
            <div key={w.num} className="flex flex-col rounded-xl border border-line bg-raised/60 p-5 transition-colors hover:border-brand-400/40">
              <div className="mb-3 flex items-center justify-between">
                <span className="grid h-8 w-8 place-items-center rounded-lg bg-gradient-to-br from-brand-400 to-accent-500 text-xs font-bold text-[#04201d]">{w.num}</span>
                <CheckCircle2 className="h-4 w-4 text-emerald-400" />
              </div>
              <h4 className="text-sm font-semibold leading-snug text-ink">{w.title}</h4>
              <ul className="mt-3 space-y-1.5 border-t border-line pt-3">
                {w.items.map((it, i) => (
                  <li key={i} className="flex items-start gap-1.5 text-xs text-ink-soft">
                    <span className="text-brand-400">•</span><span>{it}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="relative mt-10 grid grid-cols-2 gap-4 border-t border-line pt-8 text-center sm:grid-cols-4">
          {stack.map((s) => {
            const Icon = s.icon;
            return (
              <div key={s.label} className="flex items-center justify-center gap-2 text-xs font-semibold text-ink-soft">
                <Icon className={`h-4 w-4 ${s.tone}`} /> {s.label}
              </div>
            );
          })}
        </div>
      </div>
    </SectionShell>
  );
};
