import React, { useState, useEffect } from 'react';
import { BookOpen, Clock, Stethoscope, X } from 'lucide-react';
import { HealthTip } from '../types';
import { getHealthTips, getHealthCategories } from '../services/api';
import { cn } from '../utils/cn';
import { SectionShell, Eyebrow, Button } from './ui';

export const HealthTipsTab: React.FC = () => {
  const [tip, setTip] = useState<HealthTip | null>(null);
  const [cat, setCat] = useState('All');
  const [cats, setCats] = useState<string[]>(['All']);
  const [tips, setTips] = useState<HealthTip[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    getHealthTips({ category: cat === 'All' ? undefined : cat }).then(({ data }) => {
      const mapped = data.map((t: any) => ({
        id: t._id,
        title: t.title,
        category: t.category,
        snippet: t.snippet,
        fullContent: t.fullContent,
        readTime: t.readTime,
        doctorRecommended: t.doctorRecommended,
      }));
      setTips(mapped);
    }).catch(() => setTips([])).finally(() => setLoading(false));
  }, [cat]);

  useEffect(() => {
    getHealthCategories().then(({ data }) => {
      setCats(data);
    }).catch(() => setCats(['All']));
  }, []);

  return (
    <SectionShell className="py-12 animate-fadeUp">
      <div className="mb-10 space-y-3 rounded-2xl border border-line bg-surface/70 p-8">
        <Eyebrow tone="violet">✨ Wellness Micro-Coaching</Eyebrow>
        <h2 className="text-3xl font-semibold tracking-tight text-ink sm:text-4xl">Health Tips Module</h2>
        <p className="max-w-2xl text-md leading-relaxed text-ink-soft">
          Evidence-aware micro-coaching to optimize immunity, regulate circadian recovery, and reduce inflammation before symptoms appear.
        </p>
      </div>

      {tip && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-base/70 p-4 backdrop-blur-md animate-fadeUp">
          <div className="w-full max-w-2xl space-y-6 rounded-2xl border border-line bg-surface p-6 shadow-2xl sm:p-10">
            <div className="flex items-start justify-between border-b border-line pb-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold uppercase tracking-wider text-amber-300">{tip.category}</span>
                  <span className="flex items-center gap-1 rounded-full bg-white/[0.06] px-2.5 py-0.5 text-xs text-ink-soft"><Clock className="h-3 w-3" /> {tip.readTime}</span>
                </div>
                <h3 className="mt-2 text-2xl font-semibold leading-snug tracking-tight text-ink sm:text-3xl">{tip.title}</h3>
              </div>
              <button onClick={() => setTip(null)} className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-white/5 text-ink-soft hover:bg-white/10 hover:text-ink"><X className="h-4 w-4" /></button>
            </div>
            <div className="space-y-4">
              <p className="rounded-xl border border-amber-500/25 bg-amber-500/10 p-4 text-sm italic text-amber-100/90">"{tip.snippet}"</p>
              <p className="whitespace-pre-line text-md leading-relaxed text-ink-soft">{tip.fullContent}</p>
            </div>
            <div className="flex flex-col items-center justify-between gap-4 rounded-xl border border-line bg-raised p-4 sm:flex-row">
              <div className="flex items-center gap-2">
                <span className="grid h-8 w-8 place-items-center rounded-full bg-gradient-to-br from-brand-400 to-accent-500 text-[#04201d]"><Stethoscope className="h-4 w-4" /></span>
                <div>
                  <p className="text-xs leading-none text-ink-muted">Verified by</p>
                  <p className="mt-0.5 text-xs font-semibold text-ink">{tip.doctorRecommended || 'Medisage Advisory'}</p>
                </div>
              </div>
              <Button variant="secondary" onClick={() => setTip(null)} className="w-full sm:w-auto">Close article</Button>
            </div>
          </div>
        </div>
      )}

      <div className="thin-scroll mb-10 flex items-center gap-2 overflow-x-auto pb-2">
        {cats.map((c) => (
          <button key={c} onClick={() => setCat(c)}
            className={cn('shrink-0 rounded-xl border px-5 py-2.5 text-xs font-semibold transition-all',
              cat === c ? 'border-amber-500/40 bg-amber-500/15 text-amber-300' : 'border-line bg-white/[0.02] text-ink-soft hover:bg-white/[0.05]')}
            disabled={loading}>
            {c}
          </button>
        ))}
      </div>

      {loading && <p className="text-sm text-ink-muted">Loading tips...</p>}
      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
        {tips.map((t) => (
          <div key={t.id} className="group flex flex-col justify-between rounded-xl border border-line bg-raised/50 p-7 transition-all duration-fast hover:border-amber-500/40 hover:bg-raised">
            <div>
              <div className="mb-4 flex items-center justify-between">
                <span className="rounded-full border border-amber-500/25 bg-amber-500/10 px-3 py-1 text-xs font-semibold uppercase text-amber-300">{t.category}</span>
                <span className="flex items-center gap-1 text-xs text-ink-muted"><Clock className="h-3 w-3" /> {t.readTime}</span>
              </div>
              <h3 className="mb-3 text-xl font-semibold leading-snug text-ink transition-colors group-hover:text-amber-200">{t.title}</h3>
              <p className="mb-6 text-md leading-relaxed text-ink-soft">{t.snippet}</p>
            </div>
            <div className="flex items-center justify-between border-t border-line pt-5">
              <span className="flex items-center gap-2 text-xs text-ink-soft">🩺 {t.doctorRecommended}</span>
              <Button size="sm" onClick={() => setTip(t)}><BookOpen className="h-3.5 w-3.5" /> Read</Button>
            </div>
          </div>
        ))}
      </div>
    </SectionShell>
  );
};