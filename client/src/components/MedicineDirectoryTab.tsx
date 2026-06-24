import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Pill, Search, ShieldAlert, CheckCircle2, ExternalLink, Sparkles, X, ChevronLeft, ChevronRight, Filter } from 'lucide-react';
import { Medicine } from '../types';
import { getMedicines, createMedicine } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { cn } from '../utils/cn';
import { SectionShell, Eyebrow, Button } from './ui';

interface Props {
  onSelectMedicine?: (med: Medicine) => void;
}

export const MedicineDirectoryTab: React.FC<Props> = ({ onSelectMedicine }) => {
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'all' | 'otc' | 'rx'>('all');
  const [categoryFilter, setCategoryFilter] = useState('All Categories');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  const [detail, setDetail] = useState<Medicine | null>(null);
  const { user } = useAuth();
  const isDoctor = user?.role === 'doctor';
  const [showAddForm, setShowAddForm] = useState(false);
  const [newMedicine, setNewMedicine] = useState({ name: '', genericName: '', type: 'Tablet', category: '', recommendedDosage: '', sideEffects: '', precautions: '', isOTC: true, price: '' });
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

  useEffect(() => {
    setCurrentPage(1);
  }, [search, filter, categoryFilter]);

  const categories = ['All Categories', ...Array.from(new Set(medicines.map(m => m.category)))];

  const meds = medicines.filter((m) =>
    (m.name.toLowerCase().includes(search.toLowerCase()) || m.genericName.toLowerCase().includes(search.toLowerCase()) || m.category.toLowerCase().includes(search.toLowerCase())) &&
    (filter === 'all' || (filter === 'otc' ? m.isOTC : !m.isOTC)) &&
    (categoryFilter === 'All Categories' || m.category === categoryFilter)
  );

  const totalPages = Math.ceil(meds.length / itemsPerPage);
  const paginated = meds.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const handleCreateMedicine = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const { data } = await createMedicine({ ...newMedicine, sideEffects: newMedicine.sideEffects.split(',').map(s => s.trim()) });
      setMedicines([data, ...medicines]);
      setShowAddForm(false);
    } catch (err) {
      console.error('Failed to create medicine', err);
    }
  };

  return (
    <SectionShell className="py-12 animate-fadeUp">
      <div className="mb-10 space-y-3 rounded-2xl border border-line bg-surface/70 p-8">
        <Eyebrow><Pill className="h-3.5 w-3.5" /> Clinical Medicine Directory</Eyebrow>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <h2 className="text-3xl font-semibold tracking-tight text-ink sm:text-4xl">Medicine Suggestion Module</h2>
          {isDoctor && (
            <Button onClick={() => setShowAddForm(true)}>+ Add Medicine</Button>
          )}
        </div>
        <p className="max-w-2xl text-md leading-relaxed text-ink-soft">
          Search verified OTC remedies and prescription medicines — with exact dosages, side-effect monitoring, and interaction reports.
        </p>
      </div>

      {showAddForm && createPortal(
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-base/70 p-4 backdrop-blur-md animate-fadeUp">
          <div className="w-full max-w-lg space-y-6 rounded-2xl border border-line bg-surface p-6 shadow-2xl sm:p-8 max-h-[90vh] overflow-y-auto thin-scroll">
            <div className="flex items-center justify-between border-b border-line pb-4">
              <h3 className="text-xl font-semibold text-ink">Add New Medicine</h3>
              <button onClick={() => setShowAddForm(false)} className="grid h-8 w-8 place-items-center rounded-full bg-slate-100 text-ink-soft hover:bg-slate-200 hover:text-ink"><X className="h-4 w-4" /></button>
            </div>
            <form onSubmit={handleCreateMedicine} className="space-y-4 text-sm">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <input required placeholder="Name (e.g. Paracetamol 500mg)" className="w-full rounded-lg border border-line bg-slate-50 p-2.5 text-ink focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500" value={newMedicine.name} onChange={e => setNewMedicine({ ...newMedicine, name: e.target.value })} />
                <input required placeholder="Generic Name" className="w-full rounded-lg border border-line bg-slate-50 p-2.5 text-ink focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500" value={newMedicine.genericName} onChange={e => setNewMedicine({ ...newMedicine, genericName: e.target.value })} />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <input required placeholder="Category (e.g. Analgesic)" className="w-full rounded-lg border border-line bg-slate-50 p-2.5 text-ink focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500" value={newMedicine.category} onChange={e => setNewMedicine({ ...newMedicine, category: e.target.value })} />
                <input required placeholder="Type (e.g. Tablet, Syrup)" className="w-full rounded-lg border border-line bg-slate-50 p-2.5 text-ink focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500" value={newMedicine.type} onChange={e => setNewMedicine({ ...newMedicine, type: e.target.value })} />
              </div>
              <input required placeholder="Dosage (e.g. 1 tablet every 6 hrs)" className="w-full rounded-lg border border-line bg-slate-50 p-2.5 text-ink focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500" value={newMedicine.recommendedDosage} onChange={e => setNewMedicine({ ...newMedicine, recommendedDosage: e.target.value })} />
              <input required placeholder="Side effects (comma separated)" className="w-full rounded-lg border border-line bg-slate-50 p-2.5 text-ink focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500" value={newMedicine.sideEffects} onChange={e => setNewMedicine({ ...newMedicine, sideEffects: e.target.value })} />
              <input required placeholder="Precautions" className="w-full rounded-lg border border-line bg-slate-50 p-2.5 text-ink focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500" value={newMedicine.precautions} onChange={e => setNewMedicine({ ...newMedicine, precautions: e.target.value })} />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <label className="flex items-center gap-2 text-ink-soft"><input type="checkbox" checked={newMedicine.isOTC} onChange={e => setNewMedicine({ ...newMedicine, isOTC: e.target.checked })} /> Is OTC</label>
                <input required placeholder="Est. Price (e.g. $5.00)" className="w-full rounded-lg border border-line bg-slate-50 p-2.5 text-ink focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500" value={newMedicine.price} onChange={e => setNewMedicine({ ...newMedicine, price: e.target.value })} />
              </div>
              <Button type="submit" className="w-full">Save Medicine</Button>
            </form>
          </div>
        </div>,
        document.body
      )}

      {detail && createPortal(
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-base/70 p-4 backdrop-blur-md animate-fadeUp">
          <div className="w-full max-w-lg space-y-6 rounded-2xl border border-line bg-surface p-6 shadow-2xl sm:p-8">
            <div className="flex items-start justify-between border-b border-line pb-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold uppercase tracking-wider text-emerald-600">{detail.category}</span>
                  <span className={cn('rounded px-2 py-0.5 text-[10px] font-bold', detail.isOTC ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700')}>
                    {detail.isOTC ? 'OTC' : 'Rx Required'}
                  </span>
                </div>
                <h3 className="mt-1 text-2xl font-semibold tracking-tight text-ink">{detail.name}</h3>
                <p className="text-xs font-semibold text-ink-muted">{detail.genericName}</p>
              </div>
              <button onClick={() => setDetail(null)} className="grid h-8 w-8 place-items-center rounded-full bg-slate-100 text-ink-soft hover:bg-slate-200 hover:text-ink"><X className="h-4 w-4" /></button>
            </div>
            <div className="space-y-4 text-xs">
              <div className="rounded-xl border border-emerald-500/25 bg-emerald-50 p-4">
                <h4 className="mb-1 flex items-center gap-1.5 text-sm font-semibold text-emerald-800"><CheckCircle2 className="h-4 w-4" /> Recommended Dosage</h4>
                <p className="leading-relaxed text-emerald-700">{detail.recommendedDosage}</p>
              </div>
              <div className="rounded-xl border border-amber-500/25 bg-amber-50 p-4">
                <h4 className="mb-1 flex items-center gap-1.5 text-sm font-semibold text-amber-800"><ShieldAlert className="h-4 w-4" /> Precautions</h4>
                <p className="leading-relaxed text-amber-700">{detail.precautions}</p>
              </div>
              <div>
                <h4 className="mb-2 text-xs font-semibold uppercase tracking-wider text-ink">Side effects</h4>
                <ul className="space-y-1.5">
                  {detail.sideEffects.map((e, i) => <li key={i} className="flex items-center gap-2 text-ink-soft"><span className="h-1.5 w-1.5 rounded-full bg-brand-500" /> {e}</li>)}
                </ul>
              </div>
            </div>
            <div className="flex items-center justify-between border-t border-line pt-4">
              <div><p className="text-xs text-ink-muted">Est. price</p><p className="text-lg font-semibold text-ink">{detail.price}</p></div>
              <Button onClick={() => { onSelectMedicine?.(detail); setDetail(null); }}><Sparkles className="h-4 w-4" /> Add to dashboard</Button>
            </div>
          </div>
        </div>,
        document.body
      )}

      <div className="mb-10 flex flex-col gap-4 rounded-2xl border border-line bg-surface p-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="relative w-full lg:w-80 shrink-0">
          <Search className="absolute left-3.5 top-3 h-4 w-4 text-ink-muted" />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search medicine or substance..."
            className="w-full rounded-lg border border-line bg-slate-50 py-2.5 pl-10 pr-4 text-sm font-medium text-ink placeholder:text-ink-muted focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 transition-all" />
        </div>

        <div className="flex w-full flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center pb-1 lg:w-auto lg:pb-0">
          <div className="flex items-center gap-2 shrink-0">
            <Filter className="h-4 w-4 text-ink-muted" />
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="rounded-lg border border-line bg-slate-50 px-3 py-2 text-sm font-medium text-ink focus:border-brand-500 focus:outline-none"
            >
              {categories.map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
          <div className="flex w-full flex-wrap gap-1.5 md:w-auto">
            {[['all', 'All'], ['otc', 'OTC'], ['rx', 'Prescription']].map(([id, label]) => (
              <button key={id} onClick={() => setFilter(id as any)}
                className={cn('flex-1 rounded-lg border px-4 py-2 text-sm font-medium transition-all md:flex-none',
                  filter === id ? 'border-brand-500 bg-brand-50 text-brand-700' : 'border-line bg-surface text-ink-soft hover:bg-slate-50 hover:text-ink')}
                disabled={loading}>
                {label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {loading ? (
        <div className="py-12 text-center text-ink-muted">Loading medicines...</div>
      ) : paginated.length === 0 ? (
        <div className="py-12 text-center text-ink-muted">No medicines found matching your criteria.</div>
      ) : (
        <>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {paginated.map((m) => (
              <div key={m.id} className="group flex flex-col justify-between rounded-xl border border-line bg-surface p-6 transition-all duration-300 hover:border-emerald-500/50 hover:shadow-md">
                <div>
                  <div className="mb-3 flex items-start justify-between gap-2">
                    <div className="flex items-center gap-3">
                      <span className="grid h-12 w-12 shrink-0 place-items-center rounded-xl border border-emerald-200 bg-emerald-50 text-emerald-600"><Pill className="h-6 w-6" /></span>
                      <div>
                        <h3 className="text-base font-semibold text-ink">{m.name}</h3>
                        <p className="text-xs text-ink-muted">{m.genericName}</p>
                      </div>
                    </div>
                    <span className="shrink-0 text-sm font-bold text-ink">{m.price}</span>
                  </div>
                  <div className="mb-4 flex items-center gap-2">
                    <span className="rounded bg-slate-100 px-2 py-0.5 text-[10px] font-bold uppercase text-slate-600">{m.type}</span>
                    <span className={cn('rounded px-2 py-0.5 text-[10px] font-bold uppercase', m.isOTC ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700')}>
                      {m.isOTC ? 'OTC' : 'Rx Only'}
                    </span>
                  </div>
                  <p className="mb-6 line-clamp-3 rounded-lg bg-slate-50 p-3 text-sm leading-relaxed text-ink-soft">
                    <span className="font-semibold text-ink">Precautions:</span> {m.precautions}
                  </p>
                </div>
                <div className="flex items-center justify-between border-t border-line pt-4">
                  <span className="truncate text-sm font-medium text-emerald-600">{m.category}</span>
                  <button onClick={() => setDetail(m)} className="inline-flex items-center gap-1.5 rounded-lg border border-line bg-surface px-3 py-2 text-sm font-medium text-ink transition-colors hover:border-emerald-500 hover:bg-emerald-50 hover:text-emerald-700">
                    Full guide <ExternalLink className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {totalPages > 0 && (
            <div className="mt-8 flex items-center justify-center gap-2">
              <button
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="grid h-10 w-10 place-items-center rounded-lg border border-line bg-surface text-ink hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <span className="px-4 text-sm font-medium text-ink-soft">
                Page {currentPage} of {totalPages}
              </span>
              <button
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="grid h-10 w-10 place-items-center rounded-lg border border-line bg-surface text-ink hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </div>
          )}
        </>
      )}
    </SectionShell>
  );
};