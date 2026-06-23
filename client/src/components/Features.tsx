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
    { title: 'Visit History', desc: 'Every diagnosis and care plan logged — searchable, shareable, exportable to clinical summaries.', icon: History, tone: 'rose' as const, label: 'Open Dashboard', click: () => onChangeTab('dashboard') },
    { title: 'Health Tips Coach', desc: 'Personalized daily micro-coaching on sleep, hydration, immunity, and recovery.', icon: Sparkles, tone: 'amber' as const, label: 'Explore Tips', click: () => onChangeTab('tips') },
  ];

  const weeks = [
    { num: '01', title: 'Core UI Framework', items: ['Clinical design system', 'Responsive layouts', 'Secure authentication', 'Live chat interface'] },
    { num: '02', title: 'Backend Services', items: ['JWT session architecture', 'User APIs', 'History management', 'Form validations'] },
    { num: '03', title: 'Real-Time Engine', items: ['Socket.IO gateway', 'Bi-directional events', 'Typing indicators', 'Message persistence'] },
    { num: '04', title: 'AI Integration', items: ['Language model routing', 'Clinical prompts', 'Doctor match logic', 'Health tips module'] },
    { num: '05', title: 'Security & Export', items: ['HIPAA-ready mockups', 'API hardening', 'Data encryption', 'Report export generation'] },
  ];

  const stack = [
    { icon: Cpu, label: 'React 19 + TS', tone: 'text-brand-600' },
    { icon: Globe, label: 'Socket.IO Live', tone: 'text-blue-600' },
    { icon: Database, label: 'MongoDB', tone: 'text-violet-600' },
    { icon: Lock, label: 'JWT Encrypted', tone: 'text-emerald-600' },
  ];

  return (
    <SectionShell id="features" className="py-20 md:py-28">
      <SectionHeading
        eyebrow={<Eyebrow><Layers className="h-3.5 w-3.5" /> Complete Architecture</Eyebrow>}
        title="Six specialized healthcare modules, tightly unified."
        desc="Built to feel less like rigid hospital software and more like an exceptionally competent, compassionate medical assistant."
      />

      <div className="mt-14 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {core.map((f) => {
          const Icon = f.icon;
          return (
            <article
              key={f.title}
              className="group flex flex-col justify-between rounded-xl border border-slate-200 bg-white p-6 transition-all duration-fast hover:border-slate-300 hover:shadow-md"
            >
              <div>
                <IconChip tone={f.tone}><Icon className="h-5 w-5" /></IconChip>
                <h3 className="mt-5 text-lg font-bold text-slate-900 transition-colors group-hover:text-brand-600">{f.title}</h3>
                <p className="mt-2 text-md leading-relaxed text-slate-600">{f.desc}</p>
              </div>
              <div className="mt-6 flex items-center justify-between border-t border-slate-100 pt-4">
                <button onClick={f.click} className="inline-flex items-center gap-1 text-xs font-bold uppercase tracking-wider text-brand-600 transition-colors hover:text-brand-700">
                  {f.label} <span className="transition-transform group-hover:translate-x-0.5">→</span>
                </button>
                <span className="text-[10px] font-mono font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded">Live ready</span>
              </div>
            </article>
          );
        })}
      </div>

      {/* Platform Architecture */}
      <div className="relative mt-24 overflow-hidden rounded-2xl border border-slate-200 bg-slate-50 p-8 sm:p-12 shadow-sm">
        <div className="relative max-w-2xl">
          <Eyebrow tone="violet"><Database className="h-3.5 w-3.5" /> Platform Architecture</Eyebrow>
          <h3 className="mt-4 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">Enterprise-grade fullstack infrastructure</h3>
          <p className="mt-2 text-md text-slate-600">Demonstrating advanced state management, AI prompt engineering, live web-sockets, and secure patient logging.</p>
        </div>

        <div className="relative mt-10 grid grid-cols-1 gap-4 md:grid-cols-5">
          {weeks.map((w) => (
            <div key={w.num} className="flex flex-col rounded-xl border border-slate-200 bg-white p-5 transition-colors hover:border-brand-200 hover:shadow-sm">
              <div className="mb-3 flex items-center justify-between">
                <span className="grid h-8 w-8 place-items-center rounded-lg bg-brand-100 text-xs font-bold text-brand-700">{w.num}</span>
                <CheckCircle2 className="h-4 w-4 text-emerald-500" />
              </div>
              <h4 className="text-sm font-bold leading-snug text-slate-900">{w.title}</h4>
              <ul className="mt-3 space-y-1.5 border-t border-slate-100 pt-3">
                {w.items.map((it, i) => (
                  <li key={i} className="flex items-start gap-1.5 text-xs text-slate-600">
                    <span className="text-brand-500 font-bold">•</span><span>{it}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="relative mt-10 grid grid-cols-2 gap-4 border-t border-slate-200 pt-8 text-center sm:grid-cols-4">
          {stack.map((s) => {
            const Icon = s.icon;
            return (
              <div key={s.label} className="flex items-center justify-center gap-2 text-xs font-bold text-slate-600">
                <Icon className={`h-4 w-4 ${s.tone}`} /> {s.label}
              </div>
            );
          })}
        </div>
      </div>
    </SectionShell>
  );
};
