import { useEffect, useState } from 'react';
import { Doctor, Medicine } from './types';
import { useAuth } from './context/AuthContext';
import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';
import { AuthPage } from './components/AuthPage';
import { EmergencyBanner } from './components/EmergencyBanner';
import { Hero } from './components/Hero';
import { Features } from './components/Features';
import { SymptomCheckerTab } from './components/SymptomCheckerTab';
import { DoctorDirectoryTab } from './components/DoctorDirectoryTab';
import { MedicineDirectoryTab } from './components/MedicineDirectoryTab';
import { HealthTipsTab } from './components/HealthTipsTab';
import { DashboardView } from './components/DashboardView';
import { AppointmentBookingTab } from './components/AppointmentBookingTab';
import { MedicalReportsTab } from './components/MedicalReportsTab';
import { ChatbotWidget } from './components/ChatbotWidget';
import { Footer } from './components/Footer';
import { MessageSquare, ShieldCheck, Sparkles, HelpCircle, BrainCircuit } from 'lucide-react';
import { SectionShell, SectionHeading, Eyebrow, Button } from './components/ui';

export default function App() {
  const { user: currentUser, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('landing');
  const [authOpen, setAuthOpen] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);
  const [chatQuery, setChatQuery] = useState('');
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);
  const [, setSelectedMedicine] = useState<Medicine | null>(null);
  const [theme, setTheme] = useState<'dark' | 'light'>(() => {
    const saved = localStorage.getItem('medisage-theme');
    return saved === 'light' || saved === 'dark' ? saved : 'dark';
  });

  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'light') {
      root.classList.add('light');
    } else {
      root.classList.remove('light');
    }
    localStorage.setItem('medisage-theme', theme);
  }, [theme]);

  const go = (tab: string) => {
    setActiveTab(tab);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const queryChat = (q: string) => {
    setChatQuery(q + ' #' + Date.now());
    setChatOpen(true);
  };

  const pickDoctor = (doc: Doctor) => {
    setSelectedDoctor(doc);
    go('appointments');
  };

  const pickMedicine = (med: Medicine) => {
    setSelectedMedicine(med);
    go('medicines');
  };

  if (authOpen) {
    return (
      <AuthPage 
        onSuccess={() => { setAuthOpen(false); go('dashboard'); }} 
        onBack={() => setAuthOpen(false)} 
      />
    );
  }

  if (activeTab !== 'landing') {
    return (
      <div className="flex min-h-screen bg-slate-50/30 text-ink antialiased selection:bg-brand-200 selection:text-brand-900">
        <Sidebar
          activeTab={activeTab}
          onChangeTab={go}
          currentUser={currentUser}
          onLogout={logout}
          onOpenChat={() => setChatOpen((v) => !v)}
          chatOpen={chatOpen}
        >
          {activeTab === 'dashboard' && (
            <DashboardView
              currentUser={currentUser}
              onOpenAuth={() => setAuthOpen(true)}
              onChangeTab={go}
              onOpenChat={() => setChatOpen(true)}
            />
          )}
          {activeTab === 'symptom_checker' && (
            <SymptomCheckerTab onSelectDoctor={pickDoctor} onSelectMedicine={pickMedicine} onOpenChatWithQuery={queryChat} />
          )}
          {activeTab === 'doctors' && (
            <DoctorDirectoryTab
              onSelectDoctor={pickDoctor}
              selectedDoctor={selectedDoctor}
              onClearSelectedDoctor={() => setSelectedDoctor(null)}
            />
          )}
          {activeTab === 'medicines' && (
            <MedicineDirectoryTab
              onSelectMedicine={(med) => {
                setSelectedMedicine(med);
                alert(`Interaction details for ${med.name} accessible.`);
              }}
            />
          )}
          {activeTab === 'tips' && <HealthTipsTab />}
          {activeTab === 'appointments' && (
            <AppointmentBookingTab
              preSelectedDoctor={selectedDoctor}
              onBack={() => { setSelectedDoctor(null); go('doctors'); }}
            />
          )}
          {activeTab === 'reports' && <MedicalReportsTab />}
        </Sidebar>

        <ChatbotWidget
          isOpen={chatOpen}
          onOpenToggle={(open?: boolean) => setChatOpen(open !== undefined ? open : !chatOpen)}
          initialQuery={chatQuery}
          onSelectDoctor={pickDoctor}
          onSelectMedicine={pickMedicine}
        />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-base text-ink antialiased selection:bg-brand-400 selection:text-slate-950">
      <EmergencyBanner />
      <Navbar
        currentUser={currentUser}
        onOpenAuth={() => setAuthOpen(true)}
        onLogout={logout}
        activeTab={activeTab}
        onChangeTab={go}
        onOpenChat={() => setChatOpen((v) => !v)}
        chatOpen={chatOpen}
        theme={theme}
        onToggleTheme={() => setTheme((t) => (t === 'dark' ? 'light' : 'dark'))}
      />

      <main className="flex-1">
        {activeTab === 'landing' && (
          <div className="animate-fadeUp">
            <Hero onSearchSymptom={queryChat} onOpenChat={() => setChatOpen(true)} />

            <SectionShell className="py-8">
              <div className="surface-shadow relative overflow-hidden rounded-2xl border border-line bg-surface/70 p-8 sm:p-12">
                <div aria-hidden className="pointer-events-none absolute inset-0 bg-mesh" />
                <div className="relative flex flex-col items-center justify-between gap-8 lg:flex-row">
                  <div className="max-w-2xl space-y-3 text-center lg:text-left">
                    <Eyebrow tone="blue">
                      <BrainCircuit className="h-3.5 w-3.5" /> Claude Opus 4.8 × Medisage
                    </Eyebrow>
                    <h2 className="text-2xl font-semibold tracking-tight text-ink sm:text-4xl">
                      Instant diagnostic clarity, now with adaptive dark and light mode.
                    </h2>
                    <p className="text-md leading-relaxed text-ink-soft sm:text-lg">
                      This integrated Medisage experience combines advanced AI triage flows, live healthcare modules,
                      and a polished dual-theme system for day and night clinical use.
                    </p>
                  </div>
                  <div className="flex w-full shrink-0 flex-col gap-3 sm:flex-row lg:w-auto">
                    <Button size="lg" onClick={() => setChatOpen(true)}>
                      <MessageSquare className="h-4 w-4" /> Open AI Chat
                    </Button>
                    <Button variant="secondary" size="lg" onClick={() => go('symptom_checker')}>
                      <ShieldCheck className="h-4 w-4 text-brand-300" /> Triage Form
                    </Button>
                  </div>
                </div>
              </div>
            </SectionShell>

            <Features onOpenChat={() => setChatOpen(true)} onChangeTab={go} />

            <SectionShell className="py-16">
              <SectionHeading
                eyebrow={<Eyebrow>Verified Experiences</Eyebrow>}
                title="Praised by clinicians and patients alike."
                desc="Designed to bridge the crucial window between symptom onset and specialist consultation."
              />
              <div className="mt-14 grid grid-cols-1 gap-3 md:grid-cols-3">
                {[
                  {
                    name: 'Marcus Vance, RN',
                    role: 'Triage Nurse',
                    quote:
                      'The real-time escalation logic is precise — it accurately flags dangerous cardiac symptoms while reassuring users with mild viral issues.',
                  },
                  {
                    name: 'Elena Rostova',
                    role: 'Verified Patient',
                    quote:
                      'Being able to plug in my own Gemini key for live responses, or use the verified offline engine, gives me total privacy and peace of mind.',
                  },
                  {
                    name: 'Dr. Arthur Pendelton',
                    role: 'Chief of Neurology',
                    quote:
                      'The exported Markdown summary saves our triage nurses 10 minutes of manual charting. A fantastic operational accelerator.',
                  },
                ].map((t, i) => (
                  <figure
                    key={i}
                    className="surface-shadow flex flex-col justify-between gap-6 rounded-xl border border-line bg-raised/50 p-7 transition-all hover:border-brand-400/40 hover:bg-raised"
                  >
                    <blockquote className="text-md leading-relaxed text-ink-soft">"{t.quote}"</blockquote>
                    <figcaption className="flex items-center gap-3 border-t border-line pt-4">
                      <span className="grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-br from-brand-400 to-accent-500 text-sm font-bold text-slate-950">
                        {t.name.charAt(0)}
                      </span>
                      <div>
                        <p className="text-sm font-semibold text-ink">{t.name}</p>
                        <p className="text-xs text-brand-300">{t.role}</p>
                      </div>
                    </figcaption>
                  </figure>
                ))}
              </div>
            </SectionShell>

            <SectionShell className="py-16">
              <div className="surface-shadow rounded-2xl border border-line bg-surface/70 p-8 sm:p-12">
                <div className="mx-auto mb-12 max-w-2xl space-y-3 text-center">
                  <HelpCircle className="mx-auto h-8 w-8 text-brand-300" />
                  <h2 className="text-2xl font-semibold tracking-tight text-ink sm:text-3xl">
                    Frequently asked questions
                  </h2>
                  <p className="text-md text-ink-soft">Everything about the Claude Opus 4.8 Medisage assistant.</p>
                </div>
                <div className="mx-auto max-w-3xl space-y-3">
                  {[
                    {
                      q: 'Does the theme toggle persist?',
                      a: 'Yes. The dark/light preference is stored in localStorage and automatically restored on the next visit.',
                    },
                    {
                      q: 'Can I connect my own Gemini or OpenAI key?',
                      a: 'Yes. In the bottom-right chatbot settings, securely plug in your Gemini Flash or OpenAI key for live generation.',
                    },
                    {
                      q: 'How are medicines and doctors matched?',
                      a: 'We match clinical keywords from your symptom description against a vetted reference database, ensuring evidence-aware dosages and specialist recommendations.',
                    },
                  ].map((f, i) => (
                    <div key={i} className="rounded-xl border border-line bg-raised/40 p-6 space-y-2">
                      <h4 className="text-base font-semibold text-ink">{f.q}</h4>
                      <p className="text-md leading-relaxed text-ink-soft">{f.a}</p>
                    </div>
                  ))}
                </div>
              </div>
            </SectionShell>

            <SectionShell className="pb-20 pt-4">
              <div className="surface-shadow relative overflow-hidden rounded-2xl border border-brand-500/30 bg-gradient-to-br from-brand-500/15 via-accent-500/10 to-violet-400/10 p-10 text-center sm:p-16">
                <div
                  aria-hidden
                  className="pointer-events-none absolute inset-0 grid-lines [mask-image:radial-gradient(ellipse_60%_60%_at_50%_50%,black,transparent)]"
                />
                <div className="relative mx-auto max-w-2xl space-y-6">
                  <Sparkles className="mx-auto h-10 w-10 animate-floaty text-brand-300" />
                  <h2 className="text-3xl font-semibold leading-tight tracking-tight text-ink sm:text-5xl">
                    Ready for smarter, instant medical triage?
                  </h2>
                  <p className="text-md text-ink-soft sm:text-lg">
                    Use the floating assistant in the bottom-right corner anytime, in dark or light mode.
                  </p>
                  <div className="flex flex-col items-center justify-center gap-3 pt-2 sm:flex-row">
                    <Button size="lg" onClick={() => setChatOpen(true)}>
                      Open Bottom-Right Chatbot
                    </Button>
                    <Button variant="secondary" size="lg" onClick={() => (currentUser ? go('dashboard') : setAuthOpen(true))}>
                      {currentUser ? 'Open Dashboard' : 'Create Free Record'}
                    </Button>
                  </div>
                </div>
              </div>
            </SectionShell>
          </div>
        )}
      </main>

      <ChatbotWidget
        isOpen={chatOpen}
        onOpenToggle={(open?: boolean) => setChatOpen(open !== undefined ? open : !chatOpen)}
        initialQuery={chatQuery}
        onSelectDoctor={pickDoctor}
        onSelectMedicine={pickMedicine}
      />

      <Footer />
    </div>
  );
}
