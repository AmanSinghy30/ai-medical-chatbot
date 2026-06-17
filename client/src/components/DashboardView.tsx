import React, { useState, useEffect } from 'react';
import {
  History, Calendar, FileText, Download, Sparkles, Plus,
  Clock, CheckCircle2, AlertCircle, Stethoscope, ChevronRight, Video,
} from 'lucide-react';
import { User as UserType, ChatSession } from '../types';
import { MOCK_DOCTORS } from '../data/mockData';
import { getChats, getAppointments } from '../services/api';
import { cn } from '../utils/cn';
import { SectionShell, Eyebrow, Button } from './ui';

interface Props {
  currentUser: UserType | null;
  onOpenAuth: () => void;
  onChangeTab: (tab: string) => void;
  onOpenChat: () => void;
}

export const DashboardView: React.FC<Props> = ({ currentUser, onOpenAuth, onChangeTab, onOpenChat }) => {
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [filter, setFilter] = useState<'all' | 'recent'>('all');
  const [loading, setLoading] = useState(false);
  const [appointments, setAppointments] = useState<any[]>([]);
  const [apptsLoading, setApptsLoading] = useState(false);

  useEffect(() => {
    if (!currentUser) return;
    setLoading(true);
    getChats()
      .then(({ data }) => {
        const mapped: ChatSession[] = data.map((c: any) => ({
          id: c._id,
          title: c.title || 'Untitled Consultation',
          date: new Date(c.updatedAt).toLocaleDateString(),
          messagesCount: c.messages?.length || 0,
          summary: c.summary || 'No summary available.',
        }));
        setSessions(mapped);
      })
      .catch(() => setSessions([]))
      .finally(() => setLoading(false));

    setApptsLoading(true);
    getAppointments({ upcoming: 'true' })
      .then(({ data }) => setAppointments(data || []))
      .catch(() => setAppointments([]))
      .finally(() => setApptsLoading(false));
  }, [currentUser]);

  const mockAppts = [
    { id: 'a1', doctor: MOCK_DOCTORS[0], time: 'Today at 3:30 PM', type: 'Follow-up Triage' },
    { id: 'a2', doctor: MOCK_DOCTORS[2], time: 'Fri, Nov 02 · 10:00 AM', type: 'Skin Allergy Consult' },
  ];

  const displayAppts = appointments.length > 0 ? appointments : (!currentUser ? mockAppts : []);

  const exportSession = (s: ChatSession) => {
    const blob = new Blob([`# Medisage Encounter Report\n**ID:** ${s.id}\n**Title:** ${s.title}\n**Date:** ${s.date}\n**Interactions:** ${s.messagesCount}\n\n## Summary\n${s.summary}\n`], { type: 'text/markdown' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `encounter-${s.id}.md`;
    a.click();
  };

  return (
    <SectionShell className="py-12 animate-fadeUp space-y-10">
      <div className="relative flex flex-col items-center justify-between gap-8 overflow-hidden rounded-2xl border border-line bg-surface/70 p-8 sm:p-10 md:flex-row">
        <div aria-hidden className="pointer-events-none absolute -bottom-20 -right-20 h-72 w-72 rounded-full bg-brand-500/10 blur-3xl" />
        <div className="relative flex w-full items-center gap-6 md:w-auto">
          {currentUser ? (
            <div className="grid h-20 w-20 shrink-0 place-items-center rounded-2xl bg-gradient-to-br from-brand-400 to-accent-500 text-3xl font-bold text-[#04201d]">{currentUser.name.charAt(0)}</div>
          ) : (
            <div className="grid h-20 w-20 shrink-0 place-items-center rounded-2xl border border-line bg-raised text-3xl">👤</div>
          )}
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <Eyebrow tone="brand">{currentUser ? `Secure ${currentUser.role} portal` : 'Demo sandbox'}</Eyebrow>
              <span className="rounded-full border border-emerald-500/25 bg-emerald-500/10 px-2 py-0.5 text-[10px] font-semibold text-emerald-300">Encrypted</span>
            </div>
            <h2 className="mt-2 text-3xl font-semibold tracking-tight text-ink sm:text-4xl">{currentUser ? `Welcome back, ${currentUser.name}` : 'Patient Dashboard'}</h2>
            <p className="mt-1 flex flex-wrap gap-3 text-xs text-ink-soft sm:text-sm">
              <span>{currentUser ? currentUser.email : 'Log in to load personalized encounters'}</span>
              {currentUser?.age && <span>· Age {currentUser.age}</span>}
              {currentUser?.gender && <span>· {currentUser.gender}</span>}
            </p>
          </div>
        </div>
        <div className="relative flex w-full flex-col gap-2 md:w-auto">
          {!currentUser ? (
            <Button size="lg" onClick={onOpenAuth} className="w-full md:w-auto">Sign In to Authenticate</Button>
          ) : (
            <>
              <Button size="lg" onClick={onOpenChat} className="w-full md:w-auto"><Sparkles className="h-4 w-4" /> New AI Consult</Button>
              <Button variant="secondary" size="sm" onClick={() => onChangeTab('reports')} className="w-full md:w-auto"><FileText className="h-4 w-4" /> View Reports</Button>
            </>
          )}
        </div>
      </div>

      {currentUser && (
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          {[
            { title: 'Medical Allergies', icon: AlertCircle, tone: 'text-rose-400', items: currentUser.allergies?.length ? currentUser.allergies : ['No known severe allergies'], chip: 'border-rose-500/25 bg-rose-500/10 text-rose-300', pfx: '⚠️' },
            { title: 'Chronic Conditions', icon: FileText, tone: 'text-accent-400', items: currentUser.chronicConditions?.length ? currentUser.chronicConditions : ['No chronic conditions listed'], chip: 'border-accent-500/25 bg-accent-500/10 text-accent-400', pfx: '•' },
          ].map((c) => {
            const I = c.icon;
            return (
              <div key={c.title} className="space-y-4 rounded-xl border border-line bg-raised/50 p-7">
                <div className="flex items-center justify-between border-b border-line pb-3">
                  <h3 className={cn('flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-ink')}><I className={cn('h-4 w-4', c.tone)} /> {c.title}</h3>
                  <span className="font-mono text-xs text-ink-muted">HIPAA</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {c.items.map((it, i) => <span key={i} className={cn('rounded-xl border px-3.5 py-1.5 text-xs font-semibold', c.chip)}>{c.pfx} {it}</span>)}
                  <button onClick={() => alert('Simulated record updated!')} className="flex items-center gap-1 rounded-xl border border-line bg-white/[0.03] px-3.5 py-1.5 text-xs font-semibold text-ink-soft hover:bg-white/[0.06]">
                    <Plus className="h-3.5 w-3.5" /> Add
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <div className="space-y-6 rounded-2xl border border-line bg-raised/40 p-8 sm:p-10">
        <div className="flex items-center justify-between border-b border-line pb-4">
          <div>
            <h3 className="text-xl font-semibold tracking-tight text-ink">Upcoming Consultations</h3>
            <p className="text-xs text-ink-muted">Synchronized electronic encounters from your triage roadmap</p>
          </div>
          <button onClick={() => onChangeTab('appointments')} className="inline-flex items-center gap-1 text-xs font-semibold uppercase tracking-wider text-brand-300 hover:text-brand-200">
            Book new <ChevronRight className="h-4 w-4" />
          </button>
        </div>
        {apptsLoading && <p className="text-xs text-ink-muted">Loading appointments...</p>}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {displayAppts.map((a: any) => (
            <div key={a._id || a.id} className="space-y-4 rounded-xl border border-line bg-white/[0.02] p-6 transition-colors hover:border-accent-500/40">
              <div className="flex items-start justify-between">
                <span className="rounded-full border border-accent-500/25 bg-accent-500/10 px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-accent-400">
                  {a.type || 'Consultation'}
                </span>
                <span className="flex items-center gap-1 rounded-full border border-brand-500/25 bg-brand-500/10 px-3 py-1 text-xs font-semibold text-brand-300">
                  <Calendar className="h-3.5 w-3.5" /> {a.timeSlot || a.time || 'TBD'}
                </span>
              </div>
              <div className="flex items-center gap-4 rounded-xl border border-line bg-surface/80 p-4">
                <img src={a.doctor?.image || a.doctor?.image} alt={a.doctor?.name} className="h-14 w-14 rounded-xl object-cover" />
                <div>
                  <h4 className="text-base font-semibold text-ink">{a.doctor?.name}</h4>
                  <p className="text-xs font-medium text-accent-400">{a.doctor?.specialty}</p>
                  <p className="mt-0.5 text-[11px] text-ink-muted">{a.doctor?.hospital}</p>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className={cn('flex items-center gap-1 text-xs font-semibold',
                  a.status === 'confirmed' ? 'text-emerald-300' : 'text-amber-300')}>
                  <CheckCircle2 className="h-4 w-4" /> {a.status || 'Meeting ready'}
                </span>
                <Button size="sm" onClick={() => a.type === 'telehealth' ? alert('Telehealth room unlocks 10 min prior.') : alert('In-person visit at ' + (a.doctor?.hospital || 'the clinic'))}>
                  {a.type === 'telehealth' ? <Video className="h-3 w-3 mr-1" /> : null} Join / Details
                </Button>
              </div>
            </div>
          ))}
        </div>
        {displayAppts.length === 0 && !apptsLoading && (
          <p className="text-sm text-ink-muted">No upcoming appointments. <button onClick={() => onChangeTab('appointments')} className="underline text-brand-300">Book one now</button>.</p>
        )}
      </div>

      <div className="space-y-6 rounded-2xl border border-line bg-raised/40 p-8 sm:p-10">
        <div className="flex flex-col justify-between gap-4 border-b border-line pb-4 sm:flex-row sm:items-center">
          <div>
            <h3 className="flex items-center gap-2 text-xl font-semibold tracking-tight text-ink"><History className="h-5 w-5 text-brand-300" /> Chat Consultation History</h3>
            <p className="text-xs text-ink-muted">Every diagnosis, medicine match, and follow-up persisted</p>
          </div>
          <div className="flex gap-2">
            {[['all', 'All'], ['recent', 'Recent']].map(([id, label]) => (
              <button key={id} onClick={() => setFilter(id as any)}
                className={cn('rounded-lg px-4 py-2 text-xs font-semibold transition-all',
                  filter === id ? 'bg-gradient-to-r from-brand-400 to-accent-500 text-[#04201d]' : 'bg-white/[0.04] text-ink-soft hover:bg-white/[0.08]')}
                disabled={loading}>
                {label}
              </button>
            ))}
          </div>
        </div>
        <div className="space-y-4">
          {loading && <p className="text-xs text-ink-muted">Loading history...</p>}
          {!loading && (filter === 'recent' ? sessions.slice(0, 1) : sessions).map((s) => (
            <div key={s.id} className="flex flex-col items-start justify-between gap-6 rounded-xl border border-line bg-white/[0.02] p-6 transition-colors hover:border-brand-400/40 md:flex-row md:items-center">
              <div className="min-w-0 flex-1 space-y-2">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="rounded-md bg-white/[0.06] px-2.5 py-0.5 font-mono text-xs font-semibold text-ink-muted">{s.id}</span>
                  <span className="flex items-center gap-1 text-xs text-ink-muted"><Clock className="h-3 w-3" /> {s.date}</span>
                  <span className="rounded border border-brand-500/25 bg-brand-500/10 px-2.5 py-0.5 text-xs font-semibold text-brand-300">{s.messagesCount} exchanges</span>
                </div>
                <h4 className="text-lg font-semibold tracking-tight text-ink">{s.title}</h4>
                <p className="rounded-xl border border-line bg-base/40 p-3 text-sm leading-relaxed text-ink-soft">
                  <span className="font-semibold text-ink">Summary:</span> {s.summary}
                </p>
              </div>
              <div className="flex w-full shrink-0 justify-end gap-3 md:w-auto md:flex-col">
                <Button variant="secondary" size="sm" onClick={() => exportSession(s)} className="flex-1 md:flex-none"><Download className="h-4 w-4 text-brand-300" /> Export</Button>
                <Button size="sm" onClick={() => { alert(`Restoring context for "${s.title}"...`); onOpenChat(); }} className="flex-1 md:flex-none"><Stethoscope className="h-4 w-4" /> Resume</Button>
              </div>
            </div>
          ))}
          {!loading && sessions.length === 0 && (
            <p className="text-sm text-ink-muted">No chat history yet. Start a new AI consultation to see it here.</p>
          )}
        </div>
      </div>
    </SectionShell>
  );
};