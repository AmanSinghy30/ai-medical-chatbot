import React, { useState } from 'react';
import {
  ChevronRight, CheckCircle2, RotateCcw, Stethoscope, PhoneCall,
  Sparkles, HeartPulse, ListChecks, BookOpen, AlertTriangle, Activity,
} from 'lucide-react';
import { Doctor, Medicine } from '../types';
import { analyzeSymptoms } from '../services/api';
import { getDoctors } from '../services/api';
import { getMedicines } from '../services/api';
import { cn } from '../utils/cn';
import { SectionShell, Eyebrow, Button } from './ui';

interface Props {
  onSelectDoctor?: (doc: Doctor) => void;
  onSelectMedicine?: (med: Medicine) => void;
  onOpenChatWithQuery?: (query: string) => void;
}

export const SymptomCheckerTab: React.FC<Props> = ({ onSelectDoctor, onSelectMedicine, onOpenChatWithQuery }) => {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [region, setRegion] = useState('Head & Neck');
  const [symptoms, setSymptoms] = useState<string[]>([]);
  const [pain, setPain] = useState(5);
  const [duration, setDuration] = useState('24-48 Hours');
  const [pregnant, setPregnant] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<any>(null);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [analyzing, setAnalyzing] = useState(false);

  const regions = ['Head & Neck', 'Chest & Respiratory', 'Abdomen & GI', 'Skin & Limbs', 'General / Fever'];
  const symMap: Record<string, string[]> = {
    'Head & Neck': ['Severe Throbbing Headache', 'Stiff Neck', 'Sore Throat', 'Dizziness / Vertigo', 'Earache'],
    'Chest & Respiratory': ['Persistent Dry Cough', 'Shortness of Breath', 'Chest Tightness', 'Wheezing', 'Heart Palpitations'],
    'Abdomen & GI': ['Sharp Lower-Right Pain', 'Nausea & Vomiting', 'Acid Reflux', 'Severe Diarrhea', 'Bloating'],
    'Skin & Limbs': ['Sudden Red Rash', 'Joint Swelling', 'Muscle Cramp', 'Itchy Patches', 'Ankle Sprain'],
    'General / Fever': ['High Fever (>102°F)', 'Chills & Night Sweats', 'Extreme Fatigue', 'Weight Loss', 'Loss of Appetite'],
  };

  const toggle = (s: string) => setSymptoms((p) => (p.includes(s) ? p.filter((x) => x !== s) : [...p, s]));

  const generateRoadmap = async () => {
    setAnalyzing(true);
    try {
      const { data } = await analyzeSymptoms({ symptoms, pain, duration, pregnant });
      setAnalysisResult(data);
      
      const docRes = await getDoctors({ specialty: data.doctorSpecialties?.[0] });
      const medRes = await getMedicines({ category: data.medCategories?.[0] });
      
      const mappedDocs = docRes.data.map((d: any) => ({
        id: d._id, name: d.name, specialty: d.specialty, experience: d.experience,
        rating: d.rating, reviewsCount: d.reviewsCount, hospital: d.hospital,
        location: d.location, consultationFee: d.consultationFee,
        availableNext: d.availableNext, image: d.image, bio: d.bio,
      }));
      
      const mappedMeds = medRes.data.map((m: any) => ({
        id: m._id, name: m.name, genericName: m.genericName, type: m.type,
        category: m.category, recommendedDosage: m.recommendedDosage,
        sideEffects: m.sideEffects || [], precautions: m.precautions,
        isOTC: m.isOTC, price: m.price,
      }));
      
      setDoctors(mappedDocs.slice(0, 4));
      setMedicines(mappedMeds.slice(0, 4));
      setStep(3);
    } catch (error) {
      console.error('Analysis failed:', error);
      setAnalysisResult({
        severity: 'Moderate',
        summary: 'Acute systemic or infectious condition suspected. Prompt GP evaluation advised.',
        plan: ['Isolate and rest', 'Oral rehydration fluids', 'Acetaminophen 500mg for temperature', 'Monitor for 24 hours'],
      });
      setDoctors([]);
      setMedicines([]);
      setStep(3);
    } finally {
      setAnalyzing(false);
    }
  };

  const launchChat = () => {
    onOpenChatWithQuery?.(`I used the Symptom Checker. Symptoms: ${symptoms.join(', ')}. Pain ${pain}/10, duration ${duration}${pregnant ? ', pregnancy active' : ''}. What is my clinical roadmap?`);
  };

  const severity = analysisResult?.severity || 'Low';
  const summary = analysisResult?.summary || 'Mild self-limiting discomfort. Rest and general home self-care recommended.';
  const plan = analysisResult?.plan || ['Drink 8–10 glasses of water daily', 'Light stretching and rest', 'Paracetamol if mild headache'];
  const docs = doctors;
  const meds = medicines;
  const conditions = analysisResult?.possibleConditions || [];
  const knowledgeSources = analysisResult?.knowledgeSources || [];
  const urgency = analysisResult?.urgency || '';
  const specialties = analysisResult?.doctorSpecialties || [];

  const sevColor = severity === 'urgent' ? 'rose' : severity === 'high' ? 'amber' : severity === 'moderate' ? 'amber' : 'brand';
  const sevBorder = sevColor === 'rose' ? 'border-rose-500/40' : sevColor === 'amber' ? 'border-amber-500/30' : 'border-brand-500/30';
  const sevBg = sevColor === 'rose' ? 'bg-rose-500/[0.06]' : sevColor === 'amber' ? 'bg-amber-500/[0.05]' : 'bg-brand-500/[0.05]';
  const sevBadge = sevColor === 'rose' ? 'animate-pulse border-rose-200 bg-rose-50 text-rose-700' : sevColor === 'amber' ? 'border-amber-200 bg-amber-50 text-amber-700' : 'border-brand-200 bg-brand-50 text-brand-700';
  const urgencyColor = severity === 'urgent' ? 'border-rose-200 bg-rose-50 text-rose-700' : 'border-amber-200 bg-amber-50 text-amber-700';

  return (
    <SectionShell className="py-12 pb-32 animate-fadeUp">
      {/* Banner */}
      <div className="mb-10 flex flex-col items-center justify-between gap-6 rounded-2xl border border-slate-200 bg-surface/70 p-8 md:flex-row">
        <div className="space-y-3 text-center md:text-left">
          <Eyebrow><Sparkles className="h-3.5 w-3.5" /> Clinical Questionnaire</Eyebrow>
          <h2 className="text-3xl font-semibold tracking-tight text-ink sm:text-4xl">Interactive Symptom Checker</h2>
          <p className="max-w-2xl text-md leading-relaxed text-ink-soft">
            Select your body region and signs. Our RAG-powered diagnostic engine synthesizes possible conditions, confidence scores, and specialist recommendations.
          </p>
        </div>
        <Button variant="secondary" onClick={() => { setStep(1); setSymptoms([]); setPain(5); setAnalysisResult(null); }}>
          <RotateCcw className="h-4 w-4" /> Reset
        </Button>
      </div>

      {/* Steps */}
      <div className="mb-10 flex justify-center">
        <div className="inline-flex flex-wrap items-center gap-1.5 rounded-2xl border border-slate-200 bg-raised/60 p-1.5">
          {[[1, '1 · Region & Signs'], [2, '2 · Parameters'], [3, '3 · Roadmap']].map(([s, label]) => (
            <button key={s as number} onClick={() => { if ((s as number) <= step || symptoms.length) setStep(s as 1 | 2 | 3); }}
              className={cn('rounded-xl px-4 py-2 text-xs font-semibold transition-all',
                step === s ? 'bg-brand-50 hover:bg-brand-100 text-brand-700 border border-brand-200'
                  : (s as number) < step ? 'bg-white/[0.06] text-ink' : 'text-ink-muted hover:text-ink-soft')}>
              {label as string}
            </button>
          ))}
        </div>
      </div>

      {/* Step 1 */}
      {step === 1 && (
        <div className="grid grid-cols-1 gap-8 rounded-2xl border border-slate-200 bg-raised/40 p-6 sm:p-8 lg:grid-cols-12">
          <div className="space-y-2 lg:col-span-4">
            <h3 className="mb-3 px-1 text-xs font-semibold uppercase tracking-wider text-ink-muted">Target Region</h3>
            {regions.map((r) => (
              <button key={r} onClick={() => setRegion(r)}
                className={cn('flex w-full items-center justify-between rounded-xl border p-4 text-left text-sm font-semibold transition-all',
                  region === r ? 'border-brand-500 bg-brand-50 text-brand-700 shadow-sm' : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50')}>
                {r} <ChevronRight className={cn('h-4 w-4', region === r ? 'text-brand-700' : 'text-ink-muted')} />
              </button>
            ))}
          </div>

          <div className="space-y-6 lg:col-span-8">
            <div className="flex items-center justify-between border-b border-slate-200 pb-4">
              <div>
                <h3 className="text-lg font-semibold text-ink">Symptoms for <span className="text-brand-700 font-bold">{region}</span></h3>
                <p className="text-xs text-ink-muted">Check all that match your current condition</p>
              </div>
              <span className="rounded-full border border-brand-200 bg-brand-50 px-3 py-1 text-xs font-semibold text-brand-700">{symptoms.length} selected</span>
            </div>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {symMap[region].map((s) => {
                const checked = symptoms.includes(s);
                return (
                  <button key={s} onClick={() => toggle(s)}
                    className={cn('flex items-center gap-3 rounded-xl border p-4 text-left transition-all',
                      checked ? 'border-brand-300 bg-brand-50/50 text-slate-900' : 'border-slate-200 bg-white text-slate-600 hover:border-brand-200')}>
                    <span className={cn('grid h-6 w-6 shrink-0 place-items-center rounded-lg border', checked ? 'border-brand-500 bg-brand-500 text-white' : 'border-slate-300')}>
                      {checked && <CheckCircle2 className="h-4 w-4" />}
                    </span>
                    <span className="text-sm font-semibold leading-tight">{s}</span>
                  </button>
                );
              })}
            </div>
            <div className="flex items-center justify-between border-t border-slate-200 pt-6">
              <span className="text-xs text-ink-muted">{symptoms.length === 0 ? 'Select at least one symptom' : 'Ready for parameters'}</span>
              <Button size="lg" disabled={!symptoms.length} onClick={() => setStep(2)}>Continue <ChevronRight className="h-4 w-4" /></Button>
            </div>
          </div>
        </div>
      )}

      {/* Step 2 */}
      {step === 2 && (
        <div className="mx-auto max-w-3xl animate-fadeUp space-y-8 rounded-2xl border border-slate-200 bg-raised/40 p-8 sm:p-10">
          <div className="border-b border-slate-200 pb-4">
            <h3 className="text-xl font-semibold text-ink">Clinical Severity & Biometrics</h3>
            <p className="text-xs text-ink-muted">Helps build a precise diagnostic roadmap</p>
          </div>

          <div className="space-y-4 rounded-xl border border-slate-200 bg-slate-50 p-6">
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 text-sm font-semibold text-ink"><HeartPulse className="h-4 w-4 text-rose-400" /> Pain severity (1–10)</label>
              <span className={cn('rounded-lg border px-3 py-1 font-mono text-xs font-bold',
                pain >= 8 ? 'border-rose-200 bg-rose-50 text-rose-700' : pain >= 5 ? 'border-amber-200 bg-amber-50 text-amber-700' : 'border-emerald-200 bg-emerald-50 text-emerald-700')}>
                {pain}/10 · {pain >= 8 ? 'Severe' : pain >= 5 ? 'Moderate' : 'Mild'}
              </span>
            </div>
            <input type="range" min={1} max={10} value={pain} onChange={(e) => setPain(+e.target.value)} className="h-2 w-full cursor-pointer rounded-lg accent-brand-400" />
            <div className="flex justify-between text-[11px] font-semibold text-ink-muted"><span>1 · barely</span><span>5 · distracting</span><span>10 · unbearable</span></div>
          </div>

          <div className="space-y-3">
            <label className="block text-xs font-semibold uppercase tracking-wider text-ink-soft">How long have symptoms lasted?</label>
            <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4">
              {['Less than 24h', '24-48 Hours', '1-2 Weeks', 'Over a month'].map((d) => (
                <button key={d} onClick={() => setDuration(d)}
                  className={cn('rounded-xl border py-3 text-xs font-semibold transition-all',
                    duration === d ? 'border-brand-400/50 bg-brand-500/15 text-brand-700' : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50')}>
                  {d}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 p-4">
            <div>
              <p className="text-sm font-semibold text-ink">Pregnancy indicator</p>
              <p className="text-xs text-ink-muted">Changes medication safety boundaries</p>
            </div>
            <button onClick={() => setPregnant((v) => !v)}
              className={cn('rounded-xl border px-4 py-2 text-xs font-semibold transition-all',
                pregnant ? 'border-rose-300 bg-rose-50 text-rose-700 shadow-sm' : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50')}>
              {pregnant ? 'Yes (active)' : 'No / N/A'}
            </button>
          </div>

          <div className="flex items-center justify-between border-t border-slate-200 pt-4">
            <Button variant="secondary" onClick={() => setStep(1)}>Back</Button>
            <Button size="lg" onClick={generateRoadmap} disabled={analyzing}>
              {analyzing ? 'Analyzing via RAG...' : 'Generate Roadmap'} <Sparkles className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Step 3 - Enhanced with Possible Conditions + RAG Sources */}
      {step === 3 && (
        <div className="mx-auto max-w-4xl animate-fadeUp space-y-8">
          {/* Triage Header */}
          <div className={cn('space-y-6 rounded-2xl border p-8 sm:p-10', sevBorder, sevBg)}>
            <div className="flex items-center justify-between border-b border-slate-200 pb-4">
              <span className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-brand-700">
                <ListChecks className="h-4 w-4" /> RAG-Enhanced Triage Synthesis
              </span>
              <span className={cn('rounded-full border px-3 py-1 text-xs font-bold uppercase', sevBadge)}>
                {severity} priority
              </span>
            </div>

            <div>
              <h3 className="text-2xl font-semibold tracking-tight text-ink sm:text-3xl">Assessment Summary</h3>
              <p className="mt-3 text-md leading-relaxed text-ink-soft sm:text-lg">{summary}</p>
              {urgency && (
                <div className={cn('mt-4 rounded-xl border p-4 text-sm', urgencyColor)}>
                  <strong>Urgency:</strong> {urgency}
                </div>
              )}
            </div>

            {/* Possible Conditions with Confidence */}
            {conditions.length > 0 && (
              <div className="space-y-4 rounded-xl border border-slate-200 bg-base/40 p-6">
                <h4 className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-brand-700">
                  <Activity className="h-4 w-4" /> Possible Conditions (Not Definitive)
                </h4>
                <p className="text-xs text-ink-muted">These are AI-assisted preliminary assessments with confidence scores. Always consult a physician for definitive diagnosis.</p>
                <div className="space-y-4">
                  {conditions.map((c: any, i: number) => {
                    const pct = Math.round(c.confidence * 100);
                    const barColor = pct >= 70 ? 'bg-brand-400' : pct >= 40 ? 'bg-amber-400' : 'bg-ink-muted';
                    const cSevColor = c.severity === 'urgent' ? 'text-rose-700' : c.severity === 'high' ? 'text-amber-700' : 'text-emerald-700';
                    return (
                      <div key={i} className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <span className="grid h-6 w-6 place-items-center rounded-full border border-brand-200 bg-brand-50 text-xs font-bold text-brand-700">{i + 1}</span>
                            <h5 className="text-sm font-semibold text-ink">{c.name}</h5>
                          </div>
                          <span className={cn('text-xs font-semibold', cSevColor)}>{c.severity}</span>
                        </div>
                        <div className="mb-2">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-xs text-ink-muted">Confidence</span>
                            <span className="text-xs font-bold text-ink">{pct}%</span>
                          </div>
                          <div className="h-2.5 w-full rounded-full bg-slate-200 overflow-hidden">
                            <div className={cn('h-full rounded-full transition-all duration-700', barColor)} style={{ width: `${pct}%` }} />
                          </div>
                        </div>
                        {c.description && <p className="text-xs text-ink-soft leading-relaxed">{c.description}</p>}
                        {c.precautions && (
                          <div className="mt-2 rounded-lg border border-amber-200 bg-amber-50 p-2 text-[11px] text-amber-700">
                            <AlertTriangle className="h-3 w-3 inline mr-1" /> {c.precautions}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Recommended Specialties */}
            {specialties.length > 0 && (
              <div className="rounded-xl border border-slate-200 bg-base/40 p-6">
                <h4 className="mb-3 text-xs font-semibold uppercase tracking-wider text-blue-700">Recommended Specialists</h4>
                <div className="flex flex-wrap gap-2">
                  {specialties.map((spec: string, i: number) => (
                    <span key={i} className="rounded-xl border border-accent-500/25 bg-accent-500/10 px-3 py-1.5 text-xs font-semibold text-blue-700">
                      {spec}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Self-Care Plan */}
            <div className="space-y-3 rounded-xl border border-slate-200 bg-base/40 p-6">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-brand-700">Self-Care Action Roadmap</h4>
              <ul className="space-y-2">
                {plan.map((p: string, i: number) => (
                  <li key={i} className="flex items-start gap-2.5 text-sm text-ink-soft">
                    <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-400" /> <span className="font-medium">{p}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* RAG Knowledge Sources */}
            {knowledgeSources.length > 0 && (
              <div className="rounded-xl border border-slate-200 bg-base/40 p-6">
                <h4 className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-amber-700">
                  <BookOpen className="h-4 w-4" /> RAG Knowledge Sources
                </h4>
                <div className="space-y-2">
                  {knowledgeSources.map((src: any, i: number) => (
                    <div key={i} className="flex items-center justify-between rounded-lg border border-slate-200 bg-slate-50 p-3">
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-semibold text-ink">{src.disease}</p>
                        <p className="text-[11px] text-ink-muted truncate">{src.description}</p>
                      </div>
                      <span className="text-xs font-semibold text-brand-700">{Math.round(src.confidence * 100)}%</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="flex flex-col gap-4 pt-2 sm:flex-row">
              <Button size="lg" onClick={launchChat} className="w-full sm:w-auto">
                <Stethoscope className="h-4 w-4" /> Open AI Chat with this profile
              </Button>
              {severity === 'urgent' && (
                <a href="tel:911" className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-danger px-6 py-3.5 text-md font-semibold text-white transition-all hover:brightness-110 sm:w-auto">
                  <PhoneCall className="h-4 w-4" /> Call 911 Now
                </a>
              )}
            </div>
          </div>

          {/* Doctors */}
          <div className="space-y-6 rounded-2xl border border-slate-200 bg-raised/40 p-8">
            <div className="flex items-center justify-between border-b border-slate-200 pb-4">
              <h4 className="text-lg font-semibold text-ink">Priority Specialists</h4>
              <span className="rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">Verified network</span>
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {docs.map((doc) => (
                <div key={doc.id} className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 p-4 transition-colors hover:border-blue-300">
                  <div className="flex items-center gap-3">
                    <img src={doc.image} alt={doc.name} className="h-14 w-14 rounded-xl object-cover" />
                    <div>
                      <h5 className="text-sm font-semibold text-ink">{doc.name}</h5>
                      <p className="text-xs font-medium text-blue-700">{doc.specialty}</p>
                      <p className="mt-0.5 text-[10px] text-ink-muted">⭐ {doc.rating} · {doc.availableNext}</p>
                    </div>
                  </div>
                  {onSelectDoctor && <Button size="sm" onClick={() => onSelectDoctor(doc)}>Book</Button>}
                </div>
              ))}
            </div>
          </div>

          {/* Medicines */}
          <div className="space-y-6 rounded-2xl border border-slate-200 bg-raised/40 p-8">
            <div className="flex items-center justify-between border-b border-slate-200 pb-4">
              <h4 className="text-lg font-semibold text-ink">Suggested Medicines</h4>
              <span className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">Formulation safe</span>
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {meds.map((med) => (
                <div key={med.id} className="flex flex-col gap-3 rounded-xl border border-slate-200 bg-slate-50 p-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <h5 className="text-sm font-semibold text-ink">{med.name}</h5>
                      <p className="text-xs text-ink-muted">{med.genericName} · <span className="text-brand-700">{med.type}</span></p>
                    </div>
                    <span className="text-xs font-semibold text-ink">{med.price}</span>
                  </div>
                  <p className="rounded-lg border border-slate-200 bg-base/40 p-2.5 text-xs leading-relaxed text-ink-soft">
                    <span className="font-semibold text-ink">Dosage:</span> {med.recommendedDosage}
                  </p>
                  {onSelectMedicine && (
                    <button onClick={() => onSelectMedicine(med)}
                      className="w-full rounded-lg border border-emerald-200 bg-emerald-50 py-2 text-xs font-semibold text-emerald-700 transition-colors hover:bg-emerald-100">
                      Review interactions
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="text-center">
            <button onClick={() => { setStep(1); setSymptoms([]); setAnalysisResult(null); }} className="text-xs font-semibold text-ink-soft underline underline-offset-2 hover:text-ink">
              Start a new checklist
            </button>
          </div>
        </div>
      )}
    </SectionShell>
  );
};