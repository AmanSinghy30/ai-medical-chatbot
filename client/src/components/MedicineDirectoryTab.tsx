import React, { useState, useEffect } from 'react';
import { Pill, Search, ShieldAlert, CheckCircle2, ExternalLink, Sparkles, X } from 'lucide-react';
import { Medicine } from '../types';
import { getMedicines } from '../services/api';
import { cn } from '../utils/cn';
import { SectionShell, Eyebrow, Button } from './ui';

interface Props {
  onSelectMedicine?: (med: Medicine) => void;
}

export const MedicineDirectoryTab: React.FC<Props> = ({ onSelectMedicine }) => {
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'all' | 'otc' | 'rx'>('all');
  const [detail, setDetail] = useState<Medicine | null>(null);
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    getMedicines().then(({ data }) => {
      const mapped = data.map((m: any) => ({
        id: m._id,
        name: m.name,
        genericName: m.genericName,
        type: m.type,
        category: m.category,
        recommendedDosage: m.recommendedDosage,
        sideEffects: m.sideEffects || [],
        precautions: m.precautions,
        isOTC: m.isOTC,
        price: m.price,
      }));
      setMedicines(mapped);
    }).catch(() => setMedicines([])).finally(() => setLoading(false));
  }, []);

  const meds = medicines.filter((m) =>
    (m.name.toLowerCase().includes(search.toLowerCase()) || m.genericName.toLowerCase().includes(search.toLowerCase()) || m.category.toLowerCase().includes(search.toLowerCase())) &&
    (filter === 'all' || (filter === 'otc' ? m.isOTC : !m.isOTC))
  );

  return (
    <SectionShell className="py-12 animate-fadeUp">
      <div className="mb-10 space-y-3 rounded-2xl border border-line bg-surface/70 p-8">
        <Eyebrow><Pill className="h-3.5 w-3.5" /> Clinical Formulation Directory</Eyebrow>
        <h2 className="text-3xl font-semibold tracking-tight text-ink sm:text-4xl">Medicine Suggestion Module</h2>
        <p className="max-w-2xl text-md leading-relaxed text-ink-soft">
          Search verified OTC remedies and prescription formulations — with exact dosages, side-effect monitoring, and interaction reports.
        </p>
      </div>

      {detail && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-base/70 p-4 backdrop-blur-md animate-fadeUp">
          <div className="w-full max-w-lg space-y-6 rounded-2xl border border-line bg-surface p-6 shadow-2xl sm:p-8">
            <div className="flex items-start justify-between border-b border-line pb-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold uppercase tracking-wider text-emerald-300">{detail.category}</span>
                  <span className={cn('rounded px-2 py-0.5 text-[10px] font-bold', detail.isOTC ? 'bg-emerald-500/15 text-emerald-300' : 'bg-amber-500/15 text-amber-300')}>
                    {detail.isOTC ? 'OTC' : 'Rx Required'}
                  </span>
                </div>
                <h3 className="mt-1 text-2xl font-semibold tracking-tight text-ink">{detail.name}</h3>
                <p className="text-xs font-semibold text-ink-muted">{detail.genericName}</p>
              </div>
              <button onClick={() => setDetail(null)} className="grid h-8 w-8 place-items-center rounded-full bg-white/5 text-ink-soft hover:bg-white/10 hover:text-ink"><X className="h-4 w-4" /></button>
            </div>
            <div className="space-y-4 text-xs">
              <div className="rounded-xl border border-emerald-500/25 bg-emerald-500/10 p-4">
                <h4 className="mb-1 flex items-center gap-1.5 text-sm font-semibold text-emerald-200"><CheckCircle2 className="h-4 w-4" /> Recommended Dosage</h4>
                <p className="leading-relaxed text-emerald-100/90">{detail.recommendedDosage}</p>
              </div>
              <div className="rounded-xl border border-amber-500/25 bg-amber-500/10 p-4">
                <h4 className="mb-1 flex items-center gap-1.5 text-sm font-semibold text-amber-200"><ShieldAlert className="h-4 w-4" /> Precautions</h4>
                <p className="leading-relaxed text-amber-100/90">{detail.precautions}</p>
              </div>
              <div>
                <h4 className="mb-2 text-xs font-semibold uppercase tracking-wider text-ink">Side effects</h4>
                <ul className="space-y-1.5">
                  {detail.sideEffects.map((e, i) => <li key={i} className="flex items-center gap-2 text-ink-soft"><span className="h-1.5 w-1.5 rounded-full bg-ink-muted" /> {e}</li>)}
                </ul>
              </div>
            </div>
            <div className="flex items-center justify-between border-t border-line pt-4">
              <div><p className="text-xs text-ink-muted">Est. price</p><p className="text-lg font-semibold text-ink">{detail.price}</p></div>
              <Button onClick={() => { onSelectMedicine?.(detail); setDetail(null); }}><Sparkles className="h-4 w-4" /> Add to dashboard</Button>
            </div>
          </div>
        </div>
      )}

      <div className="mb-10 flex flex-col items-center justify-between gap-4 rounded-2xl border border-line bg-raised/40 p-4 md:flex-row">
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3.5 top-3 h-4 w-4 text-ink-muted" />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search medicine or substance..."
            className="w-full rounded-lg border border-line bg-base/60 py-2.5 pl-10 pr-4 text-xs font-medium text-ink placeholder:text-ink-muted focus:border-brand-400 focus:outline-none" />
        </div>
        <div className="flex w-full gap-2 md:w-auto">
          {[['all', 'All'], ['otc', 'OTC'], ['rx', 'Prescription']].map(([id, label]) => (
            <button key={id} onClick={() => setFilter(id as any)}
              className={cn('flex-1 rounded-lg border px-4 py-2 text-xs font-semibold transition-all md:flex-none',
                filter === id ? 'border-brand-400/50 bg-brand-500/15 text-brand-200' : 'border-line bg-white/[0.02] text-ink-soft hover:bg-white/[0.05]')}
              disabled={loading}>
              {label}
            </button>
          ))}
        </div>
      </div>

      {loading && <p className="text-sm text-ink-muted">Loading medicines...</p>}
      <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
        {meds.map((m) => (
          <div key={m.id} className="group flex flex-col justify-between rounded-xl border border-line bg-raised/50 p-6 transition-all duration-fast hover:border-emerald-500/40 hover:bg-raised">
            <div>
              <div className="mb-3 flex items-start justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="grid h-10 w-10 place-items-center rounded-xl border border-emerald-500/20 bg-emerald-500/10 text-emerald-300"><Pill className="h-5 w-5" /></span>
                  <div>
                    <h3 className="text-base font-semibold text-ink transition-colors group-hover:text-emerald-300">{m.name}</h3>
                    <p className="text-xs text-ink-muted">{m.genericName}</p>
                  </div>
                </div>
                <span className="shrink-0 text-xs font-semibold text-ink">{m.price}</span>
              </div>
              <div className="mb-4 flex items-center gap-2">
                <span className="rounded bg-white/[0.06] px-2 py-0.5 text-[10px] font-bold uppercase text-ink-soft">{m.type}</span>
                <span className={cn('rounded px-2 py-0.5 text-[10px] font-bold uppercase', m.isOTC ? 'bg-emerald-500/15 text-emerald-300' : 'bg-amber-500/15 text-amber-300')}>
                  {m.isOTC ? 'OTC' : 'Rx Only'}
                </span>
              </div>
              <p className="mb-6 line-clamp-3 rounded-xl border border-line bg-white/[0.02] p-3 text-xs leading-relaxed text-ink-soft">
                <span className="font-semibold text-ink">Precautions:</span> {m.precautions}
              </p>
            </div>
            <div className="flex items-center justify-between border-t border-line pt-4">
              <span className="truncate text-xs font-semibold text-emerald-300">{m.category}</span>
              <button onClick={() => setDetail(m)} className="inline-flex items-center gap-1 rounded-lg border border-line bg-white/[0.03] px-3 py-2 text-xs font-semibold text-ink transition-colors hover:border-emerald-500/40 hover:bg-emerald-500/10">
                Full guide <ExternalLink className="h-3 w-3" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </SectionShell>
  );
};