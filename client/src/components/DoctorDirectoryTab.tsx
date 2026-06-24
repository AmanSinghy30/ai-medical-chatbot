import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Star, MapPin, Building, Search, Filter, Calendar, Clock, Check, X, ChevronLeft, ChevronRight } from 'lucide-react';
import { Doctor } from '../types';
import { getDoctors, getSpecialties } from '../services/api';
import { cn } from '../utils/cn';
import { SectionShell, Eyebrow, Button } from './ui';

interface Props {
  onSelectDoctor: (doc: Doctor) => void;
  selectedDoctor?: Doctor | null;
  onClearSelectedDoctor?: () => void;
}

export const DoctorDirectoryTab: React.FC<Props> = ({ onSelectDoctor, selectedDoctor, onClearSelectedDoctor }) => {
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('All Specialties');
  const [minRating, setMinRating] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;
  
  const [booked, setBooked] = useState(false);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [specialties, setSpecialties] = useState<string[]>(['All Specialties']);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    getDoctors().then(({ data }) => {
      const mapped = data.map((d: any) => ({
        id: d._id,
        name: d.name,
        specialty: d.specialty,
        experience: d.experience,
        rating: d.rating,
        reviewsCount: d.reviewsCount,
        hospital: d.hospital,
        location: d.location,
        consultationFee: d.consultationFee,
        availableNext: d.availableNext,
        image: d.image,
        bio: d.bio,
      }));
      setDoctors(mapped);
    }).catch(() => setDoctors([])).finally(() => setLoading(false));

    getSpecialties().then(({ data }) => {
      setSpecialties(data);
    }).catch(() => setSpecialties(['All Specialties']));
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [search, filter, minRating]);

  const filtered = doctors.filter((d) =>
    (d.name.toLowerCase().includes(search.toLowerCase()) || d.hospital.toLowerCase().includes(search.toLowerCase())) &&
    (filter === 'All Specialties' || d.specialty === filter) &&
    (d.rating >= minRating)
  );

  const totalPages = Math.ceil(filtered.length / itemsPerPage);
  const paginated = filtered.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const book = (e: React.FormEvent) => {
    e.preventDefault();
    setBooked(true);
    setTimeout(() => { setBooked(false); onClearSelectedDoctor?.(); }, 2400);
  };

  return (
    <SectionShell className="py-12 animate-fadeUp">
      <div className="mb-10 space-y-3 rounded-2xl border border-line bg-surface/70 p-8">
        <Eyebrow tone="violet">🩺 Doctor Recommendation Network</Eyebrow>
        <h2 className="text-3xl font-semibold tracking-tight text-ink sm:text-4xl">Verified Specialist Matching</h2>
        <p className="max-w-2xl text-md leading-relaxed text-ink-soft">
          Filter our network of board-certified experts. Every physician supports real-time post-triage electronic booking.
        </p>
      </div>

      {selectedDoctor && createPortal(
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-base/70 p-4 backdrop-blur-md animate-fadeUp">
          <div className="w-full max-w-lg space-y-6 rounded-2xl border border-line bg-surface p-6 shadow-2xl sm:p-8">
            <div className="flex items-start justify-between border-b border-line pb-4">
              <div>
                <Eyebrow tone="blue">Live Consultation</Eyebrow>
                <h3 className="mt-2 text-2xl font-semibold tracking-tight text-ink">Book Encounter</h3>
              </div>
              <button onClick={onClearSelectedDoctor} className="grid h-8 w-8 place-items-center rounded-full bg-slate-100 text-ink-soft hover:bg-slate-200 hover:text-ink transition-colors"><X className="h-4 w-4" /></button>
            </div>
            <div className="flex items-center gap-4 rounded-xl border border-line bg-surface p-4">
              <img src={selectedDoctor.image} alt={selectedDoctor.name} className="h-16 w-16 rounded-xl object-cover" />
              <div>
                <h4 className="text-base font-semibold text-ink">{selectedDoctor.name}</h4>
                <p className="text-xs font-medium text-brand-600">{selectedDoctor.specialty}</p>
                <p className="mt-1 flex items-center gap-1 text-xs text-ink-muted"><Building className="h-3.5 w-3.5" /> {selectedDoctor.hospital}</p>
              </div>
            </div>
            {booked ? (
              <div className="space-y-2 rounded-xl border border-emerald-500/30 bg-emerald-50 p-6 text-center">
                <div className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-emerald-500 text-white"><Check className="h-6 w-6" /></div>
                <h4 className="text-lg font-semibold text-emerald-800">Appointment Confirmed!</h4>
                <p className="text-sm text-emerald-700">A secure calendar invite was added to your patient portal.</p>
              </div>
            ) : (
              <form onSubmit={book} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {[[Calendar, 'Date', selectedDoctor.availableNext.split(' at ')[0] || 'Tomorrow'], [Clock, 'Time', selectedDoctor.availableNext.split(' at ')[1] || '3:30 PM']].map(([Icon, label, val]) => {
                    const I = Icon as React.ComponentType<{ className?: string }>;
                    return (
                      <div key={label as string} className="space-y-1">
                        <label className="flex items-center gap-1 text-xs font-semibold uppercase tracking-wider text-ink-soft"><I className="h-3.5 w-3.5 text-brand-500" /> {label as string}</label>
                        <input readOnly value={val as string} className="w-full rounded-lg border border-line bg-slate-50 px-3 py-2.5 text-sm font-semibold text-ink" />
                      </div>
                    );
                  })}
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold uppercase tracking-wider text-ink-soft">Reason for consult</label>
                  <textarea rows={2} placeholder="Mention your signs or AI triage result..." className="w-full rounded-lg border border-line bg-slate-50 p-3 text-sm text-ink placeholder:text-ink-muted focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 transition-all" />
                </div>
                <div className="flex items-center justify-between border-t border-line pt-4">
                  <div>
                    <p className="text-xs text-ink-muted">Consultation fee</p>
                    <p className="text-lg font-semibold text-ink">${selectedDoctor.consultationFee}.00</p>
                  </div>
                  <Button type="submit" size="lg">Confirm Booking</Button>
                </div>
              </form>
            )}
          </div>
        </div>,
        document.body
      )}

      <div className="mb-10 flex flex-col gap-4 rounded-2xl border border-line bg-surface p-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="relative w-full lg:w-80 shrink-0">
          <Search className="absolute left-3.5 top-3 h-4 w-4 text-ink-muted" />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search doctor or hospital..."
            className="w-full rounded-lg border border-line bg-slate-50 py-2.5 pl-10 pr-4 text-sm font-medium text-ink placeholder:text-ink-muted focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 transition-all" />
        </div>
        <div className="flex w-full flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center pb-1 lg:w-auto lg:pb-0">
          <div className="flex flex-col sm:flex-row items-center gap-2 w-full sm:w-auto">
             <Filter className="h-4 w-4 shrink-0 text-ink-muted hidden sm:block" />
             <select 
                value={filter} 
                onChange={(e) => setFilter(e.target.value)}
                className="w-full sm:w-auto rounded-lg border border-line bg-slate-50 px-3 py-2 text-sm font-medium text-ink focus:border-brand-500 focus:outline-none"
             >
                {specialties.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
             </select>
             
             <select 
                value={minRating} 
                onChange={(e) => setMinRating(Number(e.target.value))}
                className="w-full sm:w-auto rounded-lg border border-line bg-slate-50 px-3 py-2 text-sm font-medium text-ink focus:border-brand-500 focus:outline-none"
             >
                <option value={0}>Any Rating</option>
                <option value={4}>4.0+ Stars</option>
                <option value={4.5}>4.5+ Stars</option>
                <option value={4.8}>4.8+ Stars</option>
             </select>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="py-12 text-center text-ink-muted">Loading doctors...</div>
      ) : paginated.length === 0 ? (
        <div className="py-12 text-center text-ink-muted">No doctors found matching your criteria.</div>
      ) : (
        <>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {paginated.map((doc) => (
              <div key={doc.id} className="group flex flex-col justify-between rounded-xl border border-line bg-surface p-6 transition-all duration-300 hover:border-brand-500/50 hover:shadow-md">
                <div>
                  <div className="mb-4 flex items-start gap-4">
                    <img src={doc.image} alt={doc.name} className="h-20 w-20 rounded-xl object-cover" />
                    <div>
                      <span className="mb-2 inline-flex items-center gap-1 rounded-full bg-amber-50 px-2 py-0.5 text-xs font-semibold text-amber-700">
                        <Star className="h-3 w-3 fill-amber-400 text-amber-500" /> {doc.rating} <span className="text-amber-600/70 font-medium">({doc.reviewsCount})</span>
                      </span>
                      <h3 className="text-base font-semibold text-ink">{doc.name}</h3>
                      <p className="text-sm font-medium text-brand-600">{doc.specialty}</p>
                    </div>
                  </div>
                  <p className="mb-6 line-clamp-3 rounded-lg bg-slate-50 p-3 text-sm leading-relaxed text-ink-soft">"{doc.bio}"</p>
                  <div className="mb-6 space-y-2 text-sm text-ink-soft">
                    <div className="flex items-center gap-2"><Building className="h-4 w-4 shrink-0 text-brand-500" /> <span className="truncate font-medium text-ink">{doc.hospital}</span></div>
                    <div className="flex items-center gap-2"><MapPin className="h-4 w-4 shrink-0 text-ink-muted" /> {doc.location}</div>
                  </div>
                </div>
                <div className="flex items-center justify-between border-t border-line pt-4">
                  <div>
                    <p className="text-[11px] uppercase tracking-wider text-ink-muted font-medium">Consultation Fee</p>
                    <p className="text-base font-bold text-ink">${doc.consultationFee}</p>
                  </div>
                  <Button size="sm" onClick={() => onSelectDoctor(doc)}>Book Visit</Button>
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