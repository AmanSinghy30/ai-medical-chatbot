import React, { useState, useEffect } from 'react';
import { Star, MapPin, Building, Search, Filter, Calendar, Clock, Check, X } from 'lucide-react';
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

  const filtered = doctors.filter((d) =>
    (d.name.toLowerCase().includes(search.toLowerCase()) || d.hospital.toLowerCase().includes(search.toLowerCase())) &&
    (filter === 'All Specialties' || d.specialty === filter)
  );

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

      {selectedDoctor && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-base/70 p-4 backdrop-blur-md animate-fadeUp">
          <div className="w-full max-w-lg space-y-6 rounded-2xl border border-line bg-surface p-6 shadow-2xl sm:p-8">
            <div className="flex items-start justify-between border-b border-line pb-4">
              <div>
                <Eyebrow tone="blue">Live Consultation</Eyebrow>
                <h3 className="mt-2 text-2xl font-semibold tracking-tight text-ink">Book Encounter</h3>
              </div>
              <button onClick={onClearSelectedDoctor} className="grid h-8 w-8 place-items-center rounded-full bg-white/5 text-ink-soft hover:bg-white/10 hover:text-ink"><X className="h-4 w-4" /></button>
            </div>
            <div className="flex items-center gap-4 rounded-xl border border-line bg-raised p-4">
              <img src={selectedDoctor.image} alt={selectedDoctor.name} className="h-16 w-16 rounded-xl object-cover" />
              <div>
                <h4 className="text-base font-semibold text-ink">{selectedDoctor.name}</h4>
                <p className="text-xs font-medium text-accent-400">{selectedDoctor.specialty}</p>
                <p className="mt-1 flex items-center gap-1 text-xs text-ink-muted"><Building className="h-3.5 w-3.5" /> {selectedDoctor.hospital}</p>
              </div>
            </div>
            {booked ? (
              <div className="space-y-2 rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-6 text-center">
                <div className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-emerald-500 text-white"><Check className="h-6 w-6" /></div>
                <h4 className="text-lg font-semibold text-emerald-200">Appointment Confirmed!</h4>
                <p className="text-xs text-emerald-300/80">A secure calendar invite was added to your patient portal.</p>
              </div>
            ) : (
              <form onSubmit={book} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  {[[Calendar, 'Date', selectedDoctor.availableNext.split(' at ')[0] || 'Tomorrow'], [Clock, 'Time', selectedDoctor.availableNext.split(' at ')[1] || '3:30 PM']].map(([Icon, label, val]) => {
                    const I = Icon as React.ComponentType<{ className?: string }>;
                    return (
                      <div key={label as string} className="space-y-1">
                        <label className="flex items-center gap-1 text-xs font-semibold uppercase tracking-wider text-ink-soft"><I className="h-3.5 w-3.5 text-accent-400" /> {label as string}</label>
                        <input readOnly value={val as string} className="w-full rounded-lg border border-line bg-base/60 px-3 py-2.5 text-xs font-semibold text-ink" />
                      </div>
                    );
                  })}
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold uppercase tracking-wider text-ink-soft">Reason for consult</label>
                  <textarea rows={2} placeholder="Mention your signs or AI triage result..." className="w-full rounded-lg border border-line bg-base/60 p-3 text-xs text-ink placeholder:text-ink-muted focus:border-accent-400 focus:outline-none" />
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
        </div>
      )}

      <div className="mb-10 flex flex-col items-center justify-between gap-4 rounded-2xl border border-line bg-raised/40 p-4 md:flex-row">
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3.5 top-3 h-4 w-4 text-ink-muted" />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search doctor or hospital..."
            className="w-full rounded-lg border border-line bg-base/60 py-2.5 pl-10 pr-4 text-xs font-medium text-ink placeholder:text-ink-muted focus:border-accent-400 focus:outline-none" />
        </div>
        <div className="thin-scroll flex w-full items-center gap-1.5 overflow-x-auto pb-1 md:w-auto md:pb-0">
          <Filter className="ml-1 h-4 w-4 shrink-0 text-ink-muted" />
          {specialties.map((s) => (
            <button key={s} onClick={() => setFilter(s)}
              className={cn('shrink-0 rounded-lg border px-3 py-1.5 text-xs font-semibold transition-all',
                filter === s ? 'border-accent-500/40 bg-accent-500/15 text-accent-400' : 'border-line bg-white/[0.02] text-ink-soft hover:bg-white/[0.05]')}
              disabled={loading}>
              {s}
            </button>
          ))}
        </div>
      </div>

      {loading && <p className="text-sm text-ink-muted">Loading doctors...</p>}
      <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
        {filtered.map((doc) => (
          <div key={doc.id} className="group flex flex-col justify-between rounded-xl border border-line bg-raised/50 p-6 transition-all duration-fast hover:border-accent-500/40 hover:bg-raised">
            <div>
              <div className="mb-4 flex items-start gap-4">
                <img src={doc.image} alt={doc.name} className="h-20 w-20 rounded-xl object-cover transition-transform group-hover:scale-105" />
                <div>
                  <span className="mb-1 inline-flex items-center gap-1 rounded-lg border border-amber-500/25 bg-amber-500/10 px-2 py-0.5 text-xs font-semibold text-amber-300">
                    <Star className="h-3 w-3 fill-amber-400 text-amber-400" /> {doc.rating} <span className="text-ink-muted">({doc.reviewsCount})</span>
                  </span>
                  <h3 className="text-base font-semibold text-ink transition-colors group-hover:text-accent-400">{doc.name}</h3>
                  <p className="text-xs font-medium text-accent-400">{doc.specialty}</p>
                </div>
              </div>
              <p className="mb-6 line-clamp-3 rounded-xl border border-line bg-white/[0.02] p-3 text-xs leading-relaxed text-ink-soft">"{doc.bio}"</p>
              <div className="mb-6 space-y-2 text-xs text-ink-soft">
                <div className="flex items-center gap-2"><Building className="h-4 w-4 shrink-0 text-accent-400" /> <span className="truncate font-semibold text-ink">{doc.hospital}</span></div>
                <div className="flex items-center gap-2"><MapPin className="h-4 w-4 shrink-0 text-ink-muted" /> {doc.location}</div>
              </div>
            </div>
            <div className="flex items-center justify-between border-t border-line pt-4">
              <div>
                <p className="text-[10px] uppercase tracking-wider text-ink-muted">Fee / session</p>
                <p className="text-sm font-semibold text-ink">${doc.consultationFee}.00</p>
              </div>
              <Button size="sm" onClick={() => onSelectDoctor(doc)}>Book live →</Button>
            </div>
          </div>
        ))}
      </div>
    </SectionShell>
  );
};